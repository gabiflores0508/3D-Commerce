import { api } from './api';
import type { ApiBanner } from './types';

export const bannerService = {
  listPublic() {
    return api.get<{ banners: ApiBanner[] }>('/api/public/banners', { anonymous: true });
  },
  listAdmin() {
    return api.get<{ banners: ApiBanner[] }>('/api/admin/banners');
  },
  create(input: Partial<ApiBanner> & { title: string }) {
    return api.post<{ banner: ApiBanner }>('/api/admin/banners', input);
  },
  update(id: string, input: Partial<ApiBanner>) {
    return api.put<{ banner: ApiBanner }>(`/api/admin/banners/${id}`, input);
  },
  remove(id: string) {
    return api.del(`/api/admin/banners/${id}`);
  },
  uploadImage(id: string, file: File) {
    const form = new FormData();
    form.append('image', file);
    return api.post<{ banner: ApiBanner }>(`/api/admin/banners/${id}/image`, form);
  },
};
