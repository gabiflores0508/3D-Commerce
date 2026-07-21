import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';
import { optionalAuthMiddleware } from '../../middlewares/optionalAuthMiddleware';
import { couponValidateRateLimiter } from '../../middlewares/rateLimiters';
import { couponsController } from './coupons.controller';

/**
 * Cupons — R12.
 * Público:
 *   POST /api/coupons/validate            (carrinho/checkout — rate limited)
 * Admin (auth + admin):
 *   GET    /api/admin/coupons
 *   GET    /api/admin/coupons/:id
 *   POST   /api/admin/coupons
 *   PUT    /api/admin/coupons/:id
 *   PATCH  /api/admin/coupons/:id/toggle
 *   DELETE /api/admin/coupons/:id
 */
export const couponsRouter = Router();

// Público — validação (auth opcional: se logado, aplica limite por cliente).
couponsRouter.post(
  '/coupons/validate',
  couponValidateRateLimiter,
  optionalAuthMiddleware,
  asyncHandler(couponsController.validate),
);

// Admin — protegido.
couponsRouter.use('/admin/coupons', authMiddleware, adminMiddleware);
couponsRouter.get('/admin/coupons', asyncHandler(couponsController.listAdmin));
couponsRouter.post('/admin/coupons', asyncHandler(couponsController.create));
couponsRouter.get('/admin/coupons/:id', asyncHandler(couponsController.getAdmin));
couponsRouter.put('/admin/coupons/:id', asyncHandler(couponsController.update));
couponsRouter.patch('/admin/coupons/:id/toggle', asyncHandler(couponsController.toggle));
couponsRouter.delete('/admin/coupons/:id', asyncHandler(couponsController.remove));
