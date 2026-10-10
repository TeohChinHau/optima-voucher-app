namespace OptimaVoucherApi.DTOs;

public record SignupRequest(string Email, string Password, string FullName);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, string FullName, int Points);
public record UpdateProfileRequest(string FullName, string? Gender);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
public record ForgotPasswordRequest(string Email);
public record ResetPasswordRequest(string Token, string NewPassword);
public record GoogleLoginRequest(string Credential);