import client from "./client";
import type { ApiResponse, UserProfile } from "../types";

interface AuthData {
  token: string;
  fullName: string;
  points: number;
}

export const signup = (email: string, password: string, fullName: string) =>
  client.post<ApiResponse<null>>("/auth/signup", { email, password, fullName });

export const login = (email: string, password: string) =>
  client.post<ApiResponse<AuthData>>("/auth/login", { email, password });

export const googleLogin = (credential: string) =>
  client.post<ApiResponse<AuthData>>("/auth/google", { credential });

export const getProfile = () =>
  client.get<ApiResponse<UserProfile>>("/auth/me");

export const updateProfile = (fullName: string, gender: string) =>
  client.put<ApiResponse<null>>("/auth/me", { fullName, gender });

export const changePassword = (currentPassword: string, newPassword: string) =>
  client.post<ApiResponse<null>>("/auth/change-password", { currentPassword, newPassword });

export const forgotPassword = (email: string) =>
  client.post<ApiResponse<null>>("/auth/forgot-password", { email });

export const resetPassword = (token: string, newPassword: string) =>
  client.post<ApiResponse<null>>("/auth/reset-password", { token, newPassword });

export const uploadProfilePicture = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return client.post<ApiResponse<{ url: string }>>("/auth/profile-picture", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};