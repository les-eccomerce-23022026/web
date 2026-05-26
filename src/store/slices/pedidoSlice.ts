import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { logout } from './authSlice';
import type { IPedido, StatusPedido } from '@/interfaces/pedido';
import {
  autorizarTrocaThunk,
  confirmarEntregaThunk,
  confirmarRecebimentoTrocaThunk,
  despacharPedidoThunk,
  fetchAllPedidos,
  fetchPedidosCliente,
  fetchPedidosEmTroca,
  rejeitarTrocaThunk,
  solicitarTrocaThunk,
} from './pedidoThunks';

interface PedidoState {
  pedidos: IPedido[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PedidoState = {
  pedidos: [],
  status: 'idle',
  error: null,
};

export { darBaixaEstoqueThunk } from './pedidoThunks';
export {
  autorizarTrocaThunk,
  confirmarEntregaThunk,
  confirmarRecebimentoTrocaThunk,
  despacharPedidoThunk,
  fetchAllPedidos,
  fetchPedidosCliente,
  fetchPedidosEmTroca,
  rejeitarTrocaThunk,
  solicitarTrocaThunk,
} from './pedidoThunks';

function atualizarPedidoPorUuid(estado: PedidoState, pedidoAtualizado: IPedido) {
  const index = estado.pedidos.findIndex((pedido) => pedido.uuid === pedidoAtualizado.uuid);
  if (index === -1) return;
  estado.pedidos[index] = pedidoAtualizado;
}

const pedidoSlice = createSlice({
  name: 'pedido',
  initialState,
  reducers: {
    atualizarStatusPedido: (
      state,
      action: PayloadAction<{ uuid: string; novoStatus: StatusPedido }>,
    ) => {
      const pedido = state.pedidos.find((p) => p.uuid === action.payload.uuid);
      if (!pedido) return;
      pedido.status = action.payload.novoStatus;
    },
    adicionarPedido: (state, action: PayloadAction<IPedido>) => {
      state.pedidos.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    // fetchPedidosCliente
    builder
      .addCase(fetchPedidosCliente.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPedidosCliente.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pedidos = action.payload;
        state.error = null;
      })
      .addCase(fetchPedidosCliente.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Erro ao carregar pedidos';
      });

    // fetchAllPedidos
    builder
      .addCase(fetchAllPedidos.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllPedidos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pedidos = action.payload;
        state.error = null;
      })
      .addCase(fetchAllPedidos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Erro ao carregar pedidos';
      });

    // fetchPedidosEmTroca
    builder
      .addCase(fetchPedidosEmTroca.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPedidosEmTroca.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pedidos = action.payload;
        state.error = null;
      })
      .addCase(fetchPedidosEmTroca.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Erro ao carregar trocas';
      });

    builder
      .addCase(solicitarTrocaThunk.fulfilled, (state, action) => {
        atualizarPedidoPorUuid(state, action.payload);
      })
      .addCase(autorizarTrocaThunk.fulfilled, (state, action) => {
        atualizarPedidoPorUuid(state, action.payload);
      })
      .addCase(rejeitarTrocaThunk.fulfilled, (state, action) => {
        atualizarPedidoPorUuid(state, action.payload);
      })
      .addCase(confirmarRecebimentoTrocaThunk.fulfilled, (state, action) => {
        atualizarPedidoPorUuid(state, action.payload.pedido);
      })
      .addCase(despacharPedidoThunk.fulfilled, (state, action) => {
        atualizarPedidoPorUuid(state, action.payload);
      })
      .addCase(confirmarEntregaThunk.fulfilled, (state, action) => {
        atualizarPedidoPorUuid(state, action.payload);
      })
      .addCase(logout, () => ({ ...initialState }));
  },
});

export const { atualizarStatusPedido, adicionarPedido } = pedidoSlice.actions;

export default pedidoSlice.reducer;
