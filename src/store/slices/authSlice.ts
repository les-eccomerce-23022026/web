import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { USE_MOCK } from '@/config/apiConfig';
import {
  limparSessaoArmazenada,
  lerSessaoArmazenada,
  SESSION_STORAGE_KEY,
  salvarSessaoArmazenada,
} from './authSessionStorage';
export { SESSION_STORAGE_KEY };

export interface LojaUsuario {
  loj_id: number;
  loj_uuid: string;
}

export interface AuthUser {
  uuid: string;
  email: string;
  nome: string;
  cpf?: string;
  role: 'cliente' | 'admin' | 'admin_sistema';
  papeis: string[];
  lojas: LojaUsuario[];
  loja_uuid_principal: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  /**
   * Token JWT (apenas testes) ou mock-token (ambiente mock).
   * ⚠️ SEGURANÇA: Em produção, o JWT NUNCA deve ser armazenado aqui.
   * Use cookie HttpOnly do backend. Este campo é apenas para testes.
   */
  token: string | null;
  user: AuthUser | null;
  authError: string | null;
  /** true enquanto a sessão está sendo verificada no startup — evita redirect prematuro */
  sessionLoading: boolean;
}

// Estado inicial fixo — evita divergência SSR/cliente por sessionStorage na carga do módulo
const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
  authError: null,
  sessionLoading: true,
};

/**
 * Restaura a sessão ao iniciar.
 * - Mock: snapshot do `user` em sessionStorage.
 * - API real: GET /auth/me com `credentials: 'include'` (JWT em cookie HttpOnly).
 */
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      if (USE_MOCK && typeof window !== 'undefined') {
        const stored = lerSessaoArmazenada();
        if (stored?.user) {
          return { user: stored.user, token: stored.token };
        }
        return rejectWithValue(null);
      }

      // E2E: sessão gravada pelo Cypress após login via API (cookie pode falhar no proxy Next)
      if (
        typeof window !== 'undefined' &&
        (window as Window & { __USE_TEST_DB__?: boolean }).__USE_TEST_DB__
      ) {
        const storedE2e = lerSessaoArmazenada();
        if (storedE2e?.user && storedE2e.token) {
          return { user: storedE2e.user, token: storedE2e.token };
        }
      }

      const { AuthService } = await import('@/services/authService');
      return await AuthService.me();
    } catch {
      return rejectWithValue(null);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ token?: string; user: AuthUser | null }>) => {
      state.isAuthenticated = true;
      const isProduction = process.env.NODE_ENV === 'production';
      state.token = isProduction ? null : (action.payload.token ?? null);
      state.user = action.payload.user;
      state.authError = null;
      state.sessionLoading = false;
      if (!action.payload.user) {
        limparSessaoArmazenada();
        return;
      }
      salvarSessaoArmazenada(action.payload.user, isProduction ? null : action.payload.token);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.authError = null;
      state.sessionLoading = false;
      limparSessaoArmazenada();
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.authError = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.isAuthenticated = true;
          const isProduction = process.env.NODE_ENV === 'production';
          state.token = isProduction ? null : (action.payload.token ?? state.token);
          state.user = action.payload.user;
          if (action.payload.user) {
            salvarSessaoArmazenada(action.payload.user, isProduction ? null : state.token);
          }
        }
        state.sessionLoading = false;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.sessionLoading = false;
        limparSessaoArmazenada();
      });
  },
});

export const { loginSuccess, logout, setAuthError } = authSlice.actions;

/**
 * Encerra sessão no servidor (limpa cookie) e no cliente (Redux + storage).
 */
export const logoutSession = createAsyncThunk(
  'auth/logoutSession',
  async (_, { dispatch }) => {
    if (!USE_MOCK) {
      try {
        const { AuthService } = await import('@/services/authService');
        await AuthService.logout();
      } catch {
        /* ignore */
      }
    }
    dispatch(logout());
  },
);

export default authSlice.reducer;
