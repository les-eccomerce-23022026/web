import type { IPedido, StatusPedido } from '@/interfaces/pedido';
import type { ICupomTroca } from '@/interfaces/devolucao';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { ApiClient } from '@/services/apiClient';
import type { IPedidoService } from '@/services/contracts/pedidoService';
import { EntregaServiceApi } from './entregaServiceApi';

/** Formato retornado por GET /minhas-vendas (IVenda no backend). */
interface IVendaApi {
  id: string;
  totalItens: number;
  frete: number;
  totalVenda: number;
  status: string;
  usuarioUuid: string;
  motivoTroca?: string;
  itens: Array<{
    id: string;
    livroUuid: string;
    quantidade: number;
    precoUnitario: number;
    emTroca?: boolean;
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
    'FALHA NA ENTREGA': 'Falha na Entrega',
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
    motivo: v.motivoTroca,
    itens: v.itens.map((i) => ({
      uuid: i.id,
      livroUuid: i.livroUuid,
      quantidade: i.quantidade,
      precoUnitario: i.precoUnitario,
      categoria: 'Livro',
      emTroca: i.emTroca,
    })),
  };
}

export class PedidoServiceApi implements IPedidoService {
  private entregaService = new EntregaServiceApi();

  async getPedidosByCliente(_clienteUuid: string): Promise<IPedido[]> {
    const raw = await ApiClient.get<IVendaApi[]>(API_ENDPOINTS.obterPedidosCliente);
    return raw.map(vendaApiParaPedido);
  }

  async getAllPedidos(_statusFiltro?: string[]): Promise<IPedido[]> {
    const raw = await ApiClient.get<IVendaApi[]>(API_ENDPOINTS.obterTodosPedidosAdmin);
    return raw.map(vendaApiParaPedido);
  }

  async despacharPedido(pedidoUuid: string): Promise<IPedido> {
    const raw = await ApiClient.put<IVendaApi>(API_ENDPOINTS.despacharPedido(pedidoUuid));
    return vendaApiParaPedido(raw);
  }

  async confirmarEntrega(pedidoUuid: string): Promise<IPedido> {
    // Busca a entrega vinculada para usar o endpoint de entrega (S3-B)
    const entregas = await this.entregaService.listarPorVenda(pedidoUuid);
    if (entregas.length === 0) throw new Error('Nenhuma entrega vinculada a este pedido.');
    
    // Confirma a mais recente
    await this.entregaService.confirmarRecebimento(entregas[0].uuid);
    
    // Retorna o pedido atualizado
    const raw = await ApiClient.get<IVendaApi>(`${API_ENDPOINTS.criarVenda}/${pedidoUuid}`);
    return vendaApiParaPedido(raw);
  }

  async registrarFalhaEntrega(pedidoUuid: string): Promise<IPedido> {
    const entregas = await this.entregaService.listarPorVenda(pedidoUuid);
    if (entregas.length === 0) throw new Error('Nenhuma entrega vinculada a este pedido.');
    
    await this.entregaService.registrarFalha(entregas[0].uuid);
    
    const raw = await ApiClient.get<IVendaApi>(`${API_ENDPOINTS.criarVenda}/${pedidoUuid}`);
    return vendaApiParaPedido(raw);
  }

  async reagendarEntrega(pedidoUuid: string, novoEndereco: object): Promise<IPedido> {
    const entregas = await this.entregaService.listarPorVenda(pedidoUuid);
    if (entregas.length === 0) throw new Error('Nenhuma entrega vinculada a este pedido.');
    
    await this.entregaService.reagendarEntrega(entregas[0].uuid, novoEndereco);
    
    const raw = await ApiClient.get<IVendaApi>(`${API_ENDPOINTS.criarVenda}/${pedidoUuid}`);
    return vendaApiParaPedido(raw);
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
    const raw = await ApiClient.post<IVendaApi>(API_ENDPOINTS.solicitarTroca(pedidoUuid), {
      motivo,
      itensUuids,
    });
    return vendaApiParaPedido(raw);
  }

  async autorizarTroca(pedidoUuid: string): Promise<IPedido> {
    const raw = await ApiClient.put<IVendaApi>(API_ENDPOINTS.autorizarTroca(pedidoUuid));
    return vendaApiParaPedido(raw);
  }

  async confirmarRecebimentoTroca(
    pedidoUuid: string,
    retornarEstoque: boolean,
  ): Promise<{ pedido: IPedido; cupomGerado: ICupomTroca }> {
    const res = await ApiClient.put<{ venda: IVendaApi; cupomGerado: ICupomTroca }>(
      API_ENDPOINTS.confirmarRecebimentoTroca(pedidoUuid),
      { retornarEstoque },
    );
    return {
      pedido: vendaApiParaPedido(res.venda),
      cupomGerado: res.cupomGerado,
    };
  }

  async getCuponsCliente(_clienteUuid?: string): Promise<ICupomTroca[]> {
    return ApiClient.get<ICupomTroca[]>(API_ENDPOINTS.obterCuponsCliente);
  }
}
