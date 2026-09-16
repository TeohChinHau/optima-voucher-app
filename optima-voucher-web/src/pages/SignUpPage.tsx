import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";
import { signup } from "../api/authApi";
import { useToast } from "../context/ToastContext";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (!agreed) {
      showToast("Please agree to the Terms & Privacy", "error");
      return;
    }

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
          <div className="relative mb-4">
            <User
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-800 text-white border border-slate-700 rounded-full pl-11 pr-4 py-3 focus:outline-none focus:border-orange-400"
              required
            />
          </div>

          <div className="relative mb-4">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 text-white border border-slate-700 rounded-full pl-11 pr-4 py-3 focus:outline-none focus:border-orange-400"
              required
            />
          </div>

          <div className="relative mb-4">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 text-white border border-slate-700 rounded-full pl-11 pr-4 py-3 focus:outline-none focus:border-orange-400"
              required
            />
          </div>

          <div className="relative mb-4">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="password"
              placeholder="Retype Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-800 text-white border border-slate-700 rounded-full pl-11 pr-4 py-3 focus:outline-none focus:border-orange-400"
              required
            />
          </div>

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

          <button
            type="submit"
            className="w-full bg-orange-500 text-slate-900 rounded-full py-3 font-bold hover:bg-orange-400 transition"
          >
            Sign Up
          </button>

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
