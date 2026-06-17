import { ApiClient } from '../apiClient';
import type { IAnaliseVendasService, IFiltroAnaliseVendas, IRespostaAnaliseVendas } from '../contracts/analiseVendasService';

export class AnaliseVendasServiceApi implements IAnaliseVendasService {
  async obterAnaliseVendasPorCategoria(filtro: IFiltroAnaliseVendas): Promise<IRespostaAnaliseVendas> {
    const params = new URLSearchParams();
    params.append('dataInicio', filtro.dataInicio);
    params.append('dataFim', filtro.dataFim);

    if (filtro.categorias && filtro.categorias.length > 0) {
      filtro.categorias.forEach(cat => params.append('categorias', cat));
    }

    return ApiClient.get<IRespostaAnaliseVendas>(
      `/api/admin/analise-vendas-categoria?${params.toString()}`
    );
  }
}
