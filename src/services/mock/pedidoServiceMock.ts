import pedidosMockJson from '@/mocks/pedidosMock.json';
import cuponsTrocaMockJson from '@/mocks/cuponsTrocaMock.json';
import type { IPedido } from '@/interfaces/pedido';
import type { ICupomTroca } from '@/interfaces/devolucao';
import type { IPedidoService } from '@/services/contracts/pedidoService';

/** State em memória para que mutações admin e cliente sejam reflexivas na mesma sessão */
const pedidosMemoria: IPedido[] = [...(pedidosMockJson as IPedido[])];
const cuponsMemoria: ICupomTroca[] = [...(cuponsTrocaMockJson as ICupomTroca[])];

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export class PedidoServiceMock implements IPedidoService {
  async getPedidosByCliente(clienteUuid: string): Promise<IPedido[]> {
    console.log('[Mock] Buscando pedidos do cliente:', clienteUuid);
    const resultado = pedidosMemoria.filter((p) => p.clienteUuid === clienteUuid);
    return delay(resultado);
  }

  async getAllPedidos(statusFiltro?: string[]): Promise<IPedido[]> {
    console.log('[Mock] Buscando todos os pedidos. Filtro:', statusFiltro);
    const resultado = statusFiltro
      ? pedidosMemoria.filter((p) => statusFiltro.includes(p.status))
      : [...pedidosMemoria];
    return delay(resultado);
  }

  async despacharPedido(pedidoUuid: string): Promise<IPedido> {
    console.log('[Mock] Despachando pedido:', pedidoUuid);
    const index = pedidosMemoria.findIndex((p) => p.uuid === pedidoUuid);
    if (index === -1) throw new Error('Pedido não encontrado');

    const statusPermitidos: string[] = ['Em Processamento', 'Aprovado', 'Preparando'];
    if (!statusPermitidos.includes(pedidosMemoria[index].status)) {
      throw new Error('Apenas pedidos aprovados podem ser despachados');
    }

    pedidosMemoria[index] = { ...pedidosMemoria[index], status: 'Em Trânsito' };
    return delay({ ...pedidosMemoria[index] }, 400);
  }

  async confirmarEntrega(pedidoUuid: string): Promise<IPedido> {
    console.log('[Mock] Confirmando entrega pedido:', pedidoUuid);
    const index = pedidosMemoria.findIndex((p) => p.uuid === pedidoUuid);
    if (index === -1) throw new Error('Pedido não encontrado');
    if (pedidosMemoria[index].status !== 'Em Trânsito') {
      throw new Error('Apenas pedidos Em Trânsito podem ser confirmados como entregues');
    }

    pedidosMemoria[index] = { ...pedidosMemoria[index], status: 'Entregue' };
    return delay({ ...pedidosMemoria[index] }, 400);
  }

  async registrarFalhaEntrega(pedidoUuid: string): Promise<IPedido> {
    console.log('[Mock] Registrando falha entrega:', pedidoUuid);
    const index = pedidosMemoria.findIndex((p) => p.uuid === pedidoUuid);
    if (index === -1) throw new Error('Pedido não encontrado');
    
    pedidosMemoria[index] = { ...pedidosMemoria[index], status: 'Falha na Entrega' };
    return delay({ ...pedidosMemoria[index] }, 400);
  }

  async reagendarEntrega(pedidoUuid: string, _novoEndereco: object): Promise<IPedido> {
    console.log('[Mock] Reagendando entrega:', pedidoUuid);
    const index = pedidosMemoria.findIndex((p) => p.uuid === pedidoUuid);
    if (index === -1) throw new Error('Pedido não encontrado');
    
    pedidosMemoria[index] = { ...pedidosMemoria[index], status: 'Em Processamento' };
    return delay({ ...pedidosMemoria[index] }, 400);
  }

  async getPedidosEmTroca(): Promise<IPedido[]> {
    console.log('[Mock] Buscando pedidos em troca.');
    const statusTroca = ['Em Troca', 'Troca Autorizada', 'Trocado'];
    const resultado = pedidosMemoria.filter((p) => statusTroca.includes(p.status));
    return delay(resultado);
  }

  async solicitarTroca(
    pedidoUuid: string,
    motivo: string,
    _itensUuids: string[],
  ): Promise<IPedido> {
    console.log('[Mock] Solicitando troca para pedido:', pedidoUuid, motivo);
    const index = pedidosMemoria.findIndex((p) => p.uuid === pedidoUuid);
    if (index === -1) throw new Error('Pedido não encontrado');
    if (pedidosMemoria[index].status !== 'Entregue') {
      throw new Error('Somente pedidos com status "Entregue" podem ser trocados (RN0043)');
    }

    pedidosMemoria[index] = { ...pedidosMemoria[index], status: 'Em Troca', motivo };
    return delay({ ...pedidosMemoria[index] }, 500);
  }

  async autorizarTroca(pedidoUuid: string): Promise<IPedido> {
    console.log('[Mock] Autorizando troca para pedido:', pedidoUuid);
    const index = pedidosMemoria.findIndex((p) => p.uuid === pedidoUuid);
    if (index === -1) throw new Error('Pedido não encontrado');

    pedidosMemoria[index] = { ...pedidosMemoria[index], status: 'Troca Autorizada' };
    return delay({ ...pedidosMemoria[index] }, 500);
  }

  async confirmarRecebimentoTroca(
    pedidoUuid: string,
    retornarEstoque: boolean,
  ): Promise<{ pedido: IPedido; cupomGerado: ICupomTroca }> {
    console.log('[Mock] Confirmando recebimento troca:', pedidoUuid, 'Retornar estoque:', retornarEstoque);
    const index = pedidosMemoria.findIndex((p) => p.uuid === pedidoUuid);
    if (index === -1) throw new Error('Pedido não encontrado');

    pedidosMemoria[index] = { ...pedidosMemoria[index], status: 'Trocado' };

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

    return delay({ pedido: { ...pedidosMemoria[index] }, cupomGerado }, 500);
  }

  async getCuponsCliente(clienteUuid?: string): Promise<ICupomTroca[]> {
    console.log('[Mock] Buscando cupons de troca.');
    const resultado = clienteUuid
      ? cuponsMemoria.filter((c) => c.clienteUuid === clienteUuid)
      : [...cuponsMemoria];
    return delay(resultado);
  }
}
