import dashboardAdminMock from '@/mocks/dashboardAdminMock.json';
import type { IDashboardAdminInfo } from '@/interfaces/IDashboardAdmin';
import { API_ENDPOINTS } from '@/config/apiConfig';

export class DashboardAdminService {
  static async getDashboardInfo(): Promise<IDashboardAdminInfo> {
    console.log('[Mock] Buscando dashboard admin. Endpoint real seria:', API_ENDPOINTS.obterDashboardAdminInfo);
    return new Promise((resolve) => setTimeout(() => resolve(dashboardAdminMock as unknown as IDashboardAdminInfo), 300));
  }
}
