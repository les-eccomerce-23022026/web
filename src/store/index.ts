import { configureStore } from '@reduxjs/toolkit';
import carrinhoReducer from './slices/carrinhoSlice';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import livroReducer from './slices/livroSlice';
import pedidoReducer from './slices/pedidoSlice';
import clienteReducer from './slices/clienteSlice';
import cotacaoFreteReducer from './slices/cotacaoFreteSlice';

export const store = configureStore({
  reducer: {
    carrinho: carrinhoReducer,
    cotacaoFrete: cotacaoFreteReducer,
    auth: authReducer,
    admin: adminReducer,
    livro: livroReducer,
    pedido: pedidoReducer,
    cliente: clienteReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
