import { api } from './api';
import type { ApiCoupon, ApiCouponValidation } from './types';

export type CouponStatusFilter =
  | 'ALL'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'EXPIRED'
  | 'EXHAUSTED'
  | 'SCHEDULED'
  | 'SEASONAL';

export interface CouponInput {
  code: string;
  name: string;
  description?: string | null;
  discountType: ApiCoupon['discountType'];
  discountValue: number;
  minOrderValue?: number | null;
  maxDiscountValue?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  usageLimitPerCustomer?: number | null;
  isActive?: boolean;
  isSeasonal?: boolean;
  seasonalName?: string | null;
}

export const couponService = {
  listAdmin(params?: { status?: CouponStatusFilter; search?: string }) {
    return api.get<{ coupons: ApiCoupon[] }>('/api/admin/coupons', {
      query: { status: params?.status, search: params?.search },
    });
  },
  getAdmin(id: string) {
    return api.get<{ coupon: ApiCoupon }>(`/api/admin/coupons/${id}`);
  },
  create(input: CouponInput) {
    return api.post<{ coupon: ApiCoupon }>('/api/admin/coupons', input);
  },
  update(id: string, input: Partial<CouponInput>) {
    return api.put<{ coupon: ApiCoupon }>(`/api/admin/coupons/${id}`, input);
  },
  toggle(id: string) {
    return api.patch<{ coupon: ApiCoupon }>(`/api/admin/coupons/${id}/toggle`);
  },
  remove(id: string) {
    return api.del(`/api/admin/coupons/${id}`);
  },
  /** Público — validação no carrinho/checkout. */
  validate(code: string, cartTotal: number) {
    return api.post<ApiCouponValidation>(
      '/api/coupons/validate',
      { code, cartTotal },
      { anonymous: true },
    );
  },
};
