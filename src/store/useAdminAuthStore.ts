import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { site } from '@/config/site';

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export const useAdminAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      email: null,
      login: (email, password) => {
        if (email === site.admin.email && password === site.admin.password) {
          set({ isAuthenticated: true, email });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false, email: null }),
    }),
    { name: '3dc-admin-auth' },
  ),
);
