import { OrderStatus, Prisma, type Coupon, type CouponDiscountType } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../utils/httpError';
import { decimalToNumber } from '../../utils/decimal';
import { computeCouponStatus, type CouponStatus } from '../../utils/couponStatus';
import type {
  CreateCouponInput,
  ListCouponsQuery,
  UpdateCouponInput,
  ValidateCouponInput,
} from './coupons.schemas';

export interface CouponDTO {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderValue: number | null;
  maxDiscountValue: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  usageLimitPerCustomer: number | null;
  isActive: boolean;
  isSeasonal: boolean;
  seasonalName: string | null;
  status: CouponStatus;
  // Métricas (R14) — agregadas de pedidos não cancelados que usaram o cupom.
  ordersCount: number;
  revenue: number;
  discountGiven: number;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Estatísticas agregadas de uso de um cupom. */
export interface CouponStats {
  ordersCount: number;
  revenue: number;
  discountGiven: number;
  lastUsedAt: string | null;
}

const EMPTY_STATS: CouponStats = { ordersCount: 0, revenue: 0, discountGiven: 0, lastUsedAt: null };

function toDTO(c: Coupon, stats: CouponStats = EMPTY_STATS): CouponDTO {
  return {
    id: c.id,
    code: c.code,
    name: c.name,
    description: c.description,
    discountType: c.discountType,
    discountValue: decimalToNumber(c.discountValue) ?? 0,
    minOrderValue: decimalToNumber(c.minOrderValue),
    maxDiscountValue: decimalToNumber(c.maxDiscountValue),
    startsAt: c.startsAt ? c.startsAt.toISOString() : null,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    usageLimit: c.usageLimit,
    usageCount: c.usageCount,
    usageLimitPerCustomer: c.usageLimitPerCustomer,
    isActive: c.isActive,
    isSeasonal: c.isSeasonal,
    seasonalName: c.seasonalName,
    status: computeCouponStatus(c),
    ordersCount: stats.ordersCount,
    revenue: stats.revenue,
    discountGiven: stats.discountGiven,
    lastUsedAt: stats.lastUsedAt,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

/**
 * Agrega métricas de uso por cupom (1 query). Ignora pedidos CANCELADOS.
 * Receita = soma do total final; desconto concedido = soma do discountValue.
 */
async function statsByCouponId(couponIds: string[]): Promise<Map<string, CouponStats>> {
  const map = new Map<string, CouponStats>();
  if (couponIds.length === 0) return map;
  const rows = await prisma.order.groupBy({
    by: ['couponId'],
    where: { couponId: { in: couponIds }, status: { not: OrderStatus.CANCELED } },
    _count: { _all: true },
    _sum: { total: true, discountValue: true },
    _max: { createdAt: true },
  });
  for (const r of rows) {
    if (!r.couponId) continue;
    map.set(r.couponId, {
      ordersCount: r._count._all,
      revenue: decimalToNumber(r._sum.total) ?? 0,
      discountGiven: decimalToNumber(r._sum.discountValue) ?? 0,
      lastUsedAt: r._max.createdAt ? r._max.createdAt.toISOString() : null,
    });
  }
  return map;
}

/** Códigos de motivo (machine-readable) para cupom não aplicável. */
export type CouponInvalidReason =
  | 'INVALID'
  | 'INACTIVE'
  | 'SCHEDULED'
  | 'EXPIRED'
  | 'EXHAUSTED'
  | 'MIN_ORDER'
  | 'CUSTOMER_LIMIT_REACHED';

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  message: string;
  reason?: CouponInvalidReason;
  discountType?: CouponDiscountType;
  discountValue?: number;
  discountAmount: number;
  freeShipping: boolean;
  totalBeforeDiscount: number;
  totalAfterDiscount: number;
}

type Evaluation =
  | { ok: true; discountAmount: number; freeShipping: boolean }
  | { ok: false; reason: CouponInvalidReason; message: string };

/**
 * Avalia um cupom contra um subtotal. Fonte única de verdade das regras,
 * reutilizada pela validação pública e pela criação de pedido.
 */
function evaluateCoupon(c: Coupon | null, subtotal: number): Evaluation {
  if (!c) return { ok: false, reason: 'INVALID', message: 'Cupom inválido.' };
  const status = computeCouponStatus(c);
  if (status === 'INACTIVE') return { ok: false, reason: 'INACTIVE', message: 'Cupom inativo.' };
  if (status === 'SCHEDULED') return { ok: false, reason: 'SCHEDULED', message: 'Cupom ainda não disponível.' };
  if (status === 'EXPIRED') return { ok: false, reason: 'EXPIRED', message: 'Cupom expirado.' };
  if (status === 'EXHAUSTED') return { ok: false, reason: 'EXHAUSTED', message: 'Cupom esgotado.' };

  const minOrder = decimalToNumber(c.minOrderValue);
  if (minOrder != null && subtotal < minOrder) {
    return {
      ok: false,
      reason: 'MIN_ORDER',
      message: `Pedido mínimo de R$ ${minOrder.toFixed(2)} não atingido.`,
    };
  }
  const { discount, freeShipping } = computeDiscount(c, subtotal);
  return { ok: true, discountAmount: discount, freeShipping };
}

/**
 * Verifica o limite de uso POR CLIENTE (usageLimitPerCustomer).
 * Conta pedidos anteriores do mesmo usuário com este cupom, ignorando
 * pedidos CANCELADOS. Só se aplica quando há usuário autenticado.
 */
async function checkCustomerLimit(
  c: Coupon,
  userId: string | undefined,
): Promise<Extract<Evaluation, { ok: false }> | null> {
  if (c.usageLimitPerCustomer == null || !userId) return null;
  const usedByCustomer = await prisma.order.count({
    where: { couponId: c.id, userId, status: { not: OrderStatus.CANCELED } },
  });
  if (usedByCustomer >= c.usageLimitPerCustomer) {
    return {
      ok: false,
      reason: 'CUSTOMER_LIMIT_REACHED',
      message: 'Você já atingiu o limite de uso deste cupom.',
    };
  }
  return null;
}

/** Calcula o desconto em R$ para um total de carrinho, respeitando o teto. */
function computeDiscount(c: Coupon, cartTotal: number): { discount: number; freeShipping: boolean } {
  const value = decimalToNumber(c.discountValue) ?? 0;
  const maxDiscount = decimalToNumber(c.maxDiscountValue);
  if (c.discountType === 'FREE_SHIPPING') {
    return { discount: 0, freeShipping: true };
  }
  let discount = 0;
  if (c.discountType === 'PERCENTAGE') {
    discount = (cartTotal * value) / 100;
  } else if (c.discountType === 'FIXED_AMOUNT') {
    discount = value;
  }
  if (maxDiscount != null && discount > maxDiscount) discount = maxDiscount;
  // Nunca descontar mais que o próprio carrinho.
  if (discount > cartTotal) discount = cartTotal;
  return { discount: Number(discount.toFixed(2)), freeShipping: false };
}

export const couponsService = {
  async listAdmin(query: ListCouponsQuery): Promise<CouponDTO[]> {
    const where: Prisma.CouponWhereInput = {};
    if (query.status === 'SEASONAL') where.isSeasonal = true;
    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const rows = await prisma.coupon.findMany({ where, orderBy: { createdAt: 'desc' } });
    const stats = await statsByCouponId(rows.map((r) => r.id));
    let dtos = rows.map((r) => toDTO(r, stats.get(r.id) ?? EMPTY_STATS));
    // Filtro por status derivado (feito em memória porque status é computado).
    if (['ACTIVE', 'INACTIVE', 'EXPIRED', 'EXHAUSTED', 'SCHEDULED'].includes(query.status)) {
      dtos = dtos.filter((d) => d.status === query.status);
    }
    return dtos;
  },

  async getById(id: string): Promise<CouponDTO> {
    const c = await prisma.coupon.findUnique({ where: { id } });
    if (!c) throw HttpError.notFound('Cupom não encontrado.');
    const stats = await statsByCouponId([c.id]);
    return toDTO(c, stats.get(c.id) ?? EMPTY_STATS);
  },

  async create(input: CreateCouponInput): Promise<CouponDTO> {
    const existing = await prisma.coupon.findUnique({ where: { code: input.code }, select: { id: true } });
    if (existing) throw HttpError.conflict('Já existe um cupom com esse código.');

    const c = await prisma.coupon.create({
      data: {
        code: input.code,
        name: input.name,
        description: input.description ?? null,
        discountType: input.discountType,
        discountValue: input.discountType === 'FREE_SHIPPING' ? 0 : input.discountValue,
        minOrderValue: input.minOrderValue ?? null,
        maxDiscountValue: input.maxDiscountValue ?? null,
        startsAt: input.startsAt ?? null,
        expiresAt: input.expiresAt ?? null,
        usageLimit: input.usageLimit ?? null,
        usageLimitPerCustomer: input.usageLimitPerCustomer ?? null,
        isActive: input.isActive,
        isSeasonal: input.isSeasonal,
        seasonalName: input.isSeasonal ? input.seasonalName ?? null : null,
      },
    });
    return toDTO(c);
  },

  async update(id: string, input: UpdateCouponInput): Promise<CouponDTO> {
    const current = await prisma.coupon.findUnique({ where: { id } });
    if (!current) throw HttpError.notFound('Cupom não encontrado.');

    // Código único (se estiver trocando).
    if (input.code && input.code !== current.code) {
      const clash = await prisma.coupon.findUnique({ where: { code: input.code }, select: { id: true } });
      if (clash) throw HttpError.conflict('Já existe um cupom com esse código.');
    }

    // usageLimit não pode ficar abaixo do que já foi usado.
    if (input.usageLimit != null && input.usageLimit < current.usageCount) {
      throw HttpError.badRequest(
        `O limite de usos (${input.usageLimit}) não pode ser menor que os usos já registrados (${current.usageCount}).`,
      );
    }

    const data: Prisma.CouponUpdateInput = {};
    if (input.code !== undefined) data.code = input.code;
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.discountType !== undefined) data.discountType = input.discountType;
    if (input.discountValue !== undefined) data.discountValue = input.discountValue;
    if (input.minOrderValue !== undefined) data.minOrderValue = input.minOrderValue;
    if (input.maxDiscountValue !== undefined) data.maxDiscountValue = input.maxDiscountValue;
    if (input.startsAt !== undefined) data.startsAt = input.startsAt;
    if (input.expiresAt !== undefined) data.expiresAt = input.expiresAt;
    if (input.usageLimit !== undefined) data.usageLimit = input.usageLimit;
    if (input.usageLimitPerCustomer !== undefined) data.usageLimitPerCustomer = input.usageLimitPerCustomer;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.isSeasonal !== undefined) data.isSeasonal = input.isSeasonal;
    if (input.seasonalName !== undefined) data.seasonalName = input.seasonalName;
    // Se tipo virar FREE_SHIPPING, zera o valor para consistência.
    if (input.discountType === 'FREE_SHIPPING') data.discountValue = 0;

    const updated = await prisma.coupon.update({ where: { id }, data });
    return toDTO(updated);
  },

