import { Prisma, type CouponScript, type ScriptCategory, type Coupon } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../utils/httpError';
import { decimalToNumber } from '../../utils/decimal';
import type { CreateScriptInput, ListScriptsQuery, UpdateScriptInput } from './scripts.schemas';

/** Resumo do cupom vinculado — só o que o preview/admin precisa. */
export interface LinkedCouponSummary {
  id: string;
  code: string;
  name: string;
  discountType: Coupon['discountType'];
  discountValue: number;
  minOrderValue: number | null;
  expiresAt: string | null;
}

export interface ScriptDTO {
  id: string;
  title: string;
  description: string | null;
  messageTemplate: string;
  category: ScriptCategory;
  linkedCouponId: string | null;
  linkedCoupon: LinkedCouponSummary | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type ScriptWithCoupon = CouponScript & { linkedCoupon: Coupon | null };

function toDTO(s: ScriptWithCoupon): ScriptDTO {
  return {
    id: s.id,
    title: s.title,
    description: s.description,
    messageTemplate: s.messageTemplate,
    category: s.category,
    linkedCouponId: s.linkedCouponId,
    linkedCoupon: s.linkedCoupon
      ? {
          id: s.linkedCoupon.id,
          code: s.linkedCoupon.code,
          name: s.linkedCoupon.name,
          discountType: s.linkedCoupon.discountType,
          discountValue: decimalToNumber(s.linkedCoupon.discountValue) ?? 0,
          minOrderValue: decimalToNumber(s.linkedCoupon.minOrderValue),
          expiresAt: s.linkedCoupon.expiresAt ? s.linkedCoupon.expiresAt.toISOString() : null,
        }
      : null,
    isActive: s.isActive,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

const include = { linkedCoupon: true } as const;

async function assertCouponExists(id: string) {
  const c = await prisma.coupon.findUnique({ where: { id }, select: { id: true } });
  if (!c) throw HttpError.badRequest('Cupom vinculado não existe.');
}

export const scriptsService = {
  async listAdmin(query: ListScriptsQuery): Promise<ScriptDTO[]> {
    const where: Prisma.CouponScriptWhereInput = {};
    if (query.category !== 'ALL') where.category = query.category;
    if (query.couponId) where.linkedCouponId = query.couponId;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const rows = await prisma.couponScript.findMany({
      where,
      include,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toDTO);
  },

  async getById(id: string): Promise<ScriptDTO> {
    const s = await prisma.couponScript.findUnique({ where: { id }, include });
    if (!s) throw HttpError.notFound('Script não encontrado.');
    return toDTO(s);
  },

  async create(input: CreateScriptInput): Promise<ScriptDTO> {
    if (input.linkedCouponId) await assertCouponExists(input.linkedCouponId);
    const s = await prisma.couponScript.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        messageTemplate: input.messageTemplate,
        category: input.category,
        linkedCouponId: input.linkedCouponId ?? null,
        isActive: input.isActive,
      },
      include,
    });
    return toDTO(s);
  },

  async update(id: string, input: UpdateScriptInput): Promise<ScriptDTO> {
    const exists = await prisma.couponScript.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw HttpError.notFound('Script não encontrado.');
    if (input.linkedCouponId) await assertCouponExists(input.linkedCouponId);

    const data: Prisma.CouponScriptUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.messageTemplate !== undefined) data.messageTemplate = input.messageTemplate;
    if (input.category !== undefined) data.category = input.category;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.linkedCouponId !== undefined) {
      data.linkedCoupon = input.linkedCouponId
        ? { connect: { id: input.linkedCouponId } }
        : { disconnect: true };
    }

    const updated = await prisma.couponScript.update({ where: { id }, data, include });
    return toDTO(updated);
  },

  async toggle(id: string): Promise<ScriptDTO> {
    const current = await prisma.couponScript.findUnique({ where: { id } });
    if (!current) throw HttpError.notFound('Script não encontrado.');
    const updated = await prisma.couponScript.update({
      where: { id },
      data: { isActive: !current.isActive },
      include,
    });
    return toDTO(updated);
  },

  async remove(id: string): Promise<void> {
    const current = await prisma.couponScript.findUnique({ where: { id }, select: { id: true } });
    if (!current) throw HttpError.notFound('Script não encontrado.');
    await prisma.couponScript.delete({ where: { id } });
  },
};
