import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { authRateLimiter } from '../../middlewares/rateLimiters';
import { authController } from './auth.controller';

/**
 * Auth — R3.
 * POST /api/auth/register  → cria cliente + retorna JWT
 * POST /api/auth/login     → JWT do cliente ou admin
 * GET  /api/auth/me        → dados do usuário autenticado (sem passwordHash)
 */
export const authRouter = Router();

authRouter.post('/register', authRateLimiter, asyncHandler(authController.register));
authRouter.post('/login', authRateLimiter, asyncHandler(authController.login));
authRouter.get('/me', authMiddleware, asyncHandler(authController.me));
