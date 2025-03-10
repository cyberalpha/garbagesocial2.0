
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { ConnectionStatus } from '@/hooks/useSupabaseConnection';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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
