using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using OptimaVoucherApi.Data;
using OptimaVoucherApi.Models;
using OptimaVoucherApi.Common;

namespace OptimaVoucherApi.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly AppDbContext _db;
    public CartController(AppDbContext db) => _db = db;

    private int CurrentUserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var items = await _db.CartItems.Include(c => c.Voucher)
            .Where(c => c.UserId == CurrentUserId).ToListAsync();
        return Ok(new ApiResponse<object> { Success = true, Data = items });
    }

    [HttpPost]
    public async Task<IActionResult> AddToCart([FromBody] AddCartRequest req)
    {
        var existing = await _db.CartItems.FirstOrDefaultAsync(c =>
            c.UserId == CurrentUserId && c.VoucherId == req.VoucherId);

        if (existing != null) existing.Quantity += req.Quantity;
        else _db.CartItems.Add(new CartItem { UserId = CurrentUserId, VoucherId = req.VoucherId, Quantity = req.Quantity });

        await _db.SaveChangesAsync();
        return Ok(new ApiResponse<object> { Success = true, Message = "Added to cart" });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateQuantity(int id, [FromBody] int quantity)
    {
        var item = await _db.CartItems.FirstOrDefaultAsync(c => c.Id == id && c.UserId == CurrentUserId);
        if (item == null) return NotFound();
        item.Quantity = quantity;
        await _db.SaveChangesAsync();
        return Ok(new ApiResponse<object> { Success = true });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Remove(int id)
    {
        var item = await _db.CartItems.FirstOrDefaultAsync(c => c.Id == id && c.UserId == CurrentUserId);
        if (item == null) return NotFound();
        _db.CartItems.Remove(item);
        await _db.SaveChangesAsync();
        return Ok(new ApiResponse<object> { Success = true });
    }
}

public record AddCartRequest(int VoucherId, int Quantity);