import { z } from 'zod';

// Todos os campos são opcionais no update, mas se enviados precisam ser válidos.
export const updateSettingsSchema = z
  .object({
    storeName: z.string().trim().min(2, 'storeName não pode ficar vazio.').max(120),
    whatsapp: z.string().trim().min(8).max(30),
    email: z.string().trim().toLowerCase().email('E-mail inválido.'),
    instagram: z.string().trim().max(200).nullable(),
    address: z.string().trim().min(2).max(500),
    cnpj: z.string().trim().max(30).nullable(),
    logoUrl: z.string().trim().max(500).nullable(),
    heroTitle: z.string().trim().max(200).nullable(),
    heroSubtitle: z.string().trim().max(500).nullable(),
    aboutTitle: z.string().trim().max(200).nullable(),
    aboutText: z.string().trim().max(5000).nullable(),
    seoTitle: z.string().trim().max(200).nullable(),
    seoDescription: z.string().trim().max(500).nullable(),
    pixDiscountPercent: z.coerce.number().min(0, 'não pode ser negativo.').max(100),
    freeShippingThreshold: z.coerce.number().min(0, 'não pode ser negativo.'),
    shippingNote: z.string().trim().max(300).nullable(),
  })
  .partial();
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
