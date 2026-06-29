import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';
import { site, type CouponCode } from '@/config/site';
import { getEffectivePrice } from '@/utils/price';

interface CartState {
  items: CartItem[];
  coupon?: CouponCode;
  addItem: (productId: string, qty?: number, variationId?: string, variationLabel?: string) => void;
  removeItem: (productId: string, variationId?: string) => void;
  updateQty: (productId: string, qty: number, variationId?: string) => void;
  clear: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: undefined,
      addItem: (productId, qty = 1, variationId, variationLabel) => {
        const items = get().items.slice();
        const existing = items.find(
          (i) => i.productId === productId && i.variationId === variationId,
        );
        if (existing) {
          existing.qty += qty;
        } else {
          items.push({ productId, qty, variationId, variationLabel });
        }
        set({ items });
      },
      removeItem: (productId, variationId) => {
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && i.variationId === variationId),
          ),
        });
      },
      updateQty: (productId, qty, variationId) => {
        if (qty <= 0) {
          get().removeItem(productId, variationId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId && i.variationId === variationId ? { ...i, qty } : i,
          ),
        });
      },
      clear: () => set({ items: [], coupon: undefined }),
      applyCoupon: (code) => {
        const upper = code.trim().toUpperCase() as CouponCode;
        if (site.coupons[upper]) {
          set({ coupon: upper });
          return true;
        }
        return false;
      },
      removeCoupon: () => set({ coupon: undefined }),
      count: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: '3dc-cart' },
  ),
);

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
