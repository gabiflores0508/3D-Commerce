import type { Request, Response } from 'express';
import { z } from 'zod';
import { created, noContent, ok } from '../../utils/apiResponse';
import { scriptsService } from './scripts.service';
import { createScriptSchema, listScriptsQuerySchema, updateScriptSchema } from './scripts.schemas';

const idParam = z.object({ id: z.string().min(1) });

export const scriptsController = {
  async listAdmin(req: Request, res: Response) {
    const query = listScriptsQuerySchema.parse(req.query);
    const scripts = await scriptsService.listAdmin(query);
    return ok(res, { scripts });
  },

  async getAdmin(req: Request, res: Response) {
    const { id } = idParam.parse(req.params);
    const script = await scriptsService.getById(id);
    return ok(res, { script });
  },

  async create(req: Request, res: Response) {
    const input = createScriptSchema.parse(req.body);
    const script = await scriptsService.create(input);
    return created(res, { script });
  },

  async update(req: Request, res: Response) {
    const { id } = idParam.parse(req.params);
    const input = updateScriptSchema.parse(req.body);
    const script = await scriptsService.update(id, input);
    return ok(res, { script });
  },

  async toggle(req: Request, res: Response) {
    const { id } = idParam.parse(req.params);
    const script = await scriptsService.toggle(id);
    return ok(res, { script });
  },

  async remove(req: Request, res: Response) {
    const { id } = idParam.parse(req.params);
    await scriptsService.remove(id);
    return noContent(res);
  },
};
