import client from "./client";
import type { ApiResponse, Voucher } from "../types";

export const getAllVouchers = () =>
  client.get<ApiResponse<Voucher[]>>("/vouchers");

export const getVoucherById = (id: number) =>
  client.get<ApiResponse<Voucher>>(`/vouchers/${id}`);

export const getVouchersByCategory = (categoryId: number) =>
  client.get<ApiResponse<Voucher[]>>(`/vouchers/category/${categoryId}`);