
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError, ErrorLogViewer } from '@/utils/errorLogger';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showErrorLog: boolean;
}

/**
 * Componente ErrorBoundary para capturar errores en componentes React
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showErrorLog: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Registrar el error en nuestro sistema
    logError(error, 'ErrorBoundary', { componentStack: errorInfo.componentStack });
    
    // Llamar al callback si existe
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReload = (): void => {
    window.location.reload();
  };

  toggleErrorLog = (): void => {
    this.setState(state => ({ showErrorLog: !state.showErrorLog }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Si hay un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Fallback por defecto
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50 text-red-700 my-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 flex-shrink-0 text-red-500" />
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-2">Ha ocurrido un error inesperado</h3>
              
              <p className="mb-4">Lo sentimos, algo salió mal al cargar este componente.</p>
              
              {this.props.showDetails && this.state.error && (
                <div className="mb-4">
                  <p className="font-medium">{this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <pre className="mt-2 p-2 text-xs bg-red-100 rounded overflow-x-auto max-h-60 overflow-y-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={this.handleReload}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recargar página
                </Button>
                
                {this.props.showDetails && (
                  <Button size="sm" variant="ghost" onClick={this.toggleErrorLog}>
                    {this.state.showErrorLog ? 'Ocultar log de errores' : 'Ver log de errores'}
                  </Button>
                )}
              </div>
              
              {this.props.showDetails && this.state.showErrorLog && (
                <div className="mt-4">
                  <ErrorLogViewer />
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
