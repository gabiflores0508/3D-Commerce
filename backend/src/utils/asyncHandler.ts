import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wrapper para handlers async — propaga rejeições para o middleware de erro
 * sem precisar de try/catch em cada rota.
 *
 * Uso: router.get('/x', asyncHandler(async (req, res) => { ... }))
 */
export function asyncHandler<T extends RequestHandler>(fn: T): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
