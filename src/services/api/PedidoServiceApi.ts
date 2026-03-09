import type { IPedido } from '@/interfaces/IPedido';
import type { ICupomTroca } from '@/interfaces/IDevolucao';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { ApiClient } from '@/services/apiClient';
import type { IPedidoService } from '@/services/contracts/IPedidoService';

export class PedidoServiceApi implements IPedidoService {
  async getPedidosByCliente(_clienteUuid: string): Promise<IPedido[]> {
    return ApiClient.get<IPedido[]>(API_ENDPOINTS.obterPedidosCliente);
  }

  async getAllPedidos(_statusFiltro?: string[]): Promise<IPedido[]> {
    return ApiClient.get<IPedido[]>(API_ENDPOINTS.obterTodosPedidosAdmin);
  }

  async despacharPedido(pedidoUuid: string): Promise<IPedido> {
    return ApiClient.put<IPedido>(API_ENDPOINTS.despacharPedido(pedidoUuid));
  }

  async confirmarEntrega(pedidoUuid: string): Promise<IPedido> {
    return ApiClient.put<IPedido>(API_ENDPOINTS.confirmarEntrega(pedidoUuid));
  }

  async getPedidosEmTroca(): Promise<IPedido[]> {
    return ApiClient.get<IPedido[]>(API_ENDPOINTS.obterPedidosEmTroca);
  }

  async solicitarTroca(
    pedidoUuid: string,
    motivo: string,
    itensUuids: string[],
  ): Promise<IPedido> {
    return ApiClient.post<IPedido>(API_ENDPOINTS.solicitarTroca(pedidoUuid), {
      motivo,
      itensUuids,
    });
  }

  async autorizarTroca(pedidoUuid: string): Promise<IPedido> {
    return ApiClient.put<IPedido>(API_ENDPOINTS.autorizarTroca(pedidoUuid));
  }

  async confirmarRecebimentoTroca(
    pedidoUuid: string,
    retornarEstoque: boolean,
  ): Promise<{ pedido: IPedido; cupomGerado: ICupomTroca }> {
    return ApiClient.put<{ pedido: IPedido; cupomGerado: ICupomTroca }>(
      API_ENDPOINTS.confirmarRecebimentoTroca(pedidoUuid),
      { retornarEstoque },
    );
  }

  async getCuponsCliente(_clienteUuid?: string): Promise<ICupomTroca[]> {
    return ApiClient.get<ICupomTroca[]>(API_ENDPOINTS.obterCuponsCliente);
  }
}
