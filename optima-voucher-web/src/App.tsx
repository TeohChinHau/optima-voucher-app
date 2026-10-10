import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import type { ReactNode } from "react";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SignUpPage from "./pages/SignUpPage";
import VoucherSelectionPage from "./pages/VoucherSelectionPage";
import VoucherDetailPage from "./pages/VoucherDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import { ToastProvider } from "./context/ToastContext";
import ChatWidget from "./components/ChatWidget";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { GoogleOAuthProvider } from "@react-oauth/google";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vouchers"
                element={
                  <ProtectedRoute>
                    <VoucherSelectionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vouchers/:id"
                element={
                  <ProtectedRoute>
                    <VoucherDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
            <ChatWidget />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
