import { z } from 'zod';

/** Categorias devem espelhar o enum ScriptCategory do Prisma. */
export const scriptCategoryEnum = z.enum([
  'COUPON',
  'POST_SALE',
  'QUOTE_RECOVERY',
  'LAUNCH',
  'SEASONAL_OFFER',
  'FREE_SHIPPING',
  'FEATURED_PRODUCT',
  'RETURNING_CUSTOMER',
]);

const nullableId = z.preprocess(
  (v) => (v === '' || v === undefined ? null : v),
  z.union([z.null(), z.string().min(1).max(60)]),
);

export const createScriptSchema = z.object({
  title: z.string().trim().min(2, 'Título é obrigatório.').max(120),
  description: z.preprocess(
    (v) => (v === '' || v === undefined ? null : v),
    z.union([z.null(), z.string().trim().max(500)]),
  ),
  messageTemplate: z.string().trim().min(2, 'A mensagem é obrigatória.').max(4000, 'Mensagem muito longa.'),
  category: scriptCategoryEnum.default('COUPON'),
  linkedCouponId: nullableId,
  isActive: z.boolean().default(true),
});
export type CreateScriptInput = z.infer<typeof createScriptSchema>;

export const updateScriptSchema = z.object({
  title: z.string().trim().min(2).max(120).optional(),
  description: z
    .preprocess((v) => (v === '' ? null : v), z.union([z.null(), z.string().trim().max(500)]))
    .optional(),
  messageTemplate: z.string().trim().min(2).max(4000).optional(),
  category: scriptCategoryEnum.optional(),
  linkedCouponId: nullableId.optional(),
  isActive: z.boolean().optional(),
});
export type UpdateScriptInput = z.infer<typeof updateScriptSchema>;

export const listScriptsQuerySchema = z.object({
  category: z.union([scriptCategoryEnum, z.literal('ALL')]).default('ALL'),
  couponId: z.string().trim().max(60).optional(),
  search: z.string().trim().max(120).optional(),
});
export type ListScriptsQuery = z.infer<typeof listScriptsQuerySchema>;
