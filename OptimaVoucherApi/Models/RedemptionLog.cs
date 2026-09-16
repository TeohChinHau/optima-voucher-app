namespace OptimaVoucherApi.Models;

public class RedemptionLog
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int VoucherId { get; set; }
    public Voucher? Voucher { get; set; }
    public int Quantity { get; set; }
    public int PointsDeducted { get; set; }
    public DateTime RedeemedAt { get; set; } = DateTime.UtcNow;
    public string? PdfPath { get; set; }
}