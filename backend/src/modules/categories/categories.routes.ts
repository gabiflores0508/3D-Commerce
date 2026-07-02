import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';
import { categoriesController } from './categories.controller';

/**
 * Rotas de categorias — montadas sob `/api`.
 *
 * Público:
 *   GET    /api/public/categories
 * Admin (auth + admin):
 *   GET    /api/admin/categories
 *   POST   /api/admin/categories
 *   PUT    /api/admin/categories/:id
 *   DELETE /api/admin/categories/:id
 */
export const categoriesRouter = Router();

// Público
categoriesRouter.get('/public/categories', asyncHandler(categoriesController.listPublic));

// Admin
categoriesRouter.use('/admin/categories', authMiddleware, adminMiddleware);
categoriesRouter.get('/admin/categories', asyncHandler(categoriesController.listAdmin));
categoriesRouter.post('/admin/categories', asyncHandler(categoriesController.create));
categoriesRouter.put('/admin/categories/:id', asyncHandler(categoriesController.update));
categoriesRouter.delete('/admin/categories/:id', asyncHandler(categoriesController.remove));
