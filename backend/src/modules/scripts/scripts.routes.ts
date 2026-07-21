import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';
import { scriptsController } from './scripts.controller';

/**
 * Scripts / templates de WhatsApp — R12. Somente admin.
 *   GET    /api/admin/scripts
 *   GET    /api/admin/scripts/:id
 *   POST   /api/admin/scripts
 *   PUT    /api/admin/scripts/:id
 *   PATCH  /api/admin/scripts/:id/toggle
 *   DELETE /api/admin/scripts/:id
 */
export const scriptsRouter = Router();

scriptsRouter.use('/admin/scripts', authMiddleware, adminMiddleware);
scriptsRouter.get('/admin/scripts', asyncHandler(scriptsController.listAdmin));
scriptsRouter.post('/admin/scripts', asyncHandler(scriptsController.create));
scriptsRouter.get('/admin/scripts/:id', asyncHandler(scriptsController.getAdmin));
scriptsRouter.put('/admin/scripts/:id', asyncHandler(scriptsController.update));
scriptsRouter.patch('/admin/scripts/:id/toggle', asyncHandler(scriptsController.toggle));
scriptsRouter.delete('/admin/scripts/:id', asyncHandler(scriptsController.remove));
