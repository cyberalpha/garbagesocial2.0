
import React from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useDataSync } from '@/hooks/useDataSync';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Componente que muestra el estado de sincronización de datos
 */
const DataSyncIndicator: React.FC = () => {
  const { 
    syncing, 
    lastSync, 
    error, 
    pendingOperations,
    online,
    offlineMode,
    syncData,
    toggleOfflineMode
  } = useDataSync();

  // Formatter for last sync time
  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Nunca';
    return new Intl.DateTimeFormat('es-ES', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit', 
      minute: '2-digit'
    }).format(date);
  };

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-1">
        {offlineMode ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 text-gray-500"
                onClick={() => toggleOfflineMode()}
              >
                <WifiOff className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Modo offline activo</p>
            </TooltipContent>
          </Tooltip>
        ) : online ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className={`h-8 w-8 ${error ? 'text-red-500' : 'text-green-500'}`}
                onClick={() => toggleOfflineMode()}
              >
                <Wifi className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Online - Última sincronización: {formatLastSync(lastSync)}</p>
              {pendingOperations > 0 && (
                <p>Cambios pendientes: {pendingOperations}</p>
              )}
            </TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 text-amber-500"
                onClick={() => toggleOfflineMode()}
              >
                <WifiOff className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sin conexión a internet</p>
              {pendingOperations > 0 && (
                <p>Cambios pendientes: {pendingOperations}</p>
              )}
            </TooltipContent>
          </Tooltip>
        )}

        {error && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 text-red-500"
              >
                <AlertCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Error: {error.message}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {online && !offlineMode && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className={`h-8 w-8 ${syncing ? 'animate-spin text-primary' : 'text-gray-500'}`}
                onClick={() => syncData()}
                disabled={syncing}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{syncing ? 'Sincronizando...' : 'Sincronizar ahora'}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

export default DataSyncIndicator;
