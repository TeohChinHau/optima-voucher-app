import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";
import { signup } from "../api/authApi";
import { useToast } from "../context/ToastContext";
import Button from "../components/Button";
import Input from "../components/Input";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (!agreed) {
      showToast("Please agree to the Terms & Privacy", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signup(email, password, fullName);
      if (res.data.success) {
        showToast("Account created! Redirecting...");
        setTimeout(() => navigate("/login"), 1200);
      }
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Something went wrong. Try again.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center px-6 py-10">
      <div className="w-full max-w-md">
        <img src="/logo.png" alt="Optima Bank" className="h-16 mb-10" />

        <p className="text-slate-400 mb-1">Let's</p>
        <h2 className="text-3xl font-bold text-white mb-8">
          Create Your Account
        </h2>

        <form onSubmit={handleSubmit}>
          <Input
            icon={User}
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            icon={Mail}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            icon={Lock}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            icon={Lock}
            type="password"
            placeholder="Retype Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <label className="flex items-center gap-2 text-sm text-slate-300 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="accent-orange-500"
            />
            I agree to the{" "}
            <span className="text-orange-400 font-semibold">
              Terms & Privacy
            </span>
          </label>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </Button>

          <p className="text-sm mt-5 text-slate-400">
            Have an account?{" "}
            <Link
              to="/login"
              className="text-orange-400 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}