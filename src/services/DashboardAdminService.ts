import dashboardAdminMock from '@/mocks/dashboardAdminMock.json';
import type { DashboardAdminInfo } from '@/interfaces/DashboardAdmin';

export class DashboardAdminService {
  static async getDashboardInfo(): Promise<DashboardAdminInfo> {
    return new Promise((resolve) => setTimeout(() => resolve(dashboardAdminMock as unknown as DashboardAdminInfo), 300));
  }
}
