import { api } from './api';
import type { ApiUser } from './types';

export const authService = {
  register(input: { name: string; email: string; password: string; phone?: string }) {
    return api.post<{ user: ApiUser; token: string }>('/api/auth/register', input, { anonymous: true });
  },
  login(email: string, password: string) {
    return api.post<{ user: ApiUser; token: string }>('/api/auth/login', { email, password }, { anonymous: true });
  },
  me(token?: string) {
    return api.get<{ user: ApiUser }>('/api/auth/me', token ? { token } : undefined);
  },
  updateMe(input: { name?: string; phone?: string }) {
    return api.put<{ user: ApiUser }>('/api/me', input);
  },
};
