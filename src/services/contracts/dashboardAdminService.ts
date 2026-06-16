import type { IDashboardAdminInfo } from '@/interfaces/dashboardAdmin';
import type { PeriodoFiltro } from '@/components/Admin/FiltroPeriodo/FiltroPeriodo';
import type { StatusFiltro } from '@/components/Admin/FiltroStatus/FiltroStatus';

export interface IDashboardAdminFilters {
  periodoReceita?: PeriodoFiltro;
  statusFiltro?: StatusFiltro;
}

export type DashboardAdminFilters = IDashboardAdminFilters;

export interface IDashboardAdminService {
  getDashboardInfo(filters?: IDashboardAdminFilters): Promise<IDashboardAdminInfo>;
}
