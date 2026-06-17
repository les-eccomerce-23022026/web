import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { DashboardAdminSistemaService } from '../services/dashboardAdminSistemaService';
import type { IDashboardAdminSistemaData } from '../interfaces/dashboardAdminSistema';
import type { IDashboardAdminSistemaFilters } from '../services/contracts/dashboardAdminSistemaService';

export function useDashboardAdminSistema(filters?: IDashboardAdminSistemaFilters) {
  return useQuery<IDashboardAdminSistemaData, Error>({
    queryKey: ['dashboardAdminSistema', filters],
    queryFn: () => DashboardAdminSistemaService.getDashboardInfo(filters),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
