using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OptimaVoucherApi.Data;
using OptimaVoucherApi.Common;

namespace OptimaVoucherApi.Controllers;

[ApiController]
[Route("api/vouchers")]
public class VouchersController : ControllerBase
{
    private readonly AppDbContext _db;
    public VouchersController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll(
    [FromQuery] string? search,
    [FromQuery] int? categoryId,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 12)
    {
        var query = _db.Vouchers.Include(v => v.Category).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(v => v.Title.Contains(search));

        if (categoryId.HasValue)
            query = query.Where(v => v.CategoryId == categoryId.Value);

        var totalCount = await query.CountAsync();

        var vouchers = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = new { items = vouchers, totalCount, page, pageSize }
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var voucher = await _db.Vouchers.Include(v => v.Category).FirstOrDefaultAsync(v => v.Id == id);
        if (voucher == null) return NotFound(new ApiResponse<object> { Success = false, Message = "Not found" });
        return Ok(new ApiResponse<object> { Success = true, Data = voucher });
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _db.VoucherCategories.ToListAsync();
        return Ok(new ApiResponse<object> { Success = true, Data = categories });
    }
}