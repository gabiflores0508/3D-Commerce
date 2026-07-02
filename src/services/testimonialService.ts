import { api } from './api';
import type { ApiTestimonial } from './types';

export const testimonialService = {
  listPublic() {
    return api.get<{ testimonials: ApiTestimonial[] }>('/api/public/testimonials', { anonymous: true });
  },
  listAdmin() {
    return api.get<{ testimonials: ApiTestimonial[] }>('/api/admin/testimonials');
  },
  create(input: Partial<ApiTestimonial> & { name: string; content: string }) {
    return api.post<{ testimonial: ApiTestimonial }>('/api/admin/testimonials', input);
  },
  update(id: string, input: Partial<ApiTestimonial>) {
    return api.put<{ testimonial: ApiTestimonial }>(`/api/admin/testimonials/${id}`, input);
  },
  remove(id: string) {
    return api.del(`/api/admin/testimonials/${id}`);
  },
  uploadAvatar(id: string, file: File) {
    const form = new FormData();
    form.append('avatar', file);
    return api.post<{ testimonial: ApiTestimonial }>(`/api/admin/testimonials/${id}/avatar`, form);
  },
};
