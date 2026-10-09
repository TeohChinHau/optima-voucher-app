namespace OptimaVoucherApi.Common;

public static class PasswordValidator
{
    public static string? Validate(string? password)
    {
        if (string.IsNullOrWhiteSpace(password))
            return "Password is required.";
        if (password.Length < 8)
            return "Password must be at least 8 characters.";
        if (password.Length > 64)
            return "Password must be 64 characters or fewer.";
        if (!password.Any(char.IsLetter))
            return "Password must include at least one letter.";
        if (!password.Any(char.IsDigit))
            return "Password must include at least one number.";
        if (password.All(char.IsLetterOrDigit))
            return "Password must include at least one symbol (e.g. ! @ # $).";
        return null;
    }
}