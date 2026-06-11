import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { PedidoService } from '@/services/pedidoService';
import { LivroService } from '@/services/livroService';

export const fetchPedidosCliente = createAsyncThunk('pedido/fetchPedidosCliente', async (clienteUuid: string) => {
  console.log('[pedidoThunks] fetchPedidosCliente - Buscando pedidos do cliente:', clienteUuid);
  const pedidos = await PedidoService.getPedidosByCliente(clienteUuid);
  console.log('[pedidoThunks] fetchPedidosCliente - Pedidos recebidos:', pedidos.length, pedidos);
  return pedidos;
});

export const fetchAllPedidos = createAsyncThunk('pedido/fetchAllPedidos', async (statusFiltro?: string[]) => {
  return PedidoService.getAllPedidos(statusFiltro);
});

export const despacharPedidoThunk = createAsyncThunk('pedido/despacharPedido', async (pedidoUuid: string) => {
  return PedidoService.despacharPedido(pedidoUuid);
});

export const confirmarEntregaThunk = createAsyncThunk('pedido/confirmarEntrega', async (pedidoUuid: string) => {
  return PedidoService.confirmarEntrega(pedidoUuid);
});

export const confirmarRecebimentoEntregaThunk = createAsyncThunk(
  'pedido/confirmarRecebimentoEntrega',
  async (pedidoUuid: string) => {
    await PedidoService.confirmarRecebimentoEntrega(pedidoUuid);
    return pedidoUuid;
  },
);

// RF0053 — Baixa em estoque: disparado após pedido aprovado/processado
export const darBaixaEstoqueThunk = createAsyncThunk('pedido/darBaixaEstoque', async (pedidoUuid: string, { getState }) => {
  const state = getState() as RootState;
  const pedido = state.pedido.pedidos.find((item) => item.uuid === pedidoUuid);
  if (!pedido) throw new Error('Pedido não encontrado para baixa de estoque');
  await LivroService.darBaixaEstoque(
    pedido.itens.map((item) => ({ livroUuid: item.livroUuid, quantidade: item.quantidade })),
  );
  return pedidoUuid;
});

export const fetchPedidosEmTroca = createAsyncThunk('pedido/fetchPedidosEmTroca', async () => {
  return PedidoService.getPedidosEmTroca();
});

export const fetchPedidosEmDevolucao = createAsyncThunk('pedido/fetchPedidosEmDevolucao', async () => {
  return PedidoService.getPedidosEmDevolucao();
});

export const solicitarTrocaThunk = createAsyncThunk(
  'pedido/solicitarTroca',
  async (payload: { pedidoUuid: string; motivo: string; itensUuids: string[] }) => {
    return PedidoService.solicitarTroca(payload.pedidoUuid, payload.motivo, payload.itensUuids);
  },
);

export const autorizarTrocaThunk = createAsyncThunk('pedido/autorizarTroca', async (pedidoUuid: string) => {
  return PedidoService.autorizarTroca(pedidoUuid);
});

export const rejeitarTrocaThunk = createAsyncThunk(
  'pedido/rejeitarTroca',
  async (payload: { pedidoUuid: string; motivo: string }) => {
    return PedidoService.rejeitarTroca(payload.pedidoUuid, payload.motivo);
  },
);

export const confirmarRecebimentoTrocaThunk = createAsyncThunk(
  'pedido/confirmarRecebimentoTroca',
  async (payload: { pedidoUuid: string; retornarEstoque: boolean }) => {
    return PedidoService.confirmarRecebimentoTroca(payload.pedidoUuid, payload.retornarEstoque);
  },
);

export const solicitarDevolucaoThunk = createAsyncThunk(
  'pedido/solicitarDevolucao',
  async (payload: { pedidoUuid: string; motivo: string; itensUuids: string[] }) => {
    return PedidoService.solicitarDevolucao(payload.pedidoUuid, payload.motivo, payload.itensUuids);
  },
);

export const autorizarDevolucaoThunk = createAsyncThunk('pedido/autorizarDevolucao', async (pedidoUuid: string) => {
  return PedidoService.autorizarDevolucao(pedidoUuid);
});

export const rejeitarDevolucaoThunk = createAsyncThunk(
  'pedido/rejeitarDevolucao',
  async (payload: { pedidoUuid: string; motivo: string }) => {
    return PedidoService.rejeitarDevolucao(payload.pedidoUuid, payload.motivo);
  },
);

export const confirmarRecebimentoDevolucaoThunk = createAsyncThunk(
  'pedido/confirmarRecebimentoDevolucao',
  async (payload: { pedidoUuid: string; retornarEstoque: boolean }) => {
    return PedidoService.confirmarRecebimentoDevolucao(payload.pedidoUuid, payload.retornarEstoque);
  },
);
