import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { logout } from '@/store/slices/authSlice';
import { ClienteService } from '@/services/clienteService';
import type {
  ICliente,
  IAtualizarPerfilPayload,
  Genero,
  ITelefone,
} from '@/interfaces/cliente';
import type { IEnderecoCliente, ICartaoSalvoPagamento as ICartaoCliente } from '@/interfaces/pagamento';

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
export const fetchPerfilCompleto = createAsyncThunk<
  { perfil: ICliente; cartoes: ICartaoCliente[] },
  string,
  { rejectValue: string }
>('cliente/fetchPerfil', async (uuid, { rejectWithValue }) => {
  try {
    const perfil = await ClienteService.obterPerfil(uuid);
    const cartoes = await ClienteService.listarCartoes(uuid);
    return { perfil, cartoes };
  } catch (error: unknown) {
    return rejectWithValue((error as Error).message || 'Erro ao carregar perfil');
  }
});

/**
 * Atualiza dados básicos do perfil.
 */
export const updatePerfilAction = createAsyncThunk<
  IAtualizarPerfilPayload,
  IAtualizarPerfilPayload,
  { rejectValue: string }
>('cliente/updatePerfil', async (payload, { rejectWithValue }) => {
  try {
    await ClienteService.atualizarPerfil(payload);
    return payload;
  } catch (error: unknown) {
    return rejectWithValue((error as Error).message || 'Erro ao atualizar perfil');
  }
});

const clienteSlice = createSlice({
  name: 'cliente',
  initialState,
  reducers: {
    limparCliente: (state) => {
      state.perfil = null;
      state.enderecos = [];
      state.cartoes = [];
      state.isLoading = false;
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
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Erro ao carregar perfil';
      })
      // Atualização de Perfil
      .addCase(updatePerfilAction.fulfilled, (state, action) => {
        if (state.perfil) {
          state.perfil = { 
            ...state.perfil, 
            ...action.payload,
            genero: (action.payload.genero as Genero) || state.perfil.genero,
            telefone: action.payload.telefone 
              ? { ...state.perfil.telefone, ...action.payload.telefone } as ITelefone
              : state.perfil.telefone
          };
        }
      })
      .addCase(logout, () => ({ ...initialState }));
  },
});

export const { limparCliente, setEnderecos, setCartoes } = clienteSlice.actions;
export default clienteSlice.reducer;
