import type { IDashboardAdminInfo } from '@/interfaces/IDashboardAdmin';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { ApiClient } from '@/services/apiClient';
import type { IDashboardAdminService } from '@/services/contracts/IDashboardAdminService';

export class DashboardAdminServiceApi implements IDashboardAdminService {
  async getDashboardInfo(): Promise<IDashboardAdminInfo> {
    return ApiClient.get<IDashboardAdminInfo>(API_ENDPOINTS.obterDashboardAdminInfo);
  }
}
