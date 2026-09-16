import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface AuthState {
  token: string | null;
  fullName: string | null;
  points: number;
  login: (token: string, fullName: string, points: number) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [fullName, setFullName] = useState<string | null>(localStorage.getItem("fullName"));
  const [points, setPoints] = useState<number>(Number(localStorage.getItem("points")) || 0);

  const login = (t: string, name: string, pts: number) => {
    localStorage.setItem("token", t);
    localStorage.setItem("fullName", name);
    localStorage.setItem("points", String(pts));
    setToken(t);
    setFullName(name);
    setPoints(pts);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
    localStorage.removeItem("points");
    setToken(null);
    setFullName(null);
    setPoints(0);
  };

  return (
    <AuthContext.Provider value={{ token, fullName, points, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};