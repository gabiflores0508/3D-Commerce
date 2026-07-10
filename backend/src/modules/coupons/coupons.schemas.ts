import { z } from 'zod';

/**
 * Schemas de validação de cupons.
 *
 * Regras de segurança embutidas:
 * - code nunca vazio, salvo em UPPERCASE, só [A-Z0-9_-].
 * - valores nunca negativos.
 * - desconto percentual limitado a 100.
 * - expiresAt precisa ser depois de startsAt quando ambos existem.
 */

const discountTypeEnum = z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']);

// Dinheiro obrigatório (≥ 0).
const money = z.coerce.number({ invalid_type_error: 'Valor inválido.' }).min(0, 'Valor não pode ser negativo.');

// Nullable helpers — `z.null()` PRIMEIRO no union para o coerce não transformar null em 0.
const nullableMoney = z.preprocess(
  (v) => (v === '' || v === undefined ? null : v),
  z.union([z.null(), money]),
);
const nullableDate = z.preprocess(
  (v) => (v === '' || v === undefined ? null : v),
  z.union([z.null(), z.coerce.date({ invalid_type_error: 'Data inválida.' })]),
);
const nullablePositiveInt = z.preprocess(
  (v) => (v === '' || v === undefined ? null : v),
  z.union([z.null(), z.coerce.number().int('Use um número inteiro.').min(1, 'Precisa ser ao menos 1.')]),
);

export const createCouponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2, 'Código muito curto.')
      .max(40, 'Código muito longo.')
      .transform((v) => v.toUpperCase())
      .refine((v) => /^[A-Z0-9_-]+$/.test(v), 'Use apenas letras, números, hífen ou underline.'),
    name: z.string().trim().min(2, 'Nome é obrigatório.').max(120),
    description: z.preprocess(
      (v) => (v === '' || v === undefined ? null : v),
      z.union([z.null(), z.string().trim().max(500)]),
    ),
    discountType: discountTypeEnum,
    discountValue: money.default(0),
    minOrderValue: nullableMoney,
    maxDiscountValue: nullableMoney,
    startsAt: nullableDate,
    expiresAt: nullableDate,
    usageLimit: nullablePositiveInt,
    usageLimitPerCustomer: nullablePositiveInt,
    isActive: z.boolean().default(true),
    isSeasonal: z.boolean().default(false),
    seasonalName: z.preprocess(
      (v) => (v === '' || v === undefined ? null : v),
      z.union([z.null(), z.string().trim().max(120)]),
    ),
  })
  .superRefine((data, ctx) => {
    // Percentual: 1–100.
    if (data.discountType === 'PERCENTAGE') {
      if (data.discountValue <= 0 || data.discountValue > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['discountValue'],
          message: 'Percentual deve ser entre 1 e 100.',
        });
      }
    }
    // Valor fixo: > 0.
    if (data.discountType === 'FIXED_AMOUNT' && data.discountValue <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discountValue'],
        message: 'Informe o valor do desconto.',
      });
    }
    // Datas coerentes.
    if (data.startsAt && data.expiresAt && data.expiresAt <= data.startsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expiresAt'],
        message: 'A expiração deve ser depois do início.',
      });
    }
  });

export type CreateCouponInput = z.infer<typeof createCouponSchema>;

// Update: todos os campos opcionais. Reaplica as mesmas checagens quando
// os campos relevantes vierem juntos.
export const updateCouponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2, 'Código muito curto.')
      .max(40, 'Código muito longo.')
      .transform((v) => v.toUpperCase())
      .refine((v) => /^[A-Z0-9_-]+$/.test(v), 'Use apenas letras, números, hífen ou underline.')
      .optional(),
    name: z.string().trim().min(2).max(120).optional(),
    description: z
      .preprocess((v) => (v === '' ? null : v), z.union([z.null(), z.string().trim().max(500)]))
      .optional(),
    discountType: discountTypeEnum.optional(),
    discountValue: money.optional(),
    minOrderValue: nullableMoney.optional(),
    maxDiscountValue: nullableMoney.optional(),
    startsAt: nullableDate.optional(),
    expiresAt: nullableDate.optional(),
    usageLimit: nullablePositiveInt.optional(),
    usageLimitPerCustomer: nullablePositiveInt.optional(),
    isActive: z.boolean().optional(),
    isSeasonal: z.boolean().optional(),
    seasonalName: z
      .preprocess((v) => (v === '' ? null : v), z.union([z.null(), z.string().trim().max(120)]))
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.discountType === 'PERCENTAGE' && data.discountValue !== undefined) {
      if (data.discountValue <= 0 || data.discountValue > 100) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['discountValue'], message: 'Percentual deve ser entre 1 e 100.' });
      }
    }
    if (data.discountType === 'FIXED_AMOUNT' && data.discountValue !== undefined && data.discountValue <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['discountValue'], message: 'Informe o valor do desconto.' });
    }
    if (data.startsAt && data.expiresAt && data.expiresAt <= data.startsAt) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['expiresAt'], message: 'A expiração deve ser depois do início.' });
    }
  });

export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;

// Filtro da listagem admin.
export const listCouponsQuerySchema = z.object({
  status: z.enum(['ALL', 'ACTIVE', 'INACTIVE', 'EXPIRED', 'EXHAUSTED', 'SCHEDULED', 'SEASONAL']).default('ALL'),
  search: z.string().trim().max(120).optional(),
});
export type ListCouponsQuery = z.infer<typeof listCouponsQuerySchema>;

// Validação pública (checkout/carrinho).
export const validateCouponSchema = z.object({
  code: z.string().trim().min(1, 'Informe o código.').max(40).transform((v) => v.toUpperCase()),
  cartTotal: z.coerce.number().min(0, 'Total inválido.'),
});
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
