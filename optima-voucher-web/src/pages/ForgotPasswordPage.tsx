import { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { forgotPassword } from "../api/authApi";
import { useToast } from "../context/ToastContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="grid md:grid-cols-2 gap-10 max-w-3xl w-full items-center">
        <div className="text-center md:text-left">
          <Lock className="mx-auto md:mx-0 text-white mb-4" size={56} strokeWidth={1.5} />
          <h1 className="text-3xl font-bold text-white mb-3">Forgot Password?</h1>
          <p className="text-slate-400">
            We'll send you the reset instruction in your email
          </p>
        </div>

        <div className="bg-orange-500 rounded-2xl p-8">
          {submitted ? (
            <div>
              <p className="text-slate-900 font-semibold mb-4">
                If an account exists for {email}, a reset link has been sent.
              </p>
              <Link to="/login" className="text-slate-900 font-bold underline">
                ← Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label className="text-slate-900 font-semibold text-sm mb-2 block">Email</label>
              <div className="relative mb-6">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900/60" size={18} />
                <input
                  type="email"
                  placeholder="Enter your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-orange-400/30 placeholder-slate-900/60 text-slate-900 border border-slate-900/20 rounded-full pl-11 pr-4 py-3 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-200 text-slate-900 rounded-full py-3 font-bold hover:bg-white transition mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Reset Password"}
              </button>
              <Link to="/login" className="block text-center text-slate-900 font-bold underline">
                Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}