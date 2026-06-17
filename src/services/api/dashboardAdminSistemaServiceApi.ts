import type { IDashboardAdminSistemaData } from '@/interfaces/dashboardAdminSistema';
import { ApiClient } from '../apiClient';
import type { IDashboardAdminSistemaService, IDashboardAdminSistemaFilters } from '../contracts/dashboardAdminSistemaService';

interface IRespostaBackend {
  clientes: {
    total: number;
    ativos: number;
    inativos: number;
    crescimentoMes: number;
    cadastradosPorMes: Array<{ mes: string; quantidade: number }>;
  };
  administradores: {
    total: number;
    ativos: number;
    inativos: number;
  };
}

export class DashboardAdminSistemaServiceApi implements IDashboardAdminSistemaService {
  async getDashboardInfo(filters?: IDashboardAdminSistemaFilters): Promise<IDashboardAdminSistemaData> {
    const params = new URLSearchParams();
    if (filters?.periodo && filters.periodo !== 'todos') {
      params.append('periodo', filters.periodo);
    }
    if (filters?.statusCliente && filters.statusCliente !== 'todos') {
      params.append('statusCliente', filters.statusCliente);
    }

    const queryString = params.toString();
    const url = queryString
      ? `/api/admin-sistema/dashboard?${queryString}`
      : '/api/admin-sistema/dashboard';

    const raw = await ApiClient.get<IRespostaBackend>(url);

    const labels = raw.clientes.cadastradosPorMes.map((m) => m.mes);
    const quantidades = raw.clientes.cadastradosPorMes.map((m) => m.quantidade);

    return {
      metricas: {
        totalClientes: raw.clientes.total,
        clientesAtivos: raw.clientes.ativos,
        totalAdmins: raw.administradores.total,
        adminsAtivos: raw.administradores.ativos,
      },
      graficoClientesPorMes: {
        labels,
        datasets: [
          {
            label: 'Clientes Cadastrados',
            data: quantidades,
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
            data: [raw.clientes.ativos, raw.clientes.inativos],
            backgroundColor: ['rgba(46, 139, 87, 0.8)', 'rgba(201, 48, 44, 0.8)'],
          },
        ],
      },
    };
  }
}
