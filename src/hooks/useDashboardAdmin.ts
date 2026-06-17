import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { DashboardAdminService } from '../services/dashboardAdminService';
import type { IDashboardAdminInfo } from '../interfaces/dashboardAdmin';
import type { DashboardAdminFilters } from '../services/contracts/dashboardAdminService';

export function useDashboardAdmin(filters?: DashboardAdminFilters) {
  return useQuery<IDashboardAdminInfo, Error>({
    queryKey: ['dashboardAdmin', filters],
    queryFn: () => DashboardAdminService.getDashboardInfo(filters),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
