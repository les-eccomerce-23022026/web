'use client';

/**
 * Redux Providers wrapper for Next.js
 * This component wraps the application with Redux store providers and persistence
 * Used in app/layout.tsx to enable Redux for Client Components
 */

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../src/store/index';
import { restoreSession } from '../src/store/slices/authSlice';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    store.dispatch(restoreSession());
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};
