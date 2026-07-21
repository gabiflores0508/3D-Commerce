import type { Request, Response } from 'express';
import { created, ok } from '../../utils/apiResponse';
import { HttpError } from '../../utils/httpError';
import { authService } from './auth.service';
import { loginSchema, registerSchema } from './auth.schemas';

export const authController = {
  async register(req: Request, res: Response) {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    return created(res, result);
  },

  async login(req: Request, res: Response) {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    return ok(res, result);
  },

  async me(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const user = await authService.getMe(req.user.id);
    return ok(res, { user });
  },
};
