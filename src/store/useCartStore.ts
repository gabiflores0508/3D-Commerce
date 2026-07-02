/**
 * Store de carrinho — R9.
 *
 * Fonte da verdade: backend (`/api/cart`).
 * Este store atua como cache local de UI + wrapper das chamadas de API,
 * preservando a API interna que os componentes existentes usam:
 *   addItem, removeItem, updateQty, clear, applyCoupon, removeCoupon, count.
 *
 * Regras:
 * - Precisa de cliente logado. Se não houver token, mantém carrinho vazio
 *   e sinaliza `requiresAuth` para as UIs redirecionarem/avisarem.
 * - Cupom continua sendo cálculo do frontend (backend não tem entidade Coupon).
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';
import { site, type CouponCode } from '@/config/site';
import { getEffectivePrice } from '@/utils/price';
import { cartService } from '@/services/cartService';
import { ApiError, getStoredToken } from '@/services/api';

interface CartState {
  items: CartItem[];
  coupon?: CouponCode;
  loading: boolean;
  /** Última mensagem de erro da API (útil para toasts). */
  lastError: string | null;

  // Fluxo de sincronização
  fetch: () => Promise<void>;
  reset: () => void;

  // API pública (mantida — mesmos nomes de antes)
  addItem: (productId: string, qty?: number, variationId?: string, variationLabel?: string) => Promise<void>;
  removeItem: (productId: string, variationId?: string) => Promise<void>;
  updateQty: (productId: string, qty: number, variationId?: string) => Promise<void>;
  clear: () => Promise<void>;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  count: () => number;
}

function hasCustomerToken(): boolean {
  return !!getStoredToken('customer');
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: undefined,
      loading: false,
      lastError: null,

      async fetch() {
        if (!hasCustomerToken()) {
          set({ items: [] });
          return;
        }
        set({ loading: true });
        try {
          const { cart } = await cartService.get();
          set({
            items: cart.items.map((i) => ({
              productId: i.productId,
              qty: i.quantity,
              // Guardamos o id do CartItem no `variationId` para reusar as
              // rotas /cart/items/:id sem quebrar a UI (que só precisa passar o id).
              variationId: i.id,
              variationLabel: undefined,
            })),
            loading: false,
            lastError: null,
          });
        } catch (err) {
          const msg = err instanceof ApiError ? err.message : 'Erro ao carregar carrinho.';
          set({ loading: false, lastError: msg });
        }
      },

      reset() {
        set({ items: [], coupon: undefined, lastError: null });
      },

      async addItem(productId, qty = 1) {
        if (!hasCustomerToken()) {
          set({ lastError: 'Faça login para adicionar ao carrinho.' });
          return;
        }
        try {
          const { cart } = await cartService.addItem(productId, qty);
          set({
            items: cart.items.map((i) => ({
              productId: i.productId,
              qty: i.quantity,
              variationId: i.id,
              variationLabel: undefined,
            })),
            lastError: null,
          });
        } catch (err) {
          const msg = err instanceof ApiError ? err.message : 'Erro ao adicionar item.';
          set({ lastError: msg });
        }
      },

      async removeItem(_productId, variationId) {
        if (!variationId) return;
        try {
          const { cart } = await cartService.removeItem(variationId);
          set({
            items: cart.items.map((i) => ({
              productId: i.productId,
              qty: i.quantity,
              variationId: i.id,
            })),
          });
        } catch {
          // ignora — carrinho pode ter divergido, refetch pela navegação
        }
      },

      async updateQty(_productId, qty, variationId) {
        if (!variationId) return;
        if (qty <= 0) {
          await get().removeItem(_productId, variationId);
          return;
        }
        try {
          const { cart } = await cartService.updateItem(variationId, qty);
          set({
            items: cart.items.map((i) => ({
              productId: i.productId,
              qty: i.quantity,
              variationId: i.id,
            })),
          });
        } catch (err) {
          const msg = err instanceof ApiError ? err.message : 'Erro ao atualizar item.';
          set({ lastError: msg });
        }
      },

      async clear() {
        try {
          await cartService.clear();
        } catch {
          /* segue com limpeza local mesmo se API falhar */
        }
        set({ items: [], coupon: undefined });
      },

      applyCoupon(code) {
        const upper = code.trim().toUpperCase() as CouponCode;
        if (site.coupons[upper]) {
          set({ coupon: upper });
          return true;
        }
        return false;
      },
      removeCoupon() {
        set({ coupon: undefined });
      },

      count() {
        return get().items.reduce((sum, i) => sum + i.qty, 0);
      },
    }),
    {
      name: '3dc-cart',
      // Só persistimos o cupom — os itens vêm sempre da API na próxima visita.
      partialize: (s) => ({ coupon: s.coupon }),
    },
  ),
);

// -----------------------------------------------------------------------------
// Helpers de cálculo (mantidos para os componentes que já os importam)
// -----------------------------------------------------------------------------

export function getCartSubtotal(items: CartItem[], products: Product[]): number {
  return items.reduce((sum, it) => {
    const p = products.find((x) => x.id === it.productId);
    if (!p) return sum;
    return sum + getEffectivePrice(p) * it.qty;
  }, 0);
}

export function getCartDiscount(subtotal: number, code?: CouponCode): number {
  if (!code) return 0;
  const c = site.coupons[code];
  if (c.type === 'percent') return Number(((subtotal * c.value) / 100).toFixed(2));
  return 0;
}

export function getCartShipping(subtotal: number, code?: CouponCode): number {
  if (code && site.coupons[code].type === 'shipping') return 0;
  if (subtotal >= site.freeShippingThreshold) return 0;
  return 24.9;
}
