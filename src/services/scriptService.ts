import { api } from './api';
import type { ApiCouponScript, ApiScriptCategory } from './types';

export interface ScriptInput {
  title: string;
  description?: string | null;
  messageTemplate: string;
  category: ApiScriptCategory;
  linkedCouponId?: string | null;
  isActive?: boolean;
}

export const scriptService = {
  listAdmin(params?: { category?: ApiScriptCategory | 'ALL'; couponId?: string; search?: string }) {
    return api.get<{ scripts: ApiCouponScript[] }>('/api/admin/scripts', {
      query: { category: params?.category, couponId: params?.couponId, search: params?.search },
    });
  },
  getAdmin(id: string) {
    return api.get<{ script: ApiCouponScript }>(`/api/admin/scripts/${id}`);
  },
  create(input: ScriptInput) {
    return api.post<{ script: ApiCouponScript }>('/api/admin/scripts', input);
  },
  update(id: string, input: Partial<ScriptInput>) {
    return api.put<{ script: ApiCouponScript }>(`/api/admin/scripts/${id}`, input);
  },
  toggle(id: string) {
    return api.patch<{ script: ApiCouponScript }>(`/api/admin/scripts/${id}/toggle`);
  },
  remove(id: string) {
    return api.del(`/api/admin/scripts/${id}`);
  },
};
