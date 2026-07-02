import { api } from './api';
import type { ApiCategory } from './types';

export const categoryService = {
  listPublic() {
    return api.get<{ categories: ApiCategory[] }>('/api/public/categories', { anonymous: true });
  },
  listAdmin() {
    return api.get<{ categories: ApiCategory[] }>('/api/admin/categories');
  },
  create(input: Partial<ApiCategory> & { name: string }) {
    return api.post<{ category: ApiCategory }>('/api/admin/categories', input);
  },
  update(id: string, input: Partial<ApiCategory>) {
    return api.put<{ category: ApiCategory }>(`/api/admin/categories/${id}`, input);
  },
  remove(id: string) {
    return api.del<{ softDeleted?: boolean; hardDeleted?: boolean; category?: ApiCategory } | void>(
      `/api/admin/categories/${id}`,
    );
  },
};
