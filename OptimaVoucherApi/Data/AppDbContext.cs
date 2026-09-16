using Microsoft.EntityFrameworkCore;
using OptimaVoucherApi.Models;

namespace OptimaVoucherApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<VoucherCategory> VoucherCategories => Set<VoucherCategory>();
    public DbSet<Voucher> Vouchers => Set<Voucher>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<RedemptionLog> RedemptionLogs => Set<RedemptionLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
    }
}