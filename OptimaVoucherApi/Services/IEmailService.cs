namespace OptimaVoucherApi.Services;

public interface IEmailService
{
    Task SendPasswordResetAsync(string toEmail, string resetLink);
}