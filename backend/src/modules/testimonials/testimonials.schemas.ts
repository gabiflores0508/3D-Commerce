import { z } from 'zod';

export const createTestimonialSchema = z.object({
  name: z.string().trim().min(2, 'Nome é obrigatório.').max(120),
  role: z.string().trim().max(120).optional().nullable(),
  content: z.string().trim().min(2, 'Depoimento é obrigatório.').max(2000),
  rating: z.coerce.number().int().min(1, 'Rating mínimo é 1.').max(5, 'Rating máximo é 5.').default(5),
  avatarUrl: z.string().trim().max(500).optional().nullable(),
  active: z.boolean().optional().default(true),
});
export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;

export const updateTestimonialSchema = createTestimonialSchema.partial();
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>;
