import type { Request, Response } from 'express';
import { z } from 'zod';
import { created, ok } from '../../utils/apiResponse';
import { HttpError } from '../../utils/httpError';
import { quotesService } from './quotes.service';
import {
  adminQuotesQuerySchema,
  createQuoteSchema,
  meQuotesQuerySchema,
  updateQuoteAdminSchema,
  updateQuoteStatusSchema,
} from './quotes.schemas';

const idParam = z.object({ id: z.string().min(1) });

function requireUser(req: Request): string {
  if (!req.user) throw HttpError.unauthorized();
  return req.user.id;
}

export const quotesController = {
  /** Anônimo ou autenticado — depende do optionalAuthMiddleware. */
  async create(req: Request, res: Response) {
    const input = createQuoteSchema.parse(req.body);
    const quote = await quotesService.create(input, req.user?.id);
    return created(res, { quote });
  },

  /** Upload público por quoteId — spec R6 (endurecer com token temporário na R10). */
  async addFiles(req: Request, res: Response) {
    const { id } = idParam.parse(req.params);
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) throw HttpError.badRequest('Envie ao menos um arquivo no campo "files".');
    const quote = await quotesService.addFiles(id, files);
    return created(res, { quote });
  },

  async listMine(req: Request, res: Response) {
    const userId = requireUser(req);
    const query = meQuotesQuerySchema.parse(req.query);
    const result = await quotesService.listMine(userId, query);
    return ok(res, result);
  },

  async getMine(req: Request, res: Response) {
    const userId = requireUser(req);
    const { id } = idParam.parse(req.params);
    const quote = await quotesService.getMine(userId, id);
    return ok(res, { quote });
  },

  async listAdmin(req: Request, res: Response) {
    const query = adminQuotesQuerySchema.parse(req.query);
    const result = await quotesService.listAdmin(query);
    return ok(res, result);
  },

  async getAdmin(req: Request, res: Response) {
    const { id } = idParam.parse(req.params);
    const quote = await quotesService.getAdmin(id);
    return ok(res, { quote });
  },

  async updateAdmin(req: Request, res: Response) {
    const { id } = idParam.parse(req.params);
    const input = updateQuoteAdminSchema.parse(req.body);
    const quote = await quotesService.updateAdmin(id, input);
    return ok(res, { quote });
  },

  async updateStatus(req: Request, res: Response) {
    const { id } = idParam.parse(req.params);
    const input = updateQuoteStatusSchema.parse(req.body);
    const quote = await quotesService.updateStatus(id, input);
    return ok(res, { quote });
  },
};
