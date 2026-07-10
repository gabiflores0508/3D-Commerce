import type { Coupon } from '@prisma/client';

/**
 * Status derivado do cupom — calculado SEMPRE no backend para não confiar
 * em relógio/flags do cliente.
 *
 * Prioridade: INACTIVE > SCHEDULED > EXPIRED > EXHAUSTED > ACTIVE.
 */
export type CouponStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'EXHAUSTED' | 'SCHEDULED';

type StatusInput = Pick<
  Coupon,
  'isActive' | 'startsAt' | 'expiresAt' | 'usageLimit' | 'usageCount'
>;

export function computeCouponStatus(c: StatusInput, now: Date = new Date()): CouponStatus {
  if (!c.isActive) return 'INACTIVE';
  if (c.startsAt && now < c.startsAt) return 'SCHEDULED';
  if (c.expiresAt && now > c.expiresAt) return 'EXPIRED';
  if (c.usageLimit != null && c.usageCount >= c.usageLimit) return 'EXHAUSTED';
  return 'ACTIVE';
}

/** True apenas quando o cupom pode, de fato, ser aplicado agora. */
export function isCouponApplicable(c: StatusInput, now: Date = new Date()): boolean {
  return computeCouponStatus(c, now) === 'ACTIVE';
}
