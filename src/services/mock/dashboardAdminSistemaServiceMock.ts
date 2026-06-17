import type { IDashboardAdminSistemaData } from '@/interfaces/dashboardAdminSistema';
import type { IDashboardAdminSistemaService, IDashboardAdminSistemaFilters } from '../contracts/dashboardAdminSistemaService';

const MESES_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Dados mock estáticos de clientes cadastrados por mês (últimos 12 meses)
const CLIENTES_POR_MES = [8, 12, 7, 15, 20, 18, 25, 30, 22, 28, 35, 40];

const TOTAL_CLIENTES = CLIENTES_POR_MES.reduce((acc, v) => acc + v, 0);
const CLIENTES_ATIVOS = Math.round(TOTAL_CLIENTES * 0.72);
const CLIENTES_INATIVOS = TOTAL_CLIENTES - CLIENTES_ATIVOS;

const TOTAL_ADMINS = 6;
const ADMINS_ATIVOS = 5;

export class DashboardAdminSistemaServiceMock implements IDashboardAdminSistemaService {
  async getDashboardInfo(filters?: IDashboardAdminSistemaFilters): Promise<IDashboardAdminSistemaData> {
    console.log('[Mock] DashboardAdminSistema — filtros:', filters);

    const data: IDashboardAdminSistemaData = {
      metricas: {
        totalClientes: TOTAL_CLIENTES,
        clientesAtivos: CLIENTES_ATIVOS,
        totalAdmins: TOTAL_ADMINS,
        adminsAtivos: ADMINS_ATIVOS,
      },
      graficoClientesPorMes: {
        labels: MESES_LABELS,
        datasets: [
          {
            label: 'Clientes Cadastrados',
            data: CLIENTES_POR_MES,
            borderColor: 'rgb(46, 139, 87)',
            backgroundColor: 'rgba(46, 139, 87, 0.7)',
          },
        ],
      },
      graficoDistribuicaoClientes: {
        labels: ['Ativos', 'Inativos'],
        datasets: [
          {
            label: 'Distribuição de Clientes',
            data: [CLIENTES_ATIVOS, CLIENTES_INATIVOS],
            backgroundColor: ['rgba(46, 139, 87, 0.8)', 'rgba(201, 48, 44, 0.8)'],
          },
        ],
      },
    };

    return new Promise((resolve) => setTimeout(() => resolve(data), 300));
  }
}
