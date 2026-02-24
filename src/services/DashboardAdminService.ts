import dashboardAdminMock from '@/mocks/dashboardAdminMock.json';
import type { IDashboardAdminInfo } from '@/interfaces/IDashboardAdmin';
import { API_ENDPOINTS, USE_MOCK } from '@/config/apiConfig';

export class DashboardAdminService {
  static async getDashboardInfo(): Promise<IDashboardAdminInfo> {
    if (USE_MOCK) {
      console.log('[Mock] Buscando dashboard admin.');
      return new Promise((resolve) => setTimeout(() => resolve(dashboardAdminMock as unknown as IDashboardAdminInfo), 300));
    }

    const response = await fetch(API_ENDPOINTS.obterDashboardAdminInfo);
    if (!response.ok) throw new Error('Erro ao buscar dados do dashboard');
    return response.json();
  }
}
