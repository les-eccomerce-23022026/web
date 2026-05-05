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

// Configuração de persistência para Next.js
const persistConfig = {
  key: 'root',
  storage,
  // Não persistir auth (dados sensíveis - JWT deve estar em cookie HttpOnly)
  blacklist: ['auth'],
  // Persistir carrinho e outros dados não-sensíveis
  whitelist: ['carrinho', 'cotacaoFrete', 'cliente'],
};

const rootReducer = combineReducers({
  carrinho: carrinhoReducer,
  cotacaoFrete: cotacaoFreteReducer,
  auth: authReducer,
  admin: adminReducer,
  livro: livroReducer,
  pedido: pedidoReducer,
  cliente: clienteReducer,
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

// Debug: Log persistência
if (typeof window !== 'undefined') {
  persistor.subscribe(() => {
    const state = store.getState();
    console.log('[REDUX-PERSIST DEBUG] Estado persistido:', {
      carrinhoItens: state.carrinho?.data?.itens?.length || 0,
      carrinhoStatus: state.carrinho?.status,
    });
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
