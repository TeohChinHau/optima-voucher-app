export interface Voucher {
  id: number;
  title: string;
  description: string;
  pointsCost: number;
  stockQuantity: number;
  categoryId: number;
  category?: VoucherCategory;
}

export interface VoucherCategory {
  id: number;
  name: string;
}

export interface CartItem {
  id: number;
  userId: number;
  voucherId: number;
  voucher?: Voucher;
  quantity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface UserProfile {
  fullName: string;
  email: string;
  points: number;
  membershipTier: string;
  gender?: string;
  profilePictureUrl?: string;
}