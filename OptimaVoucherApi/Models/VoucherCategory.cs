namespace OptimaVoucherApi.Models;

public class VoucherCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<Voucher> Vouchers { get; set; } = new();
}