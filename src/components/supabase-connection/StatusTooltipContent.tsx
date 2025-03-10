
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle, WifiOff } from 'lucide-react';
import { ConnectionStatus } from '@/hooks/useSupabaseConnection';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import OfflineModeToggle from '../OfflineModeToggle';

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
  const getStatusContent = () => {
    switch (status) {
      case 'offline':
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center text-orange-500">
              <WifiOff className="mr-2 h-4 w-4" />
              <span className="font-medium">Modo offline activo</span>
            </div>
            <p className="text-sm text-gray-600">
              La aplicación está operando en modo offline. Los datos se guardan localmente.
            </p>
          </div>
        );
      case 'connected':
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center text-green-600">
              <CheckCircle className="mr-2 h-4 w-4" />
              <span className="font-medium">Conectado a Supabase</span>
            </div>
            <p className="text-sm text-gray-600">
              {lastChecked ? (
                <>Última verificación: {formatDistanceToNow(lastChecked, { addSuffix: true, locale: es })}</>
              ) : (
                'Conexión verificada'
              )}
            </p>
          </div>
        );
      case 'disconnected':
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center text-red-500">
              <AlertCircle className="mr-2 h-4 w-4" />
              <span className="font-medium">Sin conexión a Supabase</span>
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            {lastChecked && (
              <p className="text-sm text-gray-600">
                Última verificación: {formatDistanceToNow(lastChecked, { addSuffix: true, locale: es })}
              </p>
            )}
          </div>
        );
      case 'connecting':
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center text-blue-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="font-medium">Verificando conexión...</span>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center text-gray-500">
              <AlertCircle className="mr-2 h-4 w-4" />
              <span className="font-medium">Estado desconocido</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-64 space-y-3">
      {getStatusContent()}
      
      <div className="pt-2 border-t border-gray-200">
        <OfflineModeToggle />
      </div>
      
      {status !== 'connecting' && status !== 'offline' && (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-2"
          onClick={onManualCheck}
        >
          Verificar conexión
        </Button>
      )}
    </div>
  );
};

export default StatusTooltipContent;
