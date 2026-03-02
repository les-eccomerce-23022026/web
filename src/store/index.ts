import { configureStore } from '@reduxjs/toolkit';
import carrinhoReducer from './slices/carrinhoSlice';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import livroReducer from './slices/livroSlice';

export const store = configureStore({
  reducer: {
    carrinho: carrinhoReducer,
    auth: authReducer,
    admin: adminReducer,
    livro: livroReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
