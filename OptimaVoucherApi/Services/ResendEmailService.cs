using System.Net.Http.Headers;

namespace OptimaVoucherApi.Services;

public class ResendEmailService : IEmailService
{
    private readonly HttpClient _http;
    private readonly string _from;
    private readonly ILogger<ResendEmailService> _logger;

    public ResendEmailService(HttpClient http, IConfiguration config, ILogger<ResendEmailService> logger)
    {
        _http = http;
        _logger = logger;
        _from = config["Resend:From"] ?? "onboarding@resend.dev";
        _http.BaseAddress = new Uri("https://api.resend.com/");
        _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", config["Resend:ApiKey"]);
    }

    public async Task SendPasswordResetAsync(string toEmail, string resetLink)
    {
        var payload = new
        {
            from = _from,
            to = new[] { toEmail },
            subject = "Reset your Optima Bank password",
            html = $"""
                <p>We received a request to reset your password.</p>
                <p><a href="{resetLink}">Reset your password</a></p>
                <p>This link expires in 15 minutes. If you didn't request this, you can ignore this email.</p>
                """
        };

        var response = await _http.PostAsJsonAsync("emails", payload);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            _logger.LogError("Resend failed ({Status}): {Body}", response.StatusCode, body);
            throw new InvalidOperationException("Failed to send email");
        }
    }
}