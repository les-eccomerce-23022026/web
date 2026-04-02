import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { CarrinhoService } from '@/services/CarrinhoService';
import type { ICarrinho, IItemCarrinho } from '@/interfaces/ICarrinho';
import type { RootState } from '@/store';
import { criarCarrinhoVazio } from '@/utils/carrinhoVazio';
import { logout } from '@/store/slices/authSlice';

interface CarrinhoState {
  data: ICarrinho | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CarrinhoState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchCarrinho = createAsyncThunk(
  'carrinho/fetchCarrinho',
  async (_, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (!token) {
      return criarCarrinhoVazio();
    }
    return CarrinhoService.getCarrinho();
  },
);

export const sincronizarLinhaCarrinho = createAsyncThunk(
  'carrinho/sincronizarLinhaCarrinho',
  async (payload: { livroUuid: string; quantidade: number }) => {
    return CarrinhoService.sincronizarItem(payload);
  },
);

export const limparCarrinhoRemoto = createAsyncThunk(
  'carrinho/limparCarrinhoRemoto',
  async (_, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (!token) {
      return criarCarrinhoVazio();
    }
    return CarrinhoService.limparCarrinhoRemoto();
  },
);

const carrinhoSlice = createSlice({
  name: 'carrinho',
  initialState,
  reducers: {
    adicionarItem: (state, action: PayloadAction<IItemCarrinho>) => {
      if (!state.data) return;

      const existe = state.data.itens.find((i) => i.uuid === action.payload.uuid);
      if (existe) {
        existe.quantidade += action.payload.quantidade;
        existe.subtotal = existe.quantidade * existe.precoUnitario;

        const subtotal = state.data.itens.reduce((acc, item) => acc + item.subtotal, 0);
        state.data.resumo.subtotal = subtotal;
        state.data.resumo.frete = state.data.itens.length ? state.data.fretePadrao.valor : 0;
        state.data.resumo.total = subtotal + state.data.resumo.frete;
        return;
      }

      state.data.itens.push(action.payload);

      const subtotal = state.data.itens.reduce((acc, item) => acc + item.subtotal, 0);
      state.data.resumo.subtotal = subtotal;
      state.data.resumo.frete = state.data.itens.length ? state.data.fretePadrao.valor : 0;
      state.data.resumo.total = subtotal + state.data.resumo.frete;
    },
    removerItem: (state, action: PayloadAction<string>) => {
      if (state.data) {
        state.data.itens = state.data.itens.filter((i) => i.uuid !== action.payload);
        const subtotal = state.data.itens.reduce((acc, item) => acc + item.subtotal, 0);
        state.data.resumo.subtotal = subtotal;
        state.data.resumo.frete = state.data.itens.length ? state.data.fretePadrao.valor : 0;
        state.data.resumo.total = subtotal + state.data.resumo.frete;
      }
    },
    atualizarQuantidade: (state, action: PayloadAction<{ uuid: string; quantidade: number }>) => {
      if (state.data) {
        const item = state.data.itens.find((i) => i.uuid === action.payload.uuid);
        if (item && action.payload.quantidade > 0) {
          item.quantidade = action.payload.quantidade;
          item.subtotal = item.quantidade * item.precoUnitario;
          const subtotal = state.data.itens.reduce((acc, i) => acc + i.subtotal, 0);
          state.data.resumo.subtotal = subtotal;
          state.data.resumo.frete = state.data.itens.length ? state.data.fretePadrao.valor : 0;
          state.data.resumo.total = subtotal + state.data.resumo.frete;
        }
      }
    },
    limparCarrinho: (state) => {
      if (state.data) {
        state.data.itens = [];
        state.data.resumo.subtotal = 0;
        state.data.resumo.frete = 0;
        state.data.resumo.total = 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCarrinho.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCarrinho.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchCarrinho.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Erro ao carregar o carrinho';
      })
      .addCase(sincronizarLinhaCarrinho.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.error = null;
      })
      .addCase(sincronizarLinhaCarrinho.rejected, (state, action) => {
        state.error = action.error.message || 'Erro ao atualizar o carrinho';
      })
      .addCase(limparCarrinhoRemoto.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = null;
      })
      .addCase(logout, (state) => {
        state.data = criarCarrinhoVazio();
        state.status = 'succeeded';
        state.error = null;
      });
  },
});

export const { adicionarItem, removerItem, atualizarQuantidade, limparCarrinho } = carrinhoSlice.actions;

export default carrinhoSlice.reducer;
