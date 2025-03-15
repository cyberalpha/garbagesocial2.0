
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.tsx'

// Eliminamos la importación y configuración del manejador global de errores
// que podría estar causando problemas

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary showDetails={false}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
