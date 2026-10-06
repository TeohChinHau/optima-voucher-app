import client from "./client";
import type { ApiResponse, Voucher, VoucherCategory } from "../types";

interface PaginatedVouchers {
  items: Voucher[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const getVouchers = (params: {
  search?: string;
  categoryId?: number;
  page?: number;
  pageSize?: number;
}) => client.get<ApiResponse<PaginatedVouchers>>("/vouchers", { params });

export const getVoucherById = (id: number) =>
  client.get<ApiResponse<Voucher>>(`/vouchers/${id}`);

export const getCategories = () =>
  client.get<ApiResponse<VoucherCategory[]>>("/vouchers/categories");