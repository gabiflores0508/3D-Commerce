/**
 * Store mockado de autenticação de cliente final.
 *
 * ATENÇÃO — DEMONSTRAÇÃO APENAS:
 * - Senhas ficam em localStorage em texto puro.
 * - Não há criptografia, hash ou validação no servidor.
 * - Substituir por Supabase Auth (ou outro provedor) na Fase 2.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Customer, CustomerAddress } from '@/types';

interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  defaultAddress?: CustomerAddress;
}

interface CustomerAuthState {
  customers: Customer[];
  currentCustomerId: string | null;
  registerCustomer: (data: RegisterInput) => { ok: boolean; error?: string; customer?: Customer };
  loginCustomer: (email: string, password: string) => { ok: boolean; error?: string };
  logoutCustomer: () => void;
  updateCustomer: (patch: Partial<Omit<Customer, 'id' | 'password' | 'createdAt'>>) => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>()(
  persist(
    (set, get) => ({
      customers: [],
      currentCustomerId: null,
      registerCustomer: (data) => {
        const email = data.email.trim().toLowerCase();
        const exists = get().customers.find((c) => c.email.toLowerCase() === email);
        if (exists) return { ok: false, error: 'Este e-mail já está cadastrado.' };
        const customer: Customer = {
          id: 'cust-' + Date.now(),
          name: data.name.trim(),
          email,
          phone: data.phone,
          password: data.password,
          createdAt: new Date().toISOString(),
          defaultAddress: data.defaultAddress,
        };
        set({
          customers: [...get().customers, customer],
          currentCustomerId: customer.id,
        });
        return { ok: true, customer };
      },
      loginCustomer: (email, password) => {
        const found = get().customers.find(
          (c) => c.email.toLowerCase() === email.trim().toLowerCase() && c.password === password,
        );
        if (!found) return { ok: false, error: 'E-mail ou senha incorretos.' };
        set({ currentCustomerId: found.id });
        return { ok: true };
      },
      logoutCustomer: () => set({ currentCustomerId: null }),
      updateCustomer: (patch) => {
        const id = get().currentCustomerId;
        if (!id) return;
        set({
          customers: get().customers.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        });
      },
    }),
    { name: '3dc-customer-auth' },
  ),
);

export function useCurrentCustomer(): Customer | null {
  const id = useCustomerAuthStore((s) => s.currentCustomerId);
  const customers = useCustomerAuthStore((s) => s.customers);
  if (!id) return null;
  return customers.find((c) => c.id === id) ?? null;
}
