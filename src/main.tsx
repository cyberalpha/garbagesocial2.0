
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { setOfflineMode } from './integrations/supabase/client'

// Activar modo offline por defecto al iniciar la aplicación
setOfflineMode(true);
console.log('Aplicación iniciada en modo offline (local) por defecto');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary showDetails={false}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
