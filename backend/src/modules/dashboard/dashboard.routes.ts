import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';
import { ok } from '../../utils/apiResponse';
import { dashboardController } from './dashboard.controller';

/**
 * Dashboard — R7.
 * GET /api/admin/dashboard
 */
export const dashboardRouter = Router();

// Todas as rotas deste router são /admin/* → requerem auth + admin.
dashboardRouter.use(authMiddleware, adminMiddleware);

dashboardRouter.get('/admin/dashboard', asyncHandler(dashboardController.overview));

/**
 * @deprecated Substituído por `/api/admin/dashboard` na R7.
 * Mantido temporariamente para não quebrar testes/frontend antigos.
 */
dashboardRouter.get('/admin/ping', (req, res) => {
  ok(res, {
    message: 'Admin autorizado',
    user: req.user,
    deprecated: true,
    replacement: '/api/admin/dashboard',
  });
});
