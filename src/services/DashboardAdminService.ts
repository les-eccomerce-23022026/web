import dashboardAdminMock from '@/mocks/dashboardAdminMock.json';

export class DashboardAdminService {
  static async getDashboardInfo(): Promise<any> {
    return new Promise((resolve) => setTimeout(() => resolve(dashboardAdminMock), 300));
  }
}
