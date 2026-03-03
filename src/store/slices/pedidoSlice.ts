import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { PedidoService } from '@/services/PedidoService';
import type { IPedido, StatusPedido } from '@/interfaces/IPedido';

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

export const fetchPedidosCliente = createAsyncThunk(
  'pedido/fetchPedidosCliente',
  async (clienteUuid: string) => {
    return PedidoService.getPedidosByCliente(clienteUuid);
  },
);

export const fetchAllPedidos = createAsyncThunk(
  'pedido/fetchAllPedidos',
  async () => {
    return PedidoService.getAllPedidos();
  },
);

export const fetchPedidosEmTroca = createAsyncThunk(
  'pedido/fetchPedidosEmTroca',
  async () => {
    return PedidoService.getPedidosEmTroca();
  },
);

export const solicitarTrocaThunk = createAsyncThunk(
  'pedido/solicitarTroca',
  async (payload: { pedidoUuid: string; motivo: string; itensUuids: string[] }) => {
    return PedidoService.solicitarTroca(payload.pedidoUuid, payload.motivo, payload.itensUuids);
  },
);

export const autorizarTrocaThunk = createAsyncThunk(
  'pedido/autorizarTroca',
  async (pedidoUuid: string) => {
    return PedidoService.autorizarTroca(pedidoUuid);
  },
);

export const confirmarRecebimentoTrocaThunk = createAsyncThunk(
  'pedido/confirmarRecebimentoTroca',
  async (payload: { pedidoUuid: string; retornarEstoque: boolean }) => {
    return PedidoService.confirmarRecebimentoTroca(payload.pedidoUuid, payload.retornarEstoque);
  },
);

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
      })
      .addCase(fetchPedidosCliente.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Erro ao carregar pedidos';
      });

    // fetchAllPedidos
    builder
      .addCase(fetchAllPedidos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pedidos = action.payload;
      });

    // fetchPedidosEmTroca
    builder
      .addCase(fetchPedidosEmTroca.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pedidos = action.payload;
      });

    // solicitarTroca
    builder
      .addCase(solicitarTrocaThunk.fulfilled, (state, action) => {
        const index = state.pedidos.findIndex((p) => p.uuid === action.payload.uuid);
        if (index === -1) return;
        state.pedidos[index] = action.payload;
      });

    // autorizarTroca
    builder
      .addCase(autorizarTrocaThunk.fulfilled, (state, action) => {
        const index = state.pedidos.findIndex((p) => p.uuid === action.payload.uuid);
        if (index === -1) return;
        state.pedidos[index] = action.payload;
      });

    // confirmarRecebimentoTroca
    builder
      .addCase(confirmarRecebimentoTrocaThunk.fulfilled, (state, action) => {
        const index = state.pedidos.findIndex((p) => p.uuid === action.payload.pedido.uuid);
        if (index === -1) return;
        state.pedidos[index] = action.payload.pedido;
      });
  },
});

export const { atualizarStatusPedido, adicionarPedido } = pedidoSlice.actions;

export default pedidoSlice.reducer;
