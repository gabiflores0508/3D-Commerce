import { site } from '@/config/site';
import type { Product } from '@/types';

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function getEffectivePrice(product: Product): number {
  return product.promoPrice ?? product.price;
}

export function getPixPrice(product: Product): number {
  if (product.pixPrice) return product.pixPrice;
  const base = getEffectivePrice(product);
  return Number((base * (1 - site.pixDiscountPercent / 100)).toFixed(2));
}

export function getDiscountPercent(product: Product): number {
  if (!product.promoPrice) return 0;
  return Math.round(((product.price - product.promoPrice) / product.price) * 100);
}

export function calcInstallment(value: number, max = 6): { qty: number; value: number } {
  const min = 20;
  let qty = Math.min(max, Math.max(1, Math.floor(value / min)));
  qty = Math.max(1, qty);
  return { qty, value: Number((value / qty).toFixed(2)) };
}
