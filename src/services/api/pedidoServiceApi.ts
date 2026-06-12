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
  dataHoraEntrega?: string;
  dataEntrega?: string;
  dataPrevistaEntrega?: string;
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
    EM_PROCESSAMENTO: 'Em Processamento',
    AGUARDANDO_PAGAMENTO: 'Pagamento Pendente',
    APROVADA: 'Em Processamento',
    REPROVADA: 'Cancelado',
    EM_TRANSITO: 'Em Trânsito',
    ENTREGUE: 'Entregue',
    EM_TROCA: 'Em Troca',
    TROCA_AUTORIZADA: 'Troca Autorizada',
    TROCA_REJEITADA: 'Troca Rejeitada',
    CANCELADA: 'Cancelado',
    FALHA_NA_ENTREGA: 'Em Trânsito',
    CONCLUIDA: 'Trocado',
    TROCA_CONCLUIDA: 'Trocado',
    EM_DEVOLUCAO: 'Em Devolução',
    DEVOLUCAO_AUTORIZADA: 'Devolução Autorizada',
    DEVOLUCAO_REJEITADA: 'Devolução Rejeitada',
    DEVOLUCAO_CONCLUIDA: 'Devolvido',
    DEVOLVIDA: 'Devolvido',
  };
  // Fallback neutro: status desconhecido não deve virar 'Em Processamento'.
  return map[key] ?? 'Pendentes';
}

function vendaApiParaPedido(v: IVendaApi): IPedido {
  const dataIso =
    typeof v.criadoEm === 'string' ? v.criadoEm : new Date(v.criadoEm).toISOString();
  return {
    uuid: v.uuid,
    data: dataIso,
    dataEntrega: v.dataHoraEntrega || v.dataEntrega,
    dataPrevistaEntrega: v.dataPrevistaEntrega,
    clienteUuid: v.usuarioUuid,
    total: v.totalVenda,
    status: mapStatusVendaParaPedido(v.status),
    motivo: v.motivoTroca,
    itens: v.itens.map((i) => ({
      uuid: i.uuid,
      livroUuid: i.livroUuid,
      quantidade: i.quantidade,
      precoUnitario: i.precoUnitario ?? 0,
      categoria: 'Livro',
      emTroca: i.emTroca,
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
      precoUnitario: i.precoUnitario ?? 0,
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

  async confirmarRecebimentoEntrega(pedidoUuid: string): Promise<void> {
    await ApiClient.patch<void>(API_ENDPOINTS.confirmarRecebimentoEntrega(pedidoUuid));
  }

  async getPedidosEmTroca(): Promise<IPedido[]> {
    const raw = await ApiClient.get<IVendaApi[]>(API_ENDPOINTS.obterPedidosEmTroca);
    return raw.map(vendaApiParaPedido);
  }

  async getPedidosEmDevolucao(): Promise<IPedido[]> {
    const raw = await ApiClient.get<IVendaApi[]>(API_ENDPOINTS.obterPedidosEmDevolucao);
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
    const response = await ApiClient.get<{ tipo: string; codigo: string; valor: number | string }[]>(API_ENDPOINTS.obterCuponsCliente);
    // Mapear formato simplificado do backend para formato ICupomTroca esperado pelo frontend
    return response.map((cupom) => ({
      uuid: cupom.codigo, // Usar código como UUID temporário
      pedidoOrigemUuid: '',
      clienteUuid: '',
      valor: typeof cupom.valor === 'string' ? parseFloat(cupom.valor) : cupom.valor,
      codigo: cupom.codigo,
      validade: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Validade padrão de 1 ano
      utilizado: false,
      dataCriacao: new Date().toISOString(),
    }));
  }

  async solicitarDevolucao(
    pedidoUuid: string,
    motivo: string,
    itensUuids: string[],
  ): Promise<IPedido> {
    return ApiClient.post<IPedido>(API_ENDPOINTS.solicitarDevolucao(pedidoUuid), {
      motivo,
      itensUuids,
    });
  }

  async autorizarDevolucao(pedidoUuid: string): Promise<IPedido> {
    return ApiClient.patch<IPedido>(API_ENDPOINTS.autorizarDevolucao(pedidoUuid));
  }

  async rejeitarDevolucao(pedidoUuid: string, motivo: string): Promise<IPedido> {
    return ApiClient.patch<IPedido>(API_ENDPOINTS.rejeitarDevolucao(pedidoUuid), { motivo });
  }

  async confirmarRecebimentoDevolucao(
    pedidoUuid: string,
    retornarEstoque: boolean,
  ): Promise<{ pedido: IPedido; reembolsoProcessado: boolean }> {
    return ApiClient.patch<{ pedido: IPedido; reembolsoProcessado: boolean }>(
      API_ENDPOINTS.confirmarRecebimentoDevolucao(pedidoUuid),
      { retornarEstoque },
    );
  }

  async aprovarPagamento(pedidoUuid: string): Promise<void> {
    await ApiClient.post<void>('/api/admin/testes/mudar-status-venda', {
      vendaUuid: pedidoUuid,
      novoStatus: 'EM_PROCESSAMENTO',
    });
  }

  async rejeitarPagamento(pedidoUuid: string): Promise<void> {
    await ApiClient.post<void>('/api/admin/testes/mudar-status-venda', {
      vendaUuid: pedidoUuid,
      novoStatus: 'CANCELADA',
    });
  }

  async mudarStatusVenda(pedidoUuid: string, novoStatus: string): Promise<void> {
    await ApiClient.post<void>('/api/admin/testes/mudar-status-venda', {
      vendaUuid: pedidoUuid,
      novoStatus,
    });
  }
}
