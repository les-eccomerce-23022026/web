import type { IGraficoInfo } from './dashboardAdmin';

export interface IMetricasAdminSistema {
  totalClientes: number;
  clientesAtivos: number;
  totalAdmins: number;
  adminsAtivos: number;
}

export interface IDashboardAdminSistemaData {
  metricas: IMetricasAdminSistema;
  graficoClientesPorMes: IGraficoInfo;
  graficoDistribuicaoClientes: IGraficoInfo;
}
