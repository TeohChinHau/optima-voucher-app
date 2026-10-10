import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { login } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/Button";
import Input from "../components/Input";
import GoogleSignInButton from "../components/GoogleSignInButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.data.success && res.data.data) {
        setAuth(
          res.data.data.token,
          res.data.data.fullName,
          res.data.data.points,
        );
        navigate("/dashboard");
      }
    } catch {
      showToast("Invalid email or password", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* Left branding panel */}
      <div className="hidden md:flex flex-1 items-center justify-center relative overflow-hidden">
        <div className="absolute w-96 h-96 bg-orange-500/40 rounded-full blur-3xl -left-20" />
        <div className="relative z-10">
          <img src="/logo.png" alt="Optima Bank" className="h-24" />
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h2 className="text-3xl font-bold text-white mb-8">Login</h2>

          <Input
            icon={Mail}
            type="email"
            placeholder="Email"
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

          <div className="text-right mb-6">
            <Link
              to="/forgot-password"
              className="text-orange-400 text-sm hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-slate-500 text-sm">or</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          <GoogleSignInButton />

          <Link
            to="/signup"
            className="block text-center border border-slate-600 text-white rounded-full py-3 font-semibold hover:bg-slate-800 transition"
          >
            Create an account
          </Link>
        </form>
      </div>
    </div>
  );
}