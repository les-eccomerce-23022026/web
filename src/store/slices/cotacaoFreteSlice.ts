import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IFreteCalculoOutput, IFreteOpcao } from '@/interfaces/entrega';
import { logout } from './authSlice';
import { limparCarrinho } from './carrinhoSlice';

export interface CotacaoFretePersistida {
  opcaoSelecionada: IFreteOpcao;
  freteCalculado: IFreteCalculoOutput;
  cepDestino: string;
  /** `uuid:qtd|...` — invalida cotação se o carrinho mudar */
  assinaturaItens: string;
  /** Subtotal usado em `POST /frete/cotar` — invalida se divergir */
  subtotalCotado: number;
}

interface CotacaoFreteState {
  cotacao: CotacaoFretePersistida | null;
}

const initialState: CotacaoFreteState = {
  cotacao: null,
};

const cotacaoFreteSlice = createSlice({
  name: 'cotacaoFrete',
  initialState,
  reducers: {
    persistirCotacaoFreteCarrinho: (state, action: PayloadAction<CotacaoFretePersistida>) => {
      state.cotacao = action.payload;
    },
    limparCotacaoFreteCarrinho: (state) => {
      state.cotacao = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState).addCase(limparCarrinho, () => initialState);
  },
});

export const { persistirCotacaoFreteCarrinho, limparCotacaoFreteCarrinho } = cotacaoFreteSlice.actions;

export default cotacaoFreteSlice.reducer;
