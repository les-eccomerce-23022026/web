import type { IDashboardAdminSistemaData } from '@/interfaces/dashboardAdminSistema';
import type { PeriodoFiltro } from '@/components/Admin/FiltroPeriodo/FiltroPeriodo';

export type StatusClienteFiltro = 'todos' | 'ativos' | 'inativos';

export interface IDashboardAdminSistemaFilters {
  periodo?: PeriodoFiltro;
  statusCliente?: StatusClienteFiltro;
}

export interface IDashboardAdminSistemaService {
  getDashboardInfo(filters?: IDashboardAdminSistemaFilters): Promise<IDashboardAdminSistemaData>;
}
