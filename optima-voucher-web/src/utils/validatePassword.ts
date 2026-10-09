export function validatePassword(password: string): string | null {
  if (!password.trim()) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 64) return "Password must be 64 characters or fewer";
  // Unicode-aware so it matches the C# char.IsLetter / IsDigit checks on the backend
  if (!/\p{L}/u.test(password)) return "Password must include at least one letter";
  if (!/\p{Nd}/u.test(password)) return "Password must include at least one number";
  if (!/[^\p{L}\p{Nd}]/u.test(password))
    return "Password must include at least one symbol (e.g. ! @ # $)";
  return null;
}