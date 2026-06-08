import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import carrinhoReducer from './slices/carrinhoSlice';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import livroReducer from './slices/livroSlice';
import pedidoReducer from './slices/pedidoSlice';
import clienteReducer from './slices/clienteSlice';
import cotacaoFreteReducer from './slices/cotacaoFreteSlice';
import notificacoesReducer from './slices/notificacoesSlice';
import lojaReducer from './slices/lojaSlice';

// Configuração de persistência para Next.js
const persistConfig = {
  key: 'root',
  storage,
  // Não persistir auth (dados sensíveis - JWT deve estar em cookie HttpOnly)
  blacklist: ['auth'],
  // Persistir carrinho, loja e outros dados não-sensíveis
  whitelist: ['carrinho', 'cotacaoFrete', 'cliente', 'loja'],
};

const rootReducer = combineReducers({
  carrinho: carrinhoReducer,
  cotacaoFrete: cotacaoFreteReducer,
  auth: authReducer,
  admin: adminReducer,
  livro: livroReducer,
  pedido: pedidoReducer,
  cliente: clienteReducer,
  notificacoes: notificacoesReducer,
  loja: lojaReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
