import type { Request, Response } from 'express';
import { z } from 'zod';
import { ok } from '../../utils/apiResponse';
import { HttpError } from '../../utils/httpError';
import { cartService } from './cart.service';
import { addItemSchema, updateItemSchema } from './cart.schemas';

const itemIdParam = z.object({ id: z.string().min(1) });

function requireUser(req: Request): string {
  if (!req.user) throw HttpError.unauthorized();
  return req.user.id;
}

export const cartController = {
  async get(req: Request, res: Response) {
    const userId = requireUser(req);
    const cart = await cartService.get(userId);
    return ok(res, { cart });
  },

  async addItem(req: Request, res: Response) {
    const userId = requireUser(req);
    const input = addItemSchema.parse(req.body);
    const cart = await cartService.addItem(userId, input);
    return ok(res, { cart });
  },

  async updateItem(req: Request, res: Response) {
    const userId = requireUser(req);
    const { id } = itemIdParam.parse(req.params);
    const input = updateItemSchema.parse(req.body);
    const cart = await cartService.updateItem(userId, id, input);
    return ok(res, { cart });
  },

  async removeItem(req: Request, res: Response) {
    const userId = requireUser(req);
    const { id } = itemIdParam.parse(req.params);
    const cart = await cartService.removeItem(userId, id);
    return ok(res, { cart });
  },

  async clear(req: Request, res: Response) {
    const userId = requireUser(req);
    const cart = await cartService.clear(userId);
    return ok(res, { cart });
  },
};
