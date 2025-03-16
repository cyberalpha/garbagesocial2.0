
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { setOfflineMode } from '@/integrations/supabase/client'

// Inicializar la aplicación en modo offline de forma permanente
// para garantizar el funcionamiento local y evitar parpadeos
setOfflineMode(true);

// Configurar la consistencia de la interfaz
console.log("Iniciando aplicación en modo offline permanente");

// Registrar manejadores para guardar errores
window.addEventListener('error', (event) => {
  console.error('Error capturado:', event.error);
  // Guardar el error en almacenamiento local para análisis posterior
  const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
  errors.push({
    message: event.error?.message || 'Error desconocido',
    stack: event.error?.stack,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('app_errors', JSON.stringify(errors));
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary showDetails={false}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
