import type { Request, Response } from 'express';
import { z } from 'zod';
import { created, noContent, ok } from '../../utils/apiResponse';
import { couponsService } from './coupons.service';
import {
  createCouponSchema,
  listCouponsQuerySchema,
  updateCouponSchema,
  validateCouponSchema,
} from './coupons.schemas';

const idParam = z.object({ id: z.string().min(1) });

export const couponsController = {
  async listAdmin(req: Request, res: Response) {
    const query = listCouponsQuerySchema.parse(req.query);
    const coupons = await couponsService.listAdmin(query);
    return ok(res, { coupons });
  },

  async getAdmin(req: Request, res: Response) {
    const { id } = idParam.parse(req.params);
    const coupon = await couponsService.getById(id);
    return ok(res, { coupon });
  },

  async create(req: Request, res: Response) {
    const input = createCouponSchema.parse(req.body);
    const coupon = await couponsService.create(input);
    return created(res, { coupon });
  },

  async update(req: Request, res: Response) {
    const { id } = idParam.parse(req.params);
    const input = updateCouponSchema.parse(req.body);
    const coupon = await couponsService.update(id, input);
    return ok(res, { coupon });
  },

  async toggle(req: Request, res: Response) {
    const { id } = idParam.parse(req.params);
    const coupon = await couponsService.toggle(id);
    return ok(res, { coupon });
  },

  async remove(req: Request, res: Response) {
    const { id } = idParam.parse(req.params);
    await couponsService.remove(id);
    return noContent(res);
  },

  /** Público — validação de cupom no carrinho/checkout (auth opcional). */
  async validate(req: Request, res: Response) {
    const input = validateCouponSchema.parse(req.body);
    // Se o cliente estiver autenticado, aplica também o limite por cliente.
    const result = await couponsService.validate(input, req.user?.id);
    return ok(res, result);
  },
};
