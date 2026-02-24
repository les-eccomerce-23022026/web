import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    email: string;
    nome: string;
    role: 'cliente' | 'admin';
  } | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ email: string }>) => {
      state.isAuthenticated = true;
      // Mocking User Data for Prototyping
      state.user = {
        email: action.payload.email,
        nome: action.payload.email.split('@')[0], // Pseudo-name based on email
        role: action.payload.email.includes('admin') ? 'admin' : 'cliente',
      };
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
