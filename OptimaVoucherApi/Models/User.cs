namespace OptimaVoucherApi.Models;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    
    public string FullName { get; set; } = string.Empty;
    public int Points { get; set; } = 0;
    public string MembershipTier { get; set; } = "Standard";
    public string? Gender { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? PasswordResetTokenHash { get; set; }
    public DateTime? PasswordResetExpiry { get; set; }
    public string? PasswordHash { get; set; }
    public string? GoogleId { get; set; }
}