
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { setOfflineMode } from '@/integrations/supabase/client'

// Inicializar la aplicación en modo offline permanente y bloquear
// cualquier intento de cambio de modo durante la ejecución
setOfflineMode(true);

// Desactivar intentos de reconexión automática para estabilizar la interfaz
console.log("Iniciando aplicación en modo offline permanente forzado");

// Registrar manejadores para guardar errores (mantener comportamiento existente)
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

// Añadir detectores para estabilizar transiciones de páginas
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log('Aplicación visible nuevamente - manteniendo modo offline');
    // Reforzar modo offline cuando el usuario vuelve a la aplicación
    setOfflineMode(true);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary showDetails={false}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
