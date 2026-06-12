import type { IDashboardAdminInfo } from '@/interfaces/dashboardAdmin';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { ApiClient } from '../apiClient';
import type { IDashboardAdminService, DashboardAdminFilters } from '../contracts/dashboardAdminService';

export class DashboardAdminServiceApi implements IDashboardAdminService {
  async getDashboardInfo(filters?: DashboardAdminFilters): Promise<IDashboardAdminInfo> {
    const params = new URLSearchParams();
    
    if (filters?.periodoReceita && filters.periodoReceita !== 'todos') {
      params.append('periodo', filters.periodoReceita);
    }
    
    if (filters?.statusFiltro && filters.statusFiltro !== 'todos') {
      params.append('status', filters.statusFiltro);
    }
    
    const queryString = params.toString();
    const url = queryString 
      ? `${API_ENDPOINTS.obterDashboardAdminInfo}?${queryString}`
      : API_ENDPOINTS.obterDashboardAdminInfo;
    
    return ApiClient.get<IDashboardAdminInfo>(url);
  }
}
