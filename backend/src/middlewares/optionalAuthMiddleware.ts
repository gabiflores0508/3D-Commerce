import type { RequestHandler } from 'express';
import { HttpError } from '../utils/httpError';
import { verifyAuthToken } from '../utils/jwt';
import { authService } from '../modules/auth/auth.service';

/**
 * Auth "quando houver".
 *
 * - Sem header → segue sem `req.user` (rota vira anônima).
 * - Com Bearer válido → popula `req.user`.
 * - Com Bearer *presente mas inválido/expirado* → 401 (não deixamos passar em
 *   silêncio para evitar bug obscuro no cliente).
 * - Com Bearer de usuário deletado/desativado → 401.
 */
export const optionalAuthMiddleware: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return next();

    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw HttpError.unauthorized('Token mal formatado.');
    }

    let payload: ReturnType<typeof verifyAuthToken>;
    try {
      payload = verifyAuthToken(token);
    } catch {
      throw HttpError.unauthorized('Token inválido ou expirado.');
    }

    const dbUser = await authService.findActiveUserById(payload.sub);
    if (!dbUser) throw HttpError.unauthorized('Sessão inválida.');

    req.user = { id: dbUser.id, email: dbUser.email, role: dbUser.role };
    next();
  } catch (err) {
    next(err);
  }
};
