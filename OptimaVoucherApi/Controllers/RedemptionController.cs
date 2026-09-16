using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using OptimaVoucherApi.Data;
using OptimaVoucherApi.Models;
using OptimaVoucherApi.Common;

namespace OptimaVoucherApi.Controllers;

[ApiController]
[Route("api/redemption")]
[Authorize]
public class RedemptionController : ControllerBase
{
    private readonly AppDbContext _db;
    public RedemptionController(AppDbContext db) => _db = db;
    private int CurrentUserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpPost("checkout")]
    public async Task<IActionResult> CheckoutCart()
    {
        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var user = await _db.Users.FindAsync(CurrentUserId);
            var cartItems = await _db.CartItems.Include(c => c.Voucher)
                .Where(c => c.UserId == CurrentUserId).ToListAsync();

            if (!cartItems.Any())
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Cart is empty" });

            int totalPoints = cartItems.Sum(c => c.Voucher!.PointsCost * c.Quantity);
            if (user!.Points < totalPoints)
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Insufficient points" });

            var newLogs = new List<RedemptionLog>();

            foreach (var item in cartItems)
            {
                if (item.Voucher!.StockQuantity < item.Quantity)
                    return BadRequest(new ApiResponse<object> { Success = false, Message = $"{item.Voucher.Title} out of stock" });

                item.Voucher.StockQuantity -= item.Quantity;
                var log = new RedemptionLog
                {
                    UserId = CurrentUserId,
                    VoucherId = item.VoucherId,
                    Quantity = item.Quantity,
                    PointsDeducted = item.Voucher.PointsCost * item.Quantity
                };
                _db.RedemptionLogs.Add(log);
                newLogs.Add(log);
            }

            user.Points -= totalPoints;
            _db.CartItems.RemoveRange(cartItems);

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            var redeemedItems = newLogs.Select(l => new
            {
                l.Id,
                VoucherTitle = cartItems.First(c => c.VoucherId == l.VoucherId).Voucher!.Title
            });

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Redemption successful",
                Data = new { remainingPoints = user.Points, redeemedItems }
            });
        }
        catch
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new ApiResponse<object> { Success = false, Message = "Redemption failed" });
        }
    }

    [HttpGet("{id}/pdf")]
    public async Task<IActionResult> DownloadPdf(int id)
    {
        var log = await _db.RedemptionLogs
            .Include(l => l.Voucher)
            .FirstOrDefaultAsync(l => l.Id == id && l.UserId == CurrentUserId);

        if (log == null || log.Voucher == null)
            return NotFound(new ApiResponse<object> { Success = false, Message = "Redemption not found" });

        var pdfBytes = Services.PdfGenerator.GenerateVoucherPdf(log, log.Voucher);
        return File(pdfBytes, "application/pdf", $"voucher-{id}.pdf");
    }
}