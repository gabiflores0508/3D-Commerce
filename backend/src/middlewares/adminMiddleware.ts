import type { RequestHandler } from 'express';
import { UserRole } from '@prisma/client';
import { HttpError } from '../utils/httpError';

/**
 * Exige que `req.user` já esteja preenchido (rodar depois do authMiddleware)
 * e que o usuário tenha role ADMIN.
 */
export const adminMiddleware: RequestHandler = (req, _res, next) => {
  if (!req.user) return next(HttpError.unauthorized());
  if (req.user.role !== UserRole.ADMIN) {
    return next(HttpError.forbidden('Acesso restrito a administradores.'));
  }
  next();
};
