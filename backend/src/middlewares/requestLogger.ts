import type { RequestHandler } from 'express';

/**
 * Logger leve para desenvolvimento. Em produção pode ser substituído por pino/winston.
 * Formato: `[METHOD] /path status XXms`
 */
export const requestLogger: RequestHandler = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    // eslint-disable-next-line no-console
    console.log(`[${req.method}] ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
};
