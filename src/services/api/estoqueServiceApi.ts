import { IEstoqueService, IItemEstoque, IKpisEstoque, IEntradaEstoque } from '../contracts/estoqueService';
import { api } from './authServiceApi';

export const estoqueServiceApi: IEstoqueService = {
  async listarEstoque(): Promise<IItemEstoque[]> {
    const response = await api.get('/admin/estoque');
    return response.data;
  },

  async listarEstoqueCritico(limite = 5): Promise<IItemEstoque[]> {
    const response = await api.get('/admin/estoque/critico', { params: { limite } });
    return response.data;
  },

  async obterKpis(limiteCritico = 5): Promise<IKpisEstoque> {
    const response = await api.get('/admin/estoque/kpis', { params: { limite: limiteCritico } });
    return response.data;
  },

  async registrarEntrada(dados: IEntradaEstoque): Promise<{ mensagem: string }> {
    const response = await api.post('/admin/estoque/entrada', dados);
    return response.data;
  },
};
