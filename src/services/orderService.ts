import { api } from './api';
import type { ApiOrder, ApiOrderAddress, ApiPagination, ApiPaymentMethod, ApiOrderStatus, ApiPaymentStatus } from './types';

export interface CreateOrderPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: ApiOrderAddress;
  shippingValue?: number;
  discountValue?: number;
  paymentMethod: ApiPaymentMethod;
  notes?: string | null;
}

export const orderService = {
  create(input: CreateOrderPayload) {
    return api.post<{ order: ApiOrder }>('/api/orders', input);
  },
  listMine(query?: { status?: ApiOrderStatus; page?: number; limit?: number }) {
    return api.get<{ orders: ApiOrder[]; pagination: ApiPagination }>('/api/me/orders', {
      query: query as Record<string, unknown> as never,
    });
  },
  getMine(id: string) {
    return api.get<{ order: ApiOrder }>(`/api/me/orders/${id}`);
  },
  listAdmin(query?: {
    status?: ApiOrderStatus;
    paymentStatus?: ApiPaymentStatus;
    paymentMethod?: ApiPaymentMethod;
    search?: string;
    page?: number;
    limit?: number;
    sort?: 'newest' | 'oldest' | 'total_asc' | 'total_desc';
  }) {
    return api.get<{ orders: ApiOrder[]; pagination: ApiPagination }>('/api/admin/orders', {
      query: query as Record<string, unknown> as never,
    });
  },
  getAdmin(id: string) {
    return api.get<{ order: ApiOrder }>(`/api/admin/orders/${id}`);
  },
  updateStatus(id: string, input: { status?: ApiOrderStatus; paymentStatus?: ApiPaymentStatus }) {
    return api.put<{ order: ApiOrder }>(`/api/admin/orders/${id}/status`, input);
  },
};
