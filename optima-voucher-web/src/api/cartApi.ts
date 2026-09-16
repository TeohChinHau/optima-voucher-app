import client from "./client";
import type { ApiResponse, CartItem } from "../types";

export const getCart = () =>
  client.get<ApiResponse<CartItem[]>>("/cart");

export const addToCart = (voucherId: number, quantity: number) =>
  client.post<ApiResponse<null>>("/cart", { voucherId, quantity });

export const updateCartQuantity = (id: number, quantity: number) =>
  client.put<ApiResponse<null>>(`/cart/${id}`, quantity, {
    headers: { "Content-Type": "application/json" },
  });

export const removeFromCart = (id: number) =>
  client.delete<ApiResponse<null>>(`/cart/${id}`);

export const downloadRedemptionPdf = async (redemptionId: number) => {
  const res = await client.get(`/redemption/${redemptionId}/pdf`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `voucher-${redemptionId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};