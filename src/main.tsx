import './index.css';

import { Routes } from '@generouted/react-router';
import { AuthProvider } from '@matart15/lib_authentication_supabase';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { supabase } from './lib/supabase';

// Render the app
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}
const root = ReactDOM.createRoot(rootElement);
root.render(
  <StrictMode>
    <AuthProvider supabase={supabase as any} profileTableName="users">
      <Routes />
    </AuthProvider>
  </StrictMode>,
);
