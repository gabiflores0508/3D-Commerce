import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { ok } from '../../utils/apiResponse';
import { HttpError } from '../../utils/httpError';
import { prisma } from '../../lib/prisma';

/**
 * Users — R9B.
 *   GET /api/me   → perfil (alias de /auth/me)
 *   PUT /api/me   → atualiza nome/telefone (não altera email/role/senha)
 */
export const usersRouter = Router();

const updateMeSchema = z.object({
  name: z.string().trim().min(2, 'Nome inválido.').max(120).optional(),
  phone: z.string().trim().min(8, 'Telefone inválido.').max(30).optional(),
}).refine(
  (v) => v.name !== undefined || v.phone !== undefined,
  'Envie ao menos um campo (name ou phone).',
);

function toPublicUser(u: {
  id: string; name: string; email: string; phone: string | null;
  role: 'ADMIN' | 'CUSTOMER'; active: boolean; createdAt: Date;
}) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    active: u.active,
    createdAt: u.createdAt.toISOString(),
  };
}

usersRouter.use('/me', authMiddleware);

usersRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const u = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!u || !u.active) throw HttpError.unauthorized();
    ok(res, { user: toPublicUser(u) });
  }),
);

usersRouter.put(
  '/me',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const input = updateMeSchema.parse(req.body);
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
      },
    });
    ok(res, { user: toPublicUser(updated) });
  }),
);
