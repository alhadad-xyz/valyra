import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './auth/AuthProvider.tsx';
import { RoleProvider } from './contexts/RoleContext.tsx';
import './index.css';
import './test-canister';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RoleProvider>
        <App />
      </RoleProvider>
    </AuthProvider>
  </React.StrictMode>,
);