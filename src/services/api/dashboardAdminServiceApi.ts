import type { IDashboardAdminInfo } from '@/interfaces/dashboardAdmin';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { ApiClient } from '@/services/apiClient';
import type { IDashboardAdminService } from '@/services/contracts/dashboardAdminService';

export class DashboardAdminServiceApi implements IDashboardAdminService {
  async getDashboardInfo(): Promise<IDashboardAdminInfo> {
    return ApiClient.get<IDashboardAdminInfo>(API_ENDPOINTS.obterDashboardAdminInfo);
  }
}
