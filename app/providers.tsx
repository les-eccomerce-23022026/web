'use client';

/**
 * Redux Providers wrapper for Next.js
 * This component wraps the application with Redux store providers and persistence
 * Used in app/layout.tsx to enable Redux for Client Components
 */

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../src/store/index';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};
