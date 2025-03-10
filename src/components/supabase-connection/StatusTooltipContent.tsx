
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { ConnectionStatus } from '@/hooks/useSupabaseConnection';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

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
        return 'Conectado a Supabase';
      case 'connecting':
        return 'Conectando a Supabase...';
      case 'disconnected':
        return 'Desconectado de Supabase';
      default:
        return 'Estado desconocido';
    }
  };

  return (
    <div className="space-y-2">
      <p className="font-medium">{getStatusText()}</p>
      
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
      
      {lastChecked && (
        <p className="text-xs text-gray-500">
          Última verificación: {formatDistanceToNow(lastChecked, { addSuffix: true, locale: es })}
        </p>
      )}
      
      {status === 'disconnected' && (
        <div className="mt-2 p-2 bg-red-50 rounded-md text-xs">
          <p className="font-medium mb-1">Posibles soluciones:</p>
          <ul className="list-disc pl-4 space-y-1 text-gray-600">
            <li>Verificar conexión a internet</li>
            <li>Comprobar que el proyecto Supabase esté activo</li>
            <li>Verificar configuración y credenciales</li>
          </ul>
          
          <Link 
            to="/supabase-diagnostic" 
            className="flex items-center mt-2 text-blue-500 hover:text-blue-700"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Ir a diagnóstico
          </Link>
        </div>
      )}
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full mt-2" 
        onClick={onManualCheck}
      >
        <RefreshCw className="mr-2 h-3 w-3" />
        Verificar conexión
      </Button>
    </div>
  );
};

export default StatusTooltipContent;
