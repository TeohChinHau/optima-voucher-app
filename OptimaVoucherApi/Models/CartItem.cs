namespace OptimaVoucherApi.Models;

public class CartItem
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int VoucherId { get; set; }
    public Voucher? Voucher { get; set; }
    public int Quantity { get; set; }
}