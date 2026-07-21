import { Router } from 'express';
import { ok } from '../utils/apiResponse';

export const healthRouter = Router();

/**
 * GET /health
 * Resposta nua (sem envelope) — convenção de health-check de orquestradores.
 */
healthRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: '3D Commerce API' });
});

/**
 * GET /api/health
 * Versão envelopada para clientes que usam o padrão da API.
 */
healthRouter.get('/api/health', (_req, res) => {
  ok(res, {
    status: 'ok',
    service: '3D Commerce API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
