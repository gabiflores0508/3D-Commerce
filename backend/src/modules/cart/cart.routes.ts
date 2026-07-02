import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { cartController } from './cart.controller';

/**
 * Cart — cliente autenticado.
 *
 *   GET    /api/cart
 *   POST   /api/cart/items
 *   PUT    /api/cart/items/:id
 *   DELETE /api/cart/items/:id
 *   DELETE /api/cart
 */
export const cartRouter = Router();

cartRouter.use('/cart', authMiddleware);

cartRouter.get('/cart', asyncHandler(cartController.get));
cartRouter.delete('/cart', asyncHandler(cartController.clear));
cartRouter.post('/cart/items', asyncHandler(cartController.addItem));
cartRouter.put('/cart/items/:id', asyncHandler(cartController.updateItem));
cartRouter.delete('/cart/items/:id', asyncHandler(cartController.removeItem));
