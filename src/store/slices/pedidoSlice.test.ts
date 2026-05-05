import { describe, expect, it } from 'vitest';
import reducer, { adicionarPedido, atualizarStatusPedido } from './pedidoSlice';
import type { IPedido } from './testDependencias';

function criarPedidoBase(uuid: string): IPedido {
  return {
    uuid,
    data: '2026-01-01T00:00:00.000Z',
    clienteUuid: 'cliente-1',
    itens: [],
    total: 100,
    status: 'Preparando',
  };
}

describe('pedidoSlice reducer', () => {
  it('adiciona novo pedido no topo da lista', () => {
    const estadoInicial = { pedidos: [criarPedidoBase('pedido-antigo')], status: 'idle' as const, error: null };
    const proximoEstado = reducer(estadoInicial, adicionarPedido(criarPedidoBase('pedido-novo')));

    expect(proximoEstado.pedidos[0].uuid).toBe('pedido-novo');
    expect(proximoEstado.pedidos[1].uuid).toBe('pedido-antigo');
  });

  it('atualiza status quando pedido existe', () => {
    const estadoInicial = { pedidos: [criarPedidoBase('pedido-1')], status: 'idle' as const, error: null };
    const proximoEstado = reducer(
      estadoInicial,
      atualizarStatusPedido({ uuid: 'pedido-1', novoStatus: 'Entregue' }),
    );

    expect(proximoEstado.pedidos[0].status).toBe('Entregue');
  });

  it('ignora atualização quando pedido não existe', () => {
    const estadoInicial = { pedidos: [criarPedidoBase('pedido-1')], status: 'idle' as const, error: null };
    const proximoEstado = reducer(
      estadoInicial,
      atualizarStatusPedido({ uuid: 'pedido-inexistente', novoStatus: 'Entregue' }),
    );

    expect(proximoEstado.pedidos[0].status).toBe('Preparando');
  });
});
