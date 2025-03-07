
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConnectionStatus } from '@/hooks/useSupabaseConnection';

interface StatusTooltipContentProps {
  status: ConnectionStatus;
  error: string | null;
  lastChecked: Date | null;
  onManualCheck: (e: React.MouseEvent) => void;
}

const StatusTooltipContent = ({ 
  status, 
  error, 
  lastChecked,
  onManualCheck 
}: StatusTooltipContentProps) => {
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
  );
};

export default StatusTooltipContent;
