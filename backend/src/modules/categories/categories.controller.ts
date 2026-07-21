import type { Request, Response } from 'express';
import { z } from 'zod';
import { created, noContent, ok } from '../../utils/apiResponse';
import { categoriesService } from './categories.service';
import { createCategorySchema, updateCategorySchema } from './categories.schemas';

const idParam = z.object({ id: z.string().min(1) });

export const categoriesController = {
  async listPublic(_req: Request, res: Response) {
    const categories = await categoriesService.listPublic();
    return ok(res, { categories });
  },

  async listAdmin(_req: Request, res: Response) {
    const categories = await categoriesService.listAdmin();
    return ok(res, { categories });
  },

  async create(req: Request, res: Response) {
    const input = createCategorySchema.parse(req.body);
    const category = await categoriesService.create(input);
    return created(res, { category });
  },

  async update(req: Request, res: Response) {
    const { id } = idParam.parse(req.params);
    const input = updateCategorySchema.parse(req.body);
    const category = await categoriesService.update(id, input);
    return ok(res, { category });
  },

  async remove(req: Request, res: Response) {
    const { id } = idParam.parse(req.params);
    const result = await categoriesService.remove(id);
    if (result.hardDeleted) return noContent(res);
    return ok(res, result);
  },
};
