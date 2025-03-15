
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupGlobalErrorHandling } from './utils/errorLogger'
import ErrorBoundary from './components/ErrorBoundary.tsx'

// Configurar el manejador global de errores
setupGlobalErrorHandling();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary showDetails={true}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
