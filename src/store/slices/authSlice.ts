import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { USE_MOCK } from '@/config/apiConfig';

export const SESSION_STORAGE_KEY = 'les_auth_session';

interface IStoredSession {
  user: AuthUser;
}

export interface AuthUser {
  uuid: string;
  email: string;
  nome: string;
  cpf?: string;
  role: 'cliente' | 'admin';
  eAdminMestre?: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  /** Apenas ambiente mock: prefixo mock-token (não é JWT). API real usa cookie HttpOnly. */
  token: string | null;
  user: AuthUser | null;
  authError: string | null;
  /** true enquanto a sessão está sendo verificada no startup — evita redirect prematuro */
  sessionLoading: boolean;
}

const getStoredSession = (): IStoredSession | null => {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { user?: AuthUser; token?: unknown };
    if (!parsed?.user) return null;
    return { user: parsed.user };
  } catch {
    return null;
  }
};

const stored = getStoredSession();

const initialState: AuthState = {
  isAuthenticated: !!stored,
  token: null,
  user: stored?.user ?? null,
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
      const { AuthService } = await import('@/services/AuthService');
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
      state.token = action.payload.token ?? null;
      state.user = action.payload.user;
      state.authError = null;
      state.sessionLoading = false;
      if (!action.payload.user) {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        return;
      }

      const storedSession: IStoredSession = {
        user: action.payload.user,
      };

      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(storedSession));
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.authError = null;
      state.sessionLoading = false;
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
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
          state.token = action.payload.token ?? null;
          state.user = action.payload.user;
          if (action.payload.user) {
            sessionStorage.setItem(
              SESSION_STORAGE_KEY,
              JSON.stringify({ user: action.payload.user }),
            );
          }
        }
        state.sessionLoading = false;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.sessionLoading = false;
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
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
        const { AuthService } = await import('@/services/AuthService');
        await AuthService.logout();
      } catch {
        /* ignore */
      }
    }
    dispatch(logout());
  },
);

export default authSlice.reducer;
