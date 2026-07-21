import { api } from './api';
import type { ApiDashboard } from './types';

export const dashboardService = {
  overview() {
    return api.get<ApiDashboard>('/api/admin/dashboard');
  },
};
