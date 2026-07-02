import { z } from 'zod';
import { ProductPurchaseMode } from '@prisma/client';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const skuRegex = /^[A-Za-z0-9._-]+$/;

const nullableNumber = () =>
  z.union([z.number(), z.string(), z.null()]).transform((v) => {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : null;
  }).nullable().optional();

const positiveNumber = () =>
  z.union([z.number(), z.string()]).transform((v) => {
    const n = typeof v === 'number' ? v : Number(v);
    return n;
  }).refine((n) => Number.isFinite(n) && n > 0, 'Precisa ser um número positivo.');

const nonNegativeInt = () =>
  z.union([z.number(), z.string()]).transform((v) => {
    const n = typeof v === 'number' ? v : Number(v);
    return Math.trunc(n);
  }).refine((n) => Number.isInteger(n) && n >= 0, 'Precisa ser inteiro não-negativo.');

export const createProductSchema = z.object({
  categoryId: z.string().min(1, 'categoryId é obrigatório.'),
  name: z.string().trim().min(2, 'Nome precisa ter no mínimo 2 caracteres.'),
  slug: z.string().trim().regex(slugRegex, 'Slug inválido.').optional(),
  shortDescription: z.string().trim().max(500).optional().nullable(),
  description: z.string().trim().max(10000).optional().nullable(),
  price: positiveNumber(),
  promotionalPrice: nullableNumber().refine(
    (v) => v === null || v === undefined || (typeof v === 'number' && v > 0),
    'Preço promocional precisa ser positivo.',
  ),
  sku: z.string().trim().regex(skuRegex, 'SKU inválido.').max(60).optional().nullable(),
  stock: nonNegativeInt().optional(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  weight: nullableNumber(),
  width: nullableNumber(),
  height: nullableNumber(),
  depth: nullableNumber(),
  material: z.string().trim().max(80).optional().nullable(),
  color: z.string().trim().max(80).optional().nullable(),
  printTime: z.string().trim().max(60).optional().nullable(),
  purchaseMode: z.nativeEnum(ProductPurchaseMode).optional(),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

const parseBool = z
  .union([z.boolean(), z.string()])
  .transform((v) => (typeof v === 'boolean' ? v : v.toLowerCase() === 'true'))
  .optional();

export const publicListQuerySchema = z.object({
  category: z.string().trim().optional(),
  search: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  featured: parseBool,
  purchaseMode: z.nativeEnum(ProductPurchaseMode).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc', 'name_desc']).default('newest'),
});
export type PublicListQuery = z.infer<typeof publicListQuerySchema>;

export const featuredQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(8),
});
export type FeaturedQuery = z.infer<typeof featuredQuerySchema>;

export const adminListQuerySchema = publicListQuerySchema.extend({
  active: parseBool,
  lowStock: parseBool,
});
export type AdminListQuery = z.infer<typeof adminListQuerySchema>;
