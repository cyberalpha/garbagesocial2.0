
import React from 'react';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';
import { Database, CloudOff, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface SupabaseConnectionAlertProps {
  className?: string;
}

/**
 * Componente que muestra un indicador del estado de conexión con Supabase
 */
const SupabaseConnectionAlert = ({ className }: SupabaseConnectionAlertProps) => {
  const { status, error, lastChecked, checkConnection } = useSupabaseConnection();

  const handleManualCheck = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    checkConnection();
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return "bg-green-500/80 hover:bg-green-500";
      case 'disconnected':
        return "bg-destructive/80 hover:bg-destructive animate-pulse";
      case 'connecting':
        return "bg-amber-500/80 hover:bg-amber-500";
      default:
        return "bg-slate-500/80 hover:bg-slate-500";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Database className="h-5 w-5 text-white" />;
      case 'disconnected':
        return <CloudOff className="h-5 w-5 text-white" />;
      case 'connecting':
        return <RefreshCw className="h-5 w-5 text-white animate-spin" />;
      default:
        return <CloudOff className="h-5 w-5 text-white" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return "Conectado a Supabase";
      case 'disconnected':
        return `Sin conexión a Supabase${error ? `: ${error}` : ''}`;
      case 'connecting':
        return "Conectando con Supabase...";
      default:
        return "Estado de conexión desconocido";
    }
  };

  return (
    <div 
      className={cn(
        "fixed bottom-4 right-16 z-50 transition-all duration-300",
        className
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "p-2 rounded-full shadow-md flex items-center justify-center transition-colors",
              getStatusColor()
            )}
            onClick={handleManualCheck}
          >
            {getStatusIcon()}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs p-4">
          <div className="space-y-3">
            <p className="font-medium">{getStatusText()}</p>
            {lastChecked && (
              <p className="text-xs text-muted-foreground">
                Última comprobación: {lastChecked.toLocaleTimeString()}
              </p>
            )}
            
            {status === 'disconnected' && (
              <div className="border-t pt-2">
                <p className="text-xs text-amber-600 flex items-center gap-1 mb-1">
                  <AlertCircle className="h-3 w-3" /> 
                  Posibles soluciones:
                </p>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                  <li>Verificar conexión a internet</li>
                  <li>Comprobar que el proyecto Supabase esté activo</li>
                  <li>Verificar las credenciales de Supabase</li>
                </ul>
                <Link 
                  to="/supabase-diagnostic" 
                  className="mt-2 text-xs text-primary hover:underline inline-flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  Ver herramienta de diagnóstico
                </Link>
              </div>
            )}
            
            <p className="text-xs italic">Haz clic para comprobar manualmente</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default SupabaseConnectionAlert;
