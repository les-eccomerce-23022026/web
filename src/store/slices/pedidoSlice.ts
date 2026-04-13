import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { PedidoService } from '@/services/pedidoService';
import { LivroService } from '@/services/livroService';
import type { IPedido, StatusPedido } from '@/interfaces/pedido';

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
  async (statusFiltro?: string[]) => {
    return PedidoService.getAllPedidos(statusFiltro);
  },
);

export const despacharPedidoThunk = createAsyncThunk(
  'pedido/despacharPedido',
  async (pedidoUuid: string) => {
    return PedidoService.despacharPedido(pedidoUuid);
  },
);

export const confirmarEntregaThunk = createAsyncThunk(
  'pedido/confirmarEntrega',
  async (pedidoUuid: string) => {
    return PedidoService.confirmarEntrega(pedidoUuid);
  },
);

export const registrarFalhaEntregaThunk = createAsyncThunk(
  'pedido/registrarFalhaEntrega',
  async (pedidoUuid: string) => {
    return PedidoService.registrarFalhaEntrega(pedidoUuid);
  },
);

export const reagendarEntregaThunk = createAsyncThunk(
  'pedido/reagendarEntrega',
  async (payload: { pedidoUuid: string; novoEndereco: object }) => {
    return PedidoService.reagendarEntrega(payload.pedidoUuid, payload.novoEndereco);
  },
);

// RF0053 — Baixa em estoque: disparado após pedido aprovado/processado
export const darBaixaEstoqueThunk = createAsyncThunk(
  'pedido/darBaixaEstoque',
  async (pedidoUuid: string, { getState }) => {
    const state = getState() as RootState;
    const pedido = state.pedido.pedidos.find((p) => p.uuid === pedidoUuid);
    if (!pedido) throw new Error('Pedido não encontrado para baixa de estoque');
    await LivroService.darBaixaEstoque(pedido.itens.map((i) => ({ livroUuid: i.livroUuid, quantidade: i.quantidade })));
    return pedidoUuid;
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

    // despacharPedido
    builder
      .addCase(despacharPedidoThunk.fulfilled, (state, action) => {
        const index = state.pedidos.findIndex((p) => p.uuid === action.payload.uuid);
        if (index === -1) return;
        state.pedidos[index] = action.payload;
      });

    // confirmarEntrega
    builder
      .addCase(confirmarEntregaThunk.fulfilled, (state, action) => {
        const index = state.pedidos.findIndex((p) => p.uuid === action.payload.uuid);
        if (index === -1) return;
        state.pedidos[index] = action.payload;
      });

    // registrarFalhaEntrega
    builder
      .addCase(registrarFalhaEntregaThunk.fulfilled, (state, action) => {
        const index = state.pedidos.findIndex((p) => p.uuid === action.payload.uuid);
        if (index === -1) return;
        state.pedidos[index] = action.payload;
      });

    // reagendarEntrega
    builder
      .addCase(reagendarEntregaThunk.fulfilled, (state, action) => {
        const index = state.pedidos.findIndex((p) => p.uuid === action.payload.uuid);
        if (index === -1) return;
        state.pedidos[index] = action.payload;
      })
      .addCase(logout, () => ({ ...initialState }));
  },
});

export const { atualizarStatusPedido, adicionarPedido } = pedidoSlice.actions;

export default pedidoSlice.reducer;
