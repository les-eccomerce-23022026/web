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

export const STORE_INSTANCE_ID = `${typeof window === 'undefined' ? 'srv' : 'cli'}-${Math.random().toString(36).slice(2, 9)}`;

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

// #region agent log
if (typeof fetch !== 'undefined') {
  const auth = store.getState().auth;
  fetch('http://127.0.0.1:7252/ingest/8c947da7-7023-400a-ab71-9b9c5909fd2b', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a8ec46' },
    body: JSON.stringify({
      sessionId: 'a8ec46',
      runId: 'post-fix',
      hypothesisId: 'A',
      location: 'store/index.ts:store-created',
      message: 'Redux store created',
      data: {
        storeInstanceId: STORE_INSTANCE_ID,
        isServer: typeof window === 'undefined',
        authIsAuthenticated: auth.isAuthenticated,
        authUserNome: auth.user?.nome ?? null,
        authSessionLoading: auth.sessionLoading,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
}
// #endregion

// Debug: Log persistência (apenas em desenvolvimento)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
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
