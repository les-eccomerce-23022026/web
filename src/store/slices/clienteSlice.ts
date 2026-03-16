import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { ClienteService } from '@/services/ClienteService';
import type { ICliente, IAtualizarPerfilPayload, Genero } from '@/interfaces/ICliente';
import type { IEnderecoCliente, ICartaoCliente } from '@/interfaces/IPagamento';

interface ClienteState {
  perfil: ICliente | null;
  enderecos: IEnderecoCliente[];
  cartoes: ICartaoCliente[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ClienteState = {
  perfil: null,
  enderecos: [],
  cartoes: [],
  isLoading: false,
  error: null,
};

/**
 * Busca o perfil completo do cliente logado.
 */
export const fetchPerfilCompleto = createAsyncThunk(
  'cliente/fetchPerfil',
  async (uuid: string, { rejectWithValue }) => {
    try {
      const perfil = await ClienteService.obterPerfil(uuid);
      const cartoes = await ClienteService.listarCartoes(uuid);
      return { perfil, cartoes };
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Erro ao carregar perfil');
    }
  }
);

/**
 * Atualiza dados básicos do perfil.
 */
export const updatePerfilAction = createAsyncThunk(
  'cliente/updatePerfil',
  async (payload: IAtualizarPerfilPayload, { rejectWithValue }) => {
    try {
      await ClienteService.atualizarPerfil(payload);
      // Retornamos o que mudou para atualizar o estado local se necessário
      return payload;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Erro ao atualizar perfil');
    }
  }
);

const clienteSlice = createSlice({
  name: 'cliente',
  initialState,
  reducers: {
    limparCliente: (state) => {
      state.perfil = null;
      state.enderecos = [];
      state.cartoes = [];
      state.error = null;
    },
    setEnderecos: (state, action: PayloadAction<IEnderecoCliente[]>) => {
      state.enderecos = action.payload;
    },
    setCartoes: (state, action: PayloadAction<ICartaoCliente[]>) => {
      state.cartoes = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPerfilCompleto.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPerfilCompleto.fulfilled, (state, action) => {
        state.isLoading = false;
        state.perfil = action.payload.perfil;
        state.enderecos = action.payload.perfil.enderecos || [];
        state.cartoes = action.payload.cartoes;
      })
      .addCase(fetchPerfilCompleto.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Atualização de Perfil
      .addCase(updatePerfilAction.fulfilled, (state, action) => {
        if (state.perfil) {
          state.perfil = { 
            ...state.perfil, 
            ...action.payload,
            genero: (action.payload.genero as Genero) || state.perfil.genero,
            telefone: action.payload.telefone 
              ? { ...state.perfil.telefone, ...action.payload.telefone } as any
              : state.perfil.telefone
          };
        }
      });
  },
});

export const { limparCliente, setEnderecos, setCartoes } = clienteSlice.actions;
export default clienteSlice.reducer;
