import pedidosMockJson from '@/mocks/pedidosMock.json';
import cuponsTrocaMockJson from '@/mocks/cuponsTrocaMock.json';
import type { IPedido } from '@/interfaces/IPedido';
import type { ICupomTroca } from '@/interfaces/IDevolucao';
import { API_ENDPOINTS, USE_MOCK } from '@/config/apiConfig';

/**
 * Store em memória para que todas as mutações (admin e cliente) sejam
 * compartilhadas na mesma sessão do navegador.
 * O JSON estático é carregado apenas uma vez como estado inicial.
 */
let pedidosMemoria: IPedido[] = [...(pedidosMockJson as IPedido[])];
let cuponsMemoria: ICupomTroca[] = [...(cuponsTrocaMockJson as ICupomTroca[])];

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

    const response = await fetch(API_ENDPOINTS.obterPedidosCliente);
    if (!response.ok) throw new Error('Erro ao buscar pedidos');
    return response.json();
  }

  /** Buscar todos os pedidos (admin) */
  static async getAllPedidos(): Promise<IPedido[]> {
    if (USE_MOCK) {
      console.log('[Mock] Buscando todos os pedidos.');
      return delay([...pedidosMemoria]);
    }

    const response = await fetch(API_ENDPOINTS.obterPedidosCliente);
    if (!response.ok) throw new Error('Erro ao buscar pedidos');
    return response.json();
  }

  /** Buscar pedidos com status de troca (admin) */
  static async getPedidosEmTroca(): Promise<IPedido[]> {
    if (USE_MOCK) {
      console.log('[Mock] Buscando pedidos em troca.');
      const statusTroca = ['Em Troca', 'Troca Autorizada', 'Trocado'];
      const resultado = pedidosMemoria.filter((p) => statusTroca.includes(p.status));
      return delay(resultado);
    }

    const response = await fetch(API_ENDPOINTS.obterPedidosEmTroca);
    if (!response.ok) throw new Error('Erro ao buscar pedidos em troca');
    return response.json();
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

    const response = await fetch(API_ENDPOINTS.solicitarTroca(pedidoUuid), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo, itensUuids: _itensUuids }),
    });
    if (!response.ok) throw new Error('Erro ao solicitar troca');
    return response.json();
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

    const response = await fetch(API_ENDPOINTS.autorizarTroca(pedidoUuid), {
      method: 'PUT',
    });
    if (!response.ok) throw new Error('Erro ao autorizar troca');
    return response.json();
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

    const response = await fetch(API_ENDPOINTS.confirmarRecebimentoTroca(pedidoUuid), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ retornarEstoque }),
    });
    if (!response.ok) throw new Error('Erro ao confirmar recebimento');
    return response.json();
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

    const response = await fetch(API_ENDPOINTS.obterCuponsCliente);
    if (!response.ok) throw new Error('Erro ao buscar cupons');
    return response.json();
  }
}
