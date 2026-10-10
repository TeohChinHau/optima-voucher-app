import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { googleLogin } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function GoogleSignInButton() {
  const { login: setAuth } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  return (
    <div className="flex justify-center mb-4">
      <GoogleLogin
        theme="filled_black"
        shape="pill"
        text="continue_with"
        onSuccess={async (response) => {
          if (!response.credential) {
            showToast("Google sign-in failed", "error");
            return;
          }
          try {
            const res = await googleLogin(response.credential);
            if (res.data.success && res.data.data) {
              const { token, fullName, points } = res.data.data;
              setAuth(token, fullName, points);
              navigate("/dashboard");
            }
          } catch (err: any) {
            showToast(
              err.response?.data?.message || "Google sign-in failed",
              "error",
            );
          }
        }}
        onError={() => showToast("Google sign-in failed", "error")}
      />
    </div>
  );
}