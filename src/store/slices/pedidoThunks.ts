import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { PedidoService } from '@/services/pedidoService';
import { LivroService } from '@/services/livroService';

export const fetchPedidosCliente = createAsyncThunk('pedido/fetchPedidosCliente', async (clienteUuid: string) => {
  return PedidoService.getPedidosByCliente(clienteUuid);
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

export const solicitarTrocaThunk = createAsyncThunk(
  'pedido/solicitarTroca',
  async (payload: { pedidoUuid: string; motivo: string; itensUuids: string[] }) => {
    return PedidoService.solicitarTroca(payload.pedidoUuid, payload.motivo, payload.itensUuids);
  },
);

export const autorizarTrocaThunk = createAsyncThunk('pedido/autorizarTroca', async (pedidoUuid: string) => {
  return PedidoService.autorizarTroca(pedidoUuid);
});

export const confirmarRecebimentoTrocaThunk = createAsyncThunk(
  'pedido/confirmarRecebimentoTroca',
  async (payload: { pedidoUuid: string; retornarEstoque: boolean }) => {
    return PedidoService.confirmarRecebimentoTroca(payload.pedidoUuid, payload.retornarEstoque);
  },
);
