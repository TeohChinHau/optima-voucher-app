using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using OptimaVoucherApi.Data;
using OptimaVoucherApi.DTOs;
using OptimaVoucherApi.Models;
using OptimaVoucherApi.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Cryptography;

namespace OptimaVoucherApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [EnableRateLimiting("auth")]
    [HttpPost("signup")]
    public async Task<IActionResult> Signup(SignupRequest req)
    {
        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return BadRequest(new ApiResponse<object> { Success = false, Message = "Email already registered" });

        var user = new User
        {
            Email = req.Email,
            FullName = req.FullName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Points = 0
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<object> { Success = true, Message = "Account created" });
    }

    [EnableRateLimiting("auth")]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new ApiResponse<object> { Success = false, Message = "Invalid credentials" });

        var token = GenerateToken(user);
        return Ok(new ApiResponse<AuthResponse>
        {
            Success = true,
            Message = "Login successful",
            Data = new AuthResponse(token, user.FullName, user.Points)
        });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = new
            {
                user.FullName,
                user.Email,
                user.Points,
                user.MembershipTier,
                user.Gender,
                user.ProfilePictureUrl
            }
        });
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();
        user.FullName = req.FullName;
        user.Gender = req.Gender;
        await _db.SaveChangesAsync();
        return Ok(new ApiResponse<object> { Success = true, Message = "Profile updated" });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, user.PasswordHash))
            return BadRequest(new ApiResponse<object> { Success = false, Message = "Current password is incorrect" });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        await _db.SaveChangesAsync();
        return Ok(new ApiResponse<object> { Success = true, Message = "Password changed successfully" });
    }

    [Authorize]
    [HttpPost("profile-picture")]
    public async Task<IActionResult> UploadProfilePicture(IFormFile file)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (file == null || file.Length == 0)
            return BadRequest(new ApiResponse<object> { Success = false, Message = "No file uploaded" });

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        Directory.CreateDirectory(uploadsFolder);

        var fileName = $"user-{userId}-{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        user.ProfilePictureUrl = $"/uploads/{fileName}";
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<object> { Success = true, Data = new { url = user.ProfilePictureUrl } });
    }

    private static string HashToken(string token) =>
    Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    [EnableRateLimiting("auth")]
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);

        if (user != null)
        {
            var rawToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
            user.PasswordResetTokenHash = HashToken(rawToken);
            user.PasswordResetExpiry = DateTime.UtcNow.AddMinutes(15);
            await _db.SaveChangesAsync();

            var link = $"http://localhost:5173/reset-password?token={rawToken}";
            // TODO: replace with a real email send (Resend/SendGrid)
            Console.WriteLine($"[DEV] Password reset link for {user.Email}: {link}");
        }

        // Same response either way, so attackers can't discover which emails exist
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "If that email is registered, a reset link has been sent."
        });
    }

    [EnableRateLimiting("auth")]
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req)
    {
        var hash = HashToken(req.Token);
        var user = await _db.Users.FirstOrDefaultAsync(u =>
            u.PasswordResetTokenHash == hash && u.PasswordResetExpiry > DateTime.UtcNow);

        if (user == null)
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "This reset link is invalid or has expired."
            });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        user.PasswordResetTokenHash = null;   // single use
        user.PasswordResetExpiry = null;
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<object> { Success = true, Message = "Password has been reset." });
    }

    private string GenerateToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email)
        };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(double.Parse(_config["Jwt:ExpiryMinutes"]!)),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}