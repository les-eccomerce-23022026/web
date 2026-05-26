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
      // #region agent log
      const storedSnapshot = typeof window !== 'undefined' ? lerSessaoArmazenada() : null;
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7252/ingest/8c947da7-7023-400a-ab71-9b9c5909fd2b', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a8ec46' },
          body: JSON.stringify({
            sessionId: 'a8ec46',
            runId: 'post-fix',
            hypothesisId: 'B,C',
            location: 'authSlice.ts:restoreSession-start',
            message: 'restoreSession iniciado',
            data: {
              isServer: typeof window === 'undefined',
              hasStored: !!storedSnapshot,
              useMock: USE_MOCK,
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
      }
      // #endregion

      if (USE_MOCK && typeof window !== 'undefined') {
        const stored = lerSessaoArmazenada();
        if (stored?.user) {
          return { user: stored.user, token: stored.token };
        }
        return rejectWithValue(null);
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
      console.log('[AuthSlice] loginSuccess action recebido');
      console.log('[AuthSlice] payload:', action.payload);
      state.isAuthenticated = true;
      // ⚠️ SEGURANÇA: Em produção, NÃO armazenar token no Redux (apenas em cookie HttpOnly)
      const isProduction = process.env.NODE_ENV === 'production';
      state.token = isProduction ? null : (action.payload.token ?? null);
      state.user = action.payload.user;
      state.authError = null;
      state.sessionLoading = false;
      console.log('[AuthSlice] Estado após loginSuccess:', {
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token ? '***' : null,
      });
      if (!action.payload.user) {
        console.log('[AuthSlice] User null, limpando sessão');
        limparSessaoArmazenada();
        return;
      }
      // Em produção, salvar apenas user (sem token) no sessionStorage
      salvarSessaoArmazenada(action.payload.user, isProduction ? null : action.payload.token);
      console.log('[AuthSlice] Sessão salva no storage');
    },
    logout: (state) => {
      console.log('[AuthSlice] logout action recebido');
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.authError = null;
      state.sessionLoading = false;
      limparSessaoArmazenada();
      console.log('[AuthSlice] Estado após logout:', state);
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      console.log('[AuthSlice] setAuthError:', action.payload);
      state.authError = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        console.log('[AuthSlice] restoreSession.fulfilled');
        console.log('[AuthSlice] payload:', action.payload);
        if (action.payload) {
          state.isAuthenticated = true;
          // ⚠️ SEGURANÇA: Em produção, não restaurar token do sessionStorage
          const isProduction = process.env.NODE_ENV === 'production';
          state.token = isProduction ? null : (action.payload.token ?? state.token);
          state.user = action.payload.user;
          if (action.payload.user) {
            salvarSessaoArmazenada(action.payload.user, isProduction ? null : state.token);
          }
        }
        state.sessionLoading = false;
        console.log('[AuthSlice] Estado após restoreSession:', {
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          sessionLoading: state.sessionLoading,
        });
      })
      .addCase(restoreSession.rejected, (state) => {
        console.log('[AuthSlice] restoreSession.rejected');
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.sessionLoading = false;
        limparSessaoArmazenada();
        console.log('[AuthSlice] Estado após restoreSession rejected:', state);
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
