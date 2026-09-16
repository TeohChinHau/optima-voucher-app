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
    public async Task<IActionResult> GetAll()
    {
        var vouchers = await _db.Vouchers.Include(v => v.Category).ToListAsync();
        return Ok(new ApiResponse<object> { Success = true, Data = vouchers });
    }

    [HttpGet("category/{categoryId}")]
    public async Task<IActionResult> GetByCategory(int categoryId)
    {
        var vouchers = await _db.Vouchers.Where(v => v.CategoryId == categoryId).ToListAsync();
        return Ok(new ApiResponse<object> { Success = true, Data = vouchers });
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        var vouchers = await _db.Vouchers.Where(v => v.Title.Contains(q)).ToListAsync();
        return Ok(new ApiResponse<object> { Success = true, Data = vouchers });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var voucher = await _db.Vouchers.Include(v => v.Category).FirstOrDefaultAsync(v => v.Id == id);
        if (voucher == null) return NotFound(new ApiResponse<object> { Success = false, Message = "Not found" });
        return Ok(new ApiResponse<object> { Success = true, Data = voucher });
    }
}