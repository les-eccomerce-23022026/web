import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

export const SESSION_STORAGE_KEY = 'les_auth_session';

interface IStoredSession {
  user: AuthUser;
  token?: string | null;
}

export interface AuthUser {
  uuid: string;
  email: string;
  nome: string;
  cpf?: string;
  role: 'cliente' | 'admin';
}

interface AuthState {
  isAuthenticated: boolean;
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
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const stored = getStoredSession();

const initialState: AuthState = {
  isAuthenticated: !!stored,
  token: stored?.token ?? null,
  user: stored?.user ?? null,
  authError: null,
  sessionLoading: true,
};

/**
 * Restaura a sessão do usuário ao iniciar a aplicação.
 * - Mock: lê de sessionStorage (limpo ao fechar a aba; não é localStorage, U7 seguro).
 * - Real backend: chama GET /auth/me — o cookie HttpOnly é enviado automaticamente.
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
  }
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
        token: action.payload.token,
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

export default authSlice.reducer;
