import type { Request, Response } from 'express';
import { ok } from '../../utils/apiResponse';
import { dashboardService } from './dashboard.service';

export const dashboardController = {
  async overview(_req: Request, res: Response) {
    const data = await dashboardService.getOverview();
    return ok(res, data);
  },
};
