import pedidosMockJson from '@/mocks/pedidosMock.json';
import cuponsTrocaMockJson from '@/mocks/cuponsTrocaMock.json';
import type { IPedido } from '@/interfaces/IPedido';
import type { ICupomTroca } from '@/interfaces/IDevolucao';
import { API_ENDPOINTS, USE_MOCK } from '@/config/apiConfig';
import { ApiClient } from './apiClient';

/**
 * Store em memória para que todas as mutações (admin e cliente) sejam
 * compartilhadas na mesma sessão do navegador.
 * O JSON estático é carregado apenas uma vez como estado inicial.
 */
const pedidosMemoria: IPedido[] = [...(pedidosMockJson as IPedido[])];
const cuponsMemoria: ICupomTroca[] = [...(cuponsTrocaMockJson as ICupomTroca[])];

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export class PedidoService {
  /** Buscar pedidos de um cliente específico */
  static async getPedidosByCliente(clienteUuid: string): Promise<IPedido[]> {
    if (USE_MOCK) {
      console.log('[Mock] Buscando pedidos do cliente:', clienteUuid);
      const resultado = pedidosMemoria.filter((p) => p.clienteUuid === clienteUuid);
      return delay(resultado);
    }

    return ApiClient.get<IPedido[]>(API_ENDPOINTS.obterPedidosCliente);
  }

  /** Buscar todos os pedidos (admin) com filtro opcional de status */
  static async getAllPedidos(statusFiltro?: string[]): Promise<IPedido[]> {
    if (USE_MOCK) {
      console.log('[Mock] Buscando todos os pedidos. Filtro:', statusFiltro);
      const resultado = statusFiltro
        ? pedidosMemoria.filter((p) => statusFiltro.includes(p.status))
        : [...pedidosMemoria];
      return delay(resultado);
    }

    return ApiClient.get<IPedido[]>(API_ENDPOINTS.obterPedidosCliente);
  }

  /**
   * RF0038 / RN0039 — Admin despacha pedido para entrega
   * Aprovado → Em Trânsito
   */
  static async despacharPedido(pedidoUuid: string): Promise<IPedido> {
    if (USE_MOCK) {
      console.log('[Mock] Despachando pedido:', pedidoUuid);
      const index = pedidosMemoria.findIndex((p) => p.uuid === pedidoUuid);
      if (index === -1) throw new Error('Pedido não encontrado');
      const statusPermitidos: string[] = ['Em Processamento', 'Aprovado'];
      if (!statusPermitidos.includes(pedidosMemoria[index].status)) {
        throw new Error('Apenas pedidos aprovados podem ser despachados');
      }
      pedidosMemoria[index] = { ...pedidosMemoria[index], status: 'Em Trânsito' };
      return delay({ ...pedidosMemoria[index] }, 400);
    }

    return ApiClient.put<IPedido>(API_ENDPOINTS.despacharPedido(pedidoUuid));
  }

  /**
   * RF0039 / RN0040 — Admin confirma entrega
   * Em Trânsito → Entregue
   */
  static async confirmarEntrega(pedidoUuid: string): Promise<IPedido> {
    if (USE_MOCK) {
      console.log('[Mock] Confirmando entrega pedido:', pedidoUuid);
      const index = pedidosMemoria.findIndex((p) => p.uuid === pedidoUuid);
      if (index === -1) throw new Error('Pedido não encontrado');
      if (pedidosMemoria[index].status !== 'Em Trânsito') {
        throw new Error('Apenas pedidos Em Trânsito podem ser confirmados como entregues');
      }
      pedidosMemoria[index] = { ...pedidosMemoria[index], status: 'Entregue' };
      return delay({ ...pedidosMemoria[index] }, 400);
    }

    return ApiClient.put<IPedido>(API_ENDPOINTS.confirmarEntrega(pedidoUuid));
  }

  /** Buscar pedidos com status de troca (admin) */
  static async getPedidosEmTroca(): Promise<IPedido[]> {
    if (USE_MOCK) {
      console.log('[Mock] Buscando pedidos em troca.');
      const statusTroca = ['Em Troca', 'Troca Autorizada', 'Trocado'];
      const resultado = pedidosMemoria.filter((p) => statusTroca.includes(p.status));
      return delay(resultado);
    }

    return ApiClient.get<IPedido[]>(API_ENDPOINTS.obterPedidosEmTroca);
  }

  /**
   * RF0040 / RN0041 / RN0043 — Solicitar troca
   * Validação: somente pedidos com status "Entregue" podem ser trocados.
   * Muda o status do pedido em memória para "Em Troca".
   */
  static async solicitarTroca(
    pedidoUuid: string,
    motivo: string,
    _itensUuids: string[],
  ): Promise<IPedido> {
    if (USE_MOCK) {
      console.log('[Mock] Solicitando troca para pedido:', pedidoUuid, motivo);
      const index = pedidosMemoria.findIndex((p) => p.uuid === pedidoUuid);
      if (index === -1) throw new Error('Pedido não encontrado');
      if (pedidosMemoria[index].status !== 'Entregue') {
        throw new Error('Somente pedidos com status "Entregue" podem ser trocados (RN0043)');
      }
      pedidosMemoria[index] = {
        ...pedidosMemoria[index],
        status: 'Em Troca',
        motivo,
      };
      return delay({ ...pedidosMemoria[index] }, 500);
    }

    return ApiClient.post<IPedido>(API_ENDPOINTS.solicitarTroca(pedidoUuid), { 
      motivo, 
      itensUuids: _itensUuids 
    });
  }

  /**
   * RF0041 — Admin autoriza troca
   * Muda "Em Troca" → "Troca Autorizada" em memória
   */
  static async autorizarTroca(pedidoUuid: string): Promise<IPedido> {
    if (USE_MOCK) {
      console.log('[Mock] Autorizando troca para pedido:', pedidoUuid);
      const index = pedidosMemoria.findIndex((p) => p.uuid === pedidoUuid);
      if (index === -1) throw new Error('Pedido não encontrado');
      pedidosMemoria[index] = {
        ...pedidosMemoria[index],
        status: 'Troca Autorizada',
      };
      return delay({ ...pedidosMemoria[index] }, 500);
    }

    return ApiClient.put<IPedido>(API_ENDPOINTS.autorizarTroca(pedidoUuid));
  }

  /**
   * RF0043 / RF0054 — Admin confirma recebimento + decide estoque
   * Muda "Troca Autorizada" → "Trocado" e gera cupom de troca (RF0044)
   */
  static async confirmarRecebimentoTroca(
    pedidoUuid: string,
    retornarEstoque: boolean,
  ): Promise<{ pedido: IPedido; cupomGerado: ICupomTroca }> {
    if (USE_MOCK) {
      console.log('[Mock] Confirmando recebimento troca:', pedidoUuid, 'Retornar estoque:', retornarEstoque);
      const index = pedidosMemoria.findIndex((p) => p.uuid === pedidoUuid);
      if (index === -1) throw new Error('Pedido não encontrado');

      pedidosMemoria[index] = {
        ...pedidosMemoria[index],
        status: 'Trocado',
      };

      const cupomGerado: ICupomTroca = {
        uuid: `cupom-troca-${Date.now()}`,
        pedidoOrigemUuid: pedidoUuid,
        clienteUuid: pedidosMemoria[index].clienteUuid,
        valor: pedidosMemoria[index].total,
        codigo: `TROCA-${Date.now()}`,
        validade: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        utilizado: false,
        dataCriacao: new Date().toISOString(),
      };

      cuponsMemoria.push(cupomGerado);
      console.log('[Mock] Cupom de troca gerado:', cupomGerado.codigo, '- Valor: R$', cupomGerado.valor);

      return delay(
        { pedido: { ...pedidosMemoria[index] }, cupomGerado },
        500,
      );
    }

    return ApiClient.put<{ pedido: IPedido; cupomGerado: ICupomTroca }>(
      API_ENDPOINTS.confirmarRecebimentoTroca(pedidoUuid), 
      { retornarEstoque }
    );
  }

  /** RF0044 — Buscar cupons de troca do cliente */
  static async getCuponsCliente(clienteUuid?: string): Promise<ICupomTroca[]> {
    if (USE_MOCK) {
      console.log('[Mock] Buscando cupons de troca.');
      const resultado = clienteUuid
        ? cuponsMemoria.filter((c) => c.clienteUuid === clienteUuid)
        : [...cuponsMemoria];
      return delay(resultado);
    }

    return ApiClient.get<ICupomTroca[]>(API_ENDPOINTS.obterCuponsCliente);
  }
}
