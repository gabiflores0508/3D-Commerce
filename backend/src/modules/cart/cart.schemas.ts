import { z } from 'zod';

export const addItemSchema = z.object({
  productId: z.string().min(1, 'productId é obrigatório.'),
  quantity: z.coerce.number().int().min(1, 'quantidade mínima é 1.').default(1),
});
export type AddItemInput = z.infer<typeof addItemSchema>;

export const updateItemSchema = z.object({
  quantity: z.coerce.number().int().min(1, 'quantidade mínima é 1.'),
});
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
