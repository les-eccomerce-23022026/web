import type { IEstoqueService, IItemEstoque, IKpisEstoque, IEntradaEstoque } from '../contracts/estoqueService';
import { ApiClient } from '../apiClient';

export const estoqueServiceApi: IEstoqueService = {
  async listarEstoque(): Promise<IItemEstoque[]> {
    const response = await ApiClient.get<IItemEstoque[]>('/admin/estoque');
    return response;
  },

  async listarEstoqueCritico(limite = 5): Promise<IItemEstoque[]> {
    const response = await ApiClient.get<IItemEstoque[]>(`/admin/estoque/critico?limite=${limite}`);
    return response;
  },

  async obterKpis(limiteCritico = 5): Promise<IKpisEstoque> {
    const response = await ApiClient.get<IKpisEstoque>(`/admin/estoque/kpis?limite=${limiteCritico}`);
    return response;
  },

  async registrarEntrada(dados: IEntradaEstoque): Promise<{ mensagem: string }> {
    const response = await ApiClient.post<{ mensagem: string }>('/admin/estoque/entrada', dados);
    return response;
  },
};
