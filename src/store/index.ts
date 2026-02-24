import { configureStore } from '@reduxjs/toolkit';
import carrinhoReducer from './slices/carrinhoSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    carrinho: carrinhoReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
