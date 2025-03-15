
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
}

/**
 * Componente ErrorBoundary simplificado para capturar errores en componentes React
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Simplemente registramos el error en la consola
    console.error('Error capturado en ErrorBoundary:', error, errorInfo);
    
    // Llamar al callback si existe
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Si hay un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Fallback por defecto simplificado
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
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={this.handleReload}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recargar página
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
