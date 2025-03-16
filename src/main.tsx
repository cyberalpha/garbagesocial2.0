
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { setOfflineMode } from '@/integrations/supabase/client'

// Inicializar la aplicación en modo offline por defecto
// para garantizar el funcionamiento local
setOfflineMode(true);

// Registrar manejadores para guardar errores
window.addEventListener('error', (event) => {
  console.error('Error capturado:', event.error);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary showDetails={false}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
