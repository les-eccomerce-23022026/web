import type { IPedido, StatusPedido } from '@/interfaces/pedido';
import type { ICupomTroca } from '@/interfaces/devolucao';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { ApiClient } from '@/services/apiClient';
import type { IPedidoService } from '@/services/contracts/pedidoService';

/** Formato retornado por GET /minhas-vendas (IVenda no backend). */
interface IVendaApi {
  id: string;
  totalItens: number;
  frete: number;
  totalVenda: number;
  status: string;
  usuarioUuid: string;
  itens: Array<{
    id: string;
    livroUuid: string;
    quantidade: number;
    precoUnitario: number;
  }>;
  criadoEm: string;
}

function mapStatusVendaParaPedido(s: string): StatusPedido {
  const key = s.trim().toUpperCase();
  const map: Record<string, StatusPedido> = {
    'EM PROCESSAMENTO': 'Em Processamento',
    'AGUARDANDO PAGAMENTO': 'Aguardando Pagamento',
    APROVADA: 'Preparando',
    REPROVADA: 'Cancelado',
    'EM TRÂNSITO': 'Em Trânsito',
    ENTREGUE: 'Entregue',
    'EM TROCA': 'Em Troca',
    'TROCA AUTORIZADA': 'Troca Autorizada',
    CONCLUÍDA: 'Trocado',
  };
  return map[key] ?? 'Em Processamento';
}

function vendaApiParaPedido(v: IVendaApi): IPedido {
  const dataIso =
    typeof v.criadoEm === 'string' ? v.criadoEm : new Date(v.criadoEm).toISOString();
  return {
    uuid: v.id,
    data: dataIso,
    clienteUuid: v.usuarioUuid,
    total: v.totalVenda,
    status: mapStatusVendaParaPedido(v.status),
    itens: v.itens.map((i) => ({
      livroUuid: i.livroUuid,
      quantidade: i.quantidade,
      precoUnitario: i.precoUnitario,
      categoria: 'Livro',
    })),
  };
}

export class PedidoServiceApi implements IPedidoService {
  async getPedidosByCliente(_clienteUuid: string): Promise<IPedido[]> {
    const raw = await ApiClient.get<IVendaApi[]>(API_ENDPOINTS.obterPedidosCliente);
    return raw.map(vendaApiParaPedido);
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
