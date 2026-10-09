import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { resetPassword } from "../api/authApi";
import { useToast } from "../context/ToastContext";
import Button from "../components/Button";
import Input from "../components/Input";
import { validatePassword } from "../utils/validatePassword";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !token) return;

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      showToast(passwordError, "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token, newPassword);
      showToast("Password reset! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Something went wrong. Try again.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-8">
        <p className="mb-4">This reset link is missing its token.</p>
        <Link to="/forgot-password" className="text-orange-400 hover:underline">
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <img src="/logo.png" alt="Optima Bank" className="h-16 mb-8" />
        <h2 className="text-3xl font-bold text-white mb-2">
          Set a new password
        </h2>
        <p className="text-slate-400 mb-8">
          Choose a password you haven't used before.
        </p>

        <Input
          icon={Lock}
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <Input
          icon={Lock}
          type="password"
          placeholder="Retype New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </Button>

        <Link
          to="/login"
          className="block text-center text-orange-400 text-sm mt-6 hover:underline"
        >
          Back to Login
        </Link>
      </form>
    </div>
  );
}
