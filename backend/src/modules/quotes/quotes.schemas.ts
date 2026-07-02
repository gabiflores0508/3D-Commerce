import { z } from 'zod';
import { QuoteStatus } from '@prisma/client';

/**
 * Aceita ISO string ou "YYYY-MM-DD" e devolve string ISO (ou null).
 * `deadline` é armazenado como String? no schema para flexibilidade.
 */
const dateOrNull = z
  .union([z.string(), z.date(), z.null()])
  .optional()
  .transform((v): string | null => {
    if (v === null || v === undefined || v === '') return null;
    const d = v instanceof Date ? v : new Date(v);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  })
  .refine((v) => v === null || typeof v === 'string', 'Data inválida.');

export const createQuoteSchema = z.object({
  customerName: z.string().trim().min(2, 'Nome do cliente é obrigatório.'),
  customerEmail: z.string().trim().toLowerCase().email('E-mail inválido.'),
  customerPhone: z.string().trim().min(8, 'Telefone inválido.'),
  title: z.string().trim().min(3, 'Título muito curto.').max(200),
  description: z.string().trim().min(10, 'Descrição muito curta.').max(10000),
  material: z.string().trim().max(80).optional().nullable(),
  color: z.string().trim().max(80).optional().nullable(),
  quantity: z.coerce.number().int().min(1, 'Quantidade mínima é 1.').default(1),
  deadline: dateOrNull,
});
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;

export const updateQuoteAdminSchema = z
  .object({
    // Aceita: null, number > 0, string numérica > 0, ou omitido.
    // OBS: `z.null()` PRECISA vir antes do `coerce.number()` no union;
    // caso contrário `coerce` transforma null → 0 e o positive falha.
    estimatedValue: z
      .union([
        z.null(),
        z.coerce.number().positive('estimatedValue precisa ser positivo.'),
      ])
      .optional(),
    adminNotes: z
      .union([z.string().trim().max(5000), z.null()])
      .optional(),
  })
  .refine(
    (v) => v.estimatedValue !== undefined || v.adminNotes !== undefined,
    'Envie ao menos um: estimatedValue ou adminNotes.',
  );
export type UpdateQuoteAdminInput = z.infer<typeof updateQuoteAdminSchema>;

export const updateQuoteStatusSchema = z.object({
  status: z.nativeEnum(QuoteStatus, {
    errorMap: () => ({
      message: 'Status inválido.',
    }),
  }),
});
export type UpdateQuoteStatusInput = z.infer<typeof updateQuoteStatusSchema>;

export const meQuotesQuerySchema = z.object({
  status: z.nativeEnum(QuoteStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
export type MeQuotesQuery = z.infer<typeof meQuotesQuerySchema>;

export const adminQuotesQuerySchema = z.object({
  status: z.nativeEnum(QuoteStatus).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['newest', 'oldest']).default('newest'),
});
export type AdminQuotesQuery = z.infer<typeof adminQuotesQuerySchema>;
