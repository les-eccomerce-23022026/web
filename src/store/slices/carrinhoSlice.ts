import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { CarrinhoService } from '@/services/CarrinhoService';
import type { ICarrinho, IItemCarrinho } from '@/interfaces/ICarrinho';

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
  async () => {
    const response = await CarrinhoService.getCarrinho();
    return response;
  }
);

const carrinhoSlice = createSlice({
  name: 'carrinho',
  initialState,
  reducers: {
    // Adicionar ao carrinho
    adicionarItem: (state, action: PayloadAction<IItemCarrinho>) => {
      if (state.data) {
        // Lógica simplificada: Verifica se o item já existe para não duplicar, ou apenas adiciona
        const existe = state.data.itens.find(i => i.uuid === action.payload.uuid);
        if (existe) {
          existe.quantidade += action.payload.quantidade;
          existe.subtotal = existe.quantidade * existe.precoUnitario;
        } else {
          state.data.itens.push(action.payload);
        }
        // Recalcular resumo base
        const subtotal = state.data.itens.reduce((acc, item) => acc + item.subtotal, 0);
        state.data.resumo.subtotal = subtotal;
        state.data.resumo.total = subtotal + state.data.resumo.frete;
      }
    },
    // Remover do carrinho
    removerItem: (state, action: PayloadAction<string>) => {
      if (state.data) {
        state.data.itens = state.data.itens.filter(i => i.uuid !== action.payload);
        // Recalcular resumo base
        const subtotal = state.data.itens.reduce((acc, item) => acc + item.subtotal, 0);
        state.data.resumo.subtotal = subtotal;
        state.data.resumo.total = subtotal + state.data.resumo.frete;
      }
    },
    // Atualizar quantidade
    atualizarQuantidade: (state, action: PayloadAction<{ uuid: string; quantidade: number }>) => {
      if (state.data) {
        const item = state.data.itens.find(i => i.uuid === action.payload.uuid);
        if (item && action.payload.quantidade > 0) {
          item.quantidade = action.payload.quantidade;
          item.subtotal = item.quantidade * item.precoUnitario;
          // Recalcular resumo base
          const subtotal = state.data.itens.reduce((acc, item) => acc + item.subtotal, 0);
          state.data.resumo.subtotal = subtotal;
          state.data.resumo.total = subtotal + state.data.resumo.frete;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCarrinho.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCarrinho.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchCarrinho.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Erro ao carregar o carrinho';
      });
  },
});

export const { adicionarItem, removerItem, atualizarQuantidade } = carrinhoSlice.actions;

export default carrinhoSlice.reducer;