  async toggle(id: string): Promise<CouponDTO> {
    const current = await prisma.coupon.findUnique({ where: { id } });
    if (!current) throw HttpError.notFound('Cupom não encontrado.');
    const updated = await prisma.coupon.update({
      where: { id },
      data: { isActive: !current.isActive },
    });
    return toDTO(updated);
  },

  async remove(id: string): Promise<void> {
    const current = await prisma.coupon.findUnique({ where: { id }, select: { id: true } });
    if (!current) throw HttpError.notFound('Cupom não encontrado.');
    // onDelete: SetNull no CouponScript → scripts vinculados apenas desvinculam.
    await prisma.coupon.delete({ where: { id } });
  },

  /**
   * Validação pública — usada pelo carrinho/checkout.
   * Retorna apenas o necessário; nunca expõe limites internos, contadores, ids
   * de outros registros, etc. Status seguro calculado no backend.
   */
  async validate(input: ValidateCouponInput, userId?: string): Promise<CouponValidationResult> {
    const c = await prisma.coupon.findUnique({ where: { code: input.code } });
    let evaluation = evaluateCoupon(c, input.cartTotal);
    // Limite por cliente — só verifica se houver usuário autenticado.
    if (evaluation.ok && c) {
      const customerFail = await checkCustomerLimit(c, userId);
      if (customerFail) evaluation = customerFail;
    }
    if (!evaluation.ok) {
      return {
        valid: false,
        code: input.code,
        reason: evaluation.reason,
        message: evaluation.message,
        discountAmount: 0,
        freeShipping: false,
        totalBeforeDiscount: input.cartTotal,
        totalAfterDiscount: input.cartTotal,
      };
    }
    return {
      valid: true,
      code: c!.code,
      message: 'Cupom aplicado com sucesso.',
      discountType: c!.discountType,
      discountValue: decimalToNumber(c!.discountValue) ?? 0,
      discountAmount: evaluation.discountAmount,
      freeShipping: evaluation.freeShipping,
      totalBeforeDiscount: input.cartTotal,
      totalAfterDiscount: Number((input.cartTotal - evaluation.discountAmount).toFixed(2)),
    };
  },

  /**
   * Revalida um cupom no momento da CRIAÇÃO do pedido (server-side, fonte da
   * verdade). Lança HttpError com mensagem amigável se não for aplicável.
   * Não incrementa usageCount — isso é feito atomicamente dentro da transação
   * do pedido (ver orders.service).
   */
  async resolveForOrder(
    code: string,
    subtotal: number,
    userId: string,
  ): Promise<{ coupon: Coupon; discountAmount: number; freeShipping: boolean }> {
    const c = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
    const evaluation = evaluateCoupon(c, subtotal);
    if (!evaluation.ok) throw HttpError.badRequest(evaluation.message);
    // Limite por cliente — obrigatório na criação do pedido.
    const customerFail = await checkCustomerLimit(c!, userId);
    if (customerFail) throw HttpError.badRequest(customerFail.message);
    return { coupon: c!, discountAmount: evaluation.discountAmount, freeShipping: evaluation.freeShipping };
  },
};
