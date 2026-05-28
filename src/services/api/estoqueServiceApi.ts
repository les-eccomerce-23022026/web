import type { IEstoqueService, IItemEstoque, IKpisEstoque, IEntradaEstoque } from '../contracts/estoqueService';
import { ApiClient } from '../apiClient';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { LIMITE_ESTOQUE_CRITICO } from '@/config/constantesNegocio';

export const estoqueServiceApi: IEstoqueService = {
  async listarEstoque(): Promise<IItemEstoque[]> {
    const response = await ApiClient.get<IItemEstoque[]>(API_ENDPOINTS.listarEstoque);
    return response;
  },

  async listarEstoqueCritico(limite = LIMITE_ESTOQUE_CRITICO): Promise<IItemEstoque[]> {
    const response = await ApiClient.get<IItemEstoque[]>(API_ENDPOINTS.listarEstoqueCritico(limite));
    return response;
  },

  async obterKpis(limiteCritico = LIMITE_ESTOQUE_CRITICO): Promise<IKpisEstoque> {
    const response = await ApiClient.get<IKpisEstoque>(API_ENDPOINTS.obterKpisEstoque(limiteCritico));
    return response;
  },

  async registrarEntrada(dados: IEntradaEstoque): Promise<{ mensagem: string }> {
    const response = await ApiClient.post<{ mensagem: string }>(API_ENDPOINTS.registrarEntradaEstoque, dados);
    return response;
  },
};
