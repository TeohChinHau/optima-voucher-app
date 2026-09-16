namespace OptimaVoucherApi.Models;

public class Voucher
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int PointsCost { get; set; }
    public int StockQuantity { get; set; }
    public int CategoryId { get; set; }
    public VoucherCategory? Category { get; set; }
}