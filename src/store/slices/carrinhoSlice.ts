import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { CarrinhoService } from '@/services/carrinhoService';
import type { ICarrinho, IItemCarrinho } from '@/interfaces/carrinho';
import type { RootState } from '@/store';
import { criarCarrinhoVazio } from '@/utils/carrinhoVazio';
import {
  adicionarOuAtualizarItemCarrinho,
  atualizarQuantidadeItemCarrinho,
  limparItensCarrinho,
  removerItemCarrinho,
  adicionarItensExpirados as adicionarItensExpiradosHelper,
  removerItemExpirado,
} from './carrinhoSliceHelpers';
import { logout } from './authSlice';

interface CarrinhoState {
  data: ICarrinho | null;
  itensExpirados: IItemCarrinho[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CarrinhoState = {
  data: null,
  itensExpirados: [],
  status: 'idle',
  error: null,
};

export const fetchCarrinho = createAsyncThunk(
  'carrinho/fetchCarrinho',
  async (_, { getState }) => {
    const { isAuthenticated } = (getState() as RootState).auth;
    if (!isAuthenticated) {
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
    const { isAuthenticated } = (getState() as RootState).auth;
    if (!isAuthenticated) {
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
      adicionarOuAtualizarItemCarrinho(state.data, action.payload);
    },
    removerItem: (state, action: PayloadAction<string>) => {
      if (!state.data) return;
      removerItemCarrinho(state.data, action.payload);
    },
    atualizarQuantidade: (state, action: PayloadAction<{ uuid: string; quantidade: number }>) => {
      if (!state.data) return;
      atualizarQuantidadeItemCarrinho(state.data, action.payload);
    },
    limparCarrinho: (state) => {
      if (!state.data) return;
      limparItensCarrinho(state.data);
    },
    /** Atualiza frete e total após seleção de opção em `POST /frete/cotar` (ex.: carrinho). */
    definirFreteResumoCarrinho: (state, action: PayloadAction<{ frete: number }>) => {
      if (!state.data) return;
      const { frete } = action.payload;
      state.data.resumo.frete = frete;
      state.data.resumo.total = state.data.resumo.subtotal + frete;
    },
    /** Adiciona itens à lista de expirados (removidos por tempo) */
    adicionarItensExpirados: (state, action: PayloadAction<IItemCarrinho[]>) => {
      const itensNovos = action.payload;
      if (itensNovos.length === 0) return;
      state.itensExpirados = adicionarItensExpiradosHelper(state.itensExpirados, itensNovos);
    },
    /** Limpa a lista de itens expirados */
    limparItensExpirados: (state) => {
      state.itensExpirados = [];
    },
    /** Restaura um item expirado de volta ao carrinho */
    restaurarItemExpirado: (state, action: PayloadAction<string>) => {
      const itemUuid = action.payload;
      const itemExpirado = state.itensExpirados.find((item) => item.uuid === itemUuid);
      if (!itemExpirado) return;
      if (!state.data) return;

      state.itensExpirados = removerItemExpirado(state.itensExpirados, itemUuid);
      adicionarOuAtualizarItemCarrinho(state.data, itemExpirado);
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
        state.itensExpirados = [];
        state.status = 'succeeded';
        state.error = null;
      });
  },
});

export const {
  adicionarItem,
  removerItem,
  atualizarQuantidade,
  limparCarrinho,
  definirFreteResumoCarrinho,
  adicionarItensExpirados,
  limparItensExpirados,
  restaurarItemExpirado,
} = carrinhoSlice.actions;

export default carrinhoSlice.reducer;
