import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

export const SESSION_STORAGE_KEY = 'les_auth_session';

export interface AuthUser {
  uuid: string;
  email: string;
  nome: string;
  cpf: string;
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

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
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
    loginSuccess: (state, action: PayloadAction<{ token: string; user: AuthUser | null }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.authError = null;
      state.sessionLoading = false;
      // Persiste a sessão em sessionStorage (limpo ao fechar a aba; token nunca vai ao localStorage — U7)
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        token: action.payload.token,
        user: action.payload.user,
      }));
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
          state.token = action.payload.token;
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
