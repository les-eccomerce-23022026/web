import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { ILoja } from '@/interfaces/loja';
import { ApiClient } from '@/services/apiClient';

/**
 * Estado da loja ativa (tenante).
 * Gerencia a loja selecionada pelo cliente.
 */
interface LojaState {
  lojaAtiva: ILoja | null;
  carregando: boolean;
  erro: string | null;
}

const estadoInicial: LojaState = {
  lojaAtiva: null,
  carregando: false,
  erro: null,
};

/**
 * Busca dados da loja via API.
 * GET /api/loja/tenante/:loj_uuid
 */
export const buscarLojaAtiva = createAsyncThunk<
  ILoja,
  string,
  { rejectValue: string }
>('loja/buscarLojaAtiva', async (lojaUuid, { rejectWithValue }) => {
  try {
    const resposta = await ApiClient.get<ILoja>(`/loja/tenante/${lojaUuid}`);
    return resposta;
  } catch (erro: unknown) {
    return rejectWithValue((erro as Error).message || 'Erro ao carregar loja');
  }
});

const lojaSlice = createSlice({
  name: 'loja',
  initialState: estadoInicial,
  reducers: {
    /**
     * Define a loja ativa manualmente (sem requisição à API).
     * Útil para testes ou quando a loja já está carregada.
     */
    definirLojaAtiva: (state, action: PayloadAction<ILoja>) => {
      state.lojaAtiva = action.payload;
      state.erro = null;
    },

    /**
     * Limpa a loja ativa e reseta o estado.
     */
    limparLojaAtiva: (state) => {
      state.lojaAtiva = null;
      state.carregando = false;
      state.erro = null;
    },

    /**
     * Define erro manualmente.
     */
    definirErroLoja: (state, action: PayloadAction<string | null>) => {
      state.erro = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(buscarLojaAtiva.pending, (state) => {
        state.carregando = true;
        state.erro = null;
      })
      .addCase(buscarLojaAtiva.fulfilled, (state, action) => {
        state.carregando = false;
        state.lojaAtiva = action.payload;
        state.erro = null;
      })
      .addCase(buscarLojaAtiva.rejected, (state, action) => {
        state.carregando = false;
        state.erro = typeof action.payload === 'string' 
          ? action.payload 
          : action.error.message || 'Erro ao carregar loja';
      });
  },
});

export const { definirLojaAtiva, limparLojaAtiva, definirErroLoja } = lojaSlice.actions;

/**
 * Seletor para obter a loja ativa.
 */
export const selecionarLojaAtiva = (state: { loja: LojaState }) => state.loja.lojaAtiva;

/**
 * Seletor para obter o estado de carregamento.
 */
export const selecionarCarregandoLoja = (state: { loja: LojaState }) => state.loja.carregando;

/**
 * Seletor para obter o erro.
 */
export const selecionarErroLoja = (state: { loja: LojaState }) => state.loja.erro;

export default lojaSlice.reducer;
