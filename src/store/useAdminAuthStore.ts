/**
 * Store de auth do painel administrativo — R9.
 * Autentica contra `/api/auth/login` e exige role === 'ADMIN'.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/authService';
import { ApiError, getStoredToken, setAuthToken } from '@/services/api';

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  loading: boolean;

  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAdminAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      email: null,
      loading: false,

      async init() {
        const token = getStoredToken('admin');
        if (!token) return;
        try {
          const { user } = await authService.me(token);
          if (user.role !== 'ADMIN') {
            setAuthToken('admin', null);
            set({ isAuthenticated: false, email: null });
            return;
          }
          set({ isAuthenticated: true, email: user.email });
        } catch {
          setAuthToken('admin', null);
          set({ isAuthenticated: false, email: null });
        }
      },

      async login(email, password) {
        set({ loading: true });
        try {
          const { user, token } = await authService.login(email, password);
          if (user.role !== 'ADMIN') {
            set({ loading: false });
            return false;
          }
          setAuthToken('admin', token);
          set({ isAuthenticated: true, email: user.email, loading: false });
          return true;
        } catch (err) {
          set({ loading: false });
          // Deixamos o componente decidir a mensagem via toast.
          void (err instanceof ApiError ? err.message : 'Erro no login');
          return false;
        }
      },

      logout() {
        setAuthToken('admin', null);
        set({ isAuthenticated: false, email: null });
      },
    }),
    { name: '3dc-admin-auth', partialize: (s) => ({ isAuthenticated: s.isAuthenticated, email: s.email }) },
  ),
);
