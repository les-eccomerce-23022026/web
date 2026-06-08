import type { IPedido, StatusPedido } from '@/interfaces/pedido';
import type { ICupomTroca } from '@/interfaces/devolucao';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { ApiClient } from '../apiClient';
import type { IPedidoService } from '../contracts/pedidoService';

/** Formato retornado por GET /minhas-vendas (IVenda no backend). */
interface IVendaApi {
  uuid: string;
  totalItens: number;
  frete: number;
  totalVenda: number;
  status: string;
  usuarioUuid: string;
  motivoTroca?: string;
  itens: Array<{
    uuid: string;
    livroUuid: string;
    quantidade: number;
    precoUnitario: number;
    emTroca?: boolean;
  }>;
  criadoEm: string;
  dataHoraEntrega?: string; // Data de entrega (ISO 8601)
  dataEntrega?: string; // Data de entrega (ISO 8601) - campo alternativo
}

/** Formato retornado por GET /admin/pedidos (vendaParaPayloadPedidoAdmin no backend). */
interface IPedidoAdminApi {
  uuid: string;
  data: string;
  clienteUuid: string;
  total: number;
  status: string;
  itens: Array<{
    livroUuid: string;
    quantidade: number;
    precoUnitario: number;
    categoria: string;
  }>;
}

function mapStatusVendaParaPedido(s: string): StatusPedido {
  const key = s.trim().toUpperCase();
  const map: Record<string, StatusPedido> = {
    'EM PROCESSAMENTO': 'Em Processamento',
    'AGUARDANDO PAGAMENTO': 'Aguardando Pagamento',
    APROVADA: 'Em Processamento',
    REPROVADA: 'Cancelado',
    'EM TRÂNSITO': 'Em Trânsito',
    ENTREGUE: 'Entregue',
    'EM TROCA': 'Em Troca',
    'TROCA AUTORIZADA': 'Troca Autorizada',
    'TROCA REJEITADA': 'Troca Rejeitada',
    CONCLUÍDA: 'Trocado',
    'TROCA CONCLUÍDA': 'Trocado',
  };
  return map[key] ?? 'Em Processamento';
}

function vendaApiParaPedido(v: IVendaApi): IPedido {
  const dataIso =
    typeof v.criadoEm === 'string' ? v.criadoEm : new Date(v.criadoEm).toISOString();
  return {
    uuid: v.uuid,
    data: dataIso,
    dataEntrega: v.dataHoraEntrega || v.dataEntrega,
    clienteUuid: v.usuarioUuid,
    total: v.totalVenda,
    status: mapStatusVendaParaPedido(v.status),
    motivo: v.motivoTroca,
    itens: v.itens.map((i) => ({
      livroUuid: i.livroUuid,
      quantidade: i.quantidade,
      precoUnitario: i.precoUnitario,
      categoria: 'Livro',
    })),
  };
}

function pedidoAdminApiParaPedido(v: IPedidoAdminApi): IPedido {
  return {
    uuid: v.uuid,
    data: v.data,
    clienteUuid: v.clienteUuid,
    total: v.total,
    status: mapStatusVendaParaPedido(v.status),
    itens: v.itens.map((i) => ({
      livroUuid: i.livroUuid,
      quantidade: i.quantidade,
      precoUnitario: i.precoUnitario,
      categoria: i.categoria,
    })),
  };
}

export class PedidoServiceApi implements IPedidoService {
  async getPedidosByCliente(_clienteUuid: string): Promise<IPedido[]> {
    const raw = await ApiClient.get<IVendaApi[]>(API_ENDPOINTS.obterPedidosCliente);
    return raw.map(vendaApiParaPedido);
  }

  async getAllPedidos(_statusFiltro?: string[]): Promise<IPedido[]> {
    const raw = await ApiClient.get<IPedidoAdminApi[]>(API_ENDPOINTS.obterTodosPedidosAdmin);
    return raw.map(pedidoAdminApiParaPedido);
  }

  async despacharPedido(pedidoUuid: string): Promise<IPedido> {
    return ApiClient.patch<IPedido>(API_ENDPOINTS.despacharPedido(pedidoUuid));
  }

  async confirmarEntrega(pedidoUuid: string): Promise<IPedido> {
    return ApiClient.patch<IPedido>(API_ENDPOINTS.confirmarEntrega(pedidoUuid));
  }

  async getPedidosEmTroca(): Promise<IPedido[]> {
    const raw = await ApiClient.get<IVendaApi[]>(API_ENDPOINTS.obterPedidosEmTroca);
    return raw.map(vendaApiParaPedido);
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
    return ApiClient.patch<IPedido>(API_ENDPOINTS.autorizarTroca(pedidoUuid));
  }

  async rejeitarTroca(pedidoUuid: string, motivo: string): Promise<IPedido> {
    return ApiClient.patch<IPedido>(API_ENDPOINTS.rejeitarTroca(pedidoUuid), { motivo });
  }

  async confirmarRecebimentoTroca(
    pedidoUuid: string,
    retornarEstoque: boolean,
  ): Promise<{ pedido: IPedido; cupomGerado: ICupomTroca }> {
    return ApiClient.patch<{ pedido: IPedido; cupomGerado: ICupomTroca }>(
      API_ENDPOINTS.confirmarRecebimentoTroca(pedidoUuid),
      { retornarEstoque },
    );
  }

  async getCuponsCliente(_clienteUuid?: string): Promise<ICupomTroca[]> {
    return ApiClient.get<ICupomTroca[]>(API_ENDPOINTS.obterCuponsCliente);
  }
}
