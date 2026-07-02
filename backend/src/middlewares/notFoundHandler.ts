import type { RequestHandler } from 'express';
import { fail } from '../utils/apiResponse';

/** Captura rotas inexistentes e responde no padrão da API. */
export const notFoundHandler: RequestHandler = (req, res) => {
  fail(res, 404, 'ROUTE_NOT_FOUND', `Rota não encontrada: ${req.method} ${req.originalUrl}`);
};
