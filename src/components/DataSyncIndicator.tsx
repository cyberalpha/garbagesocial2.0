
import React from 'react';
import { useDataSync } from '@/hooks/useDataSync';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { CloudSyncIcon, CloudOffIcon, Loader2Icon } from 'lucide-react';

interface DataSyncIndicatorProps {
  className?: string;
}

/**
 * Componente que muestra el estado de sincronización de datos
 */
const DataSyncIndicator = ({ className }: DataSyncIndicatorProps) => {
  const { isOnline, isSyncing, pendingOperations, syncNow, lastSyncAttempt } = useDataSync();

  const handleSync = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    syncNow();
  };

  return (
    <div 
      className={cn(
        "fixed bottom-4 right-28 z-50 transition-all duration-300",
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
              isOnline 
                ? pendingOperations > 0 
                  ? "bg-amber-500/80 hover:bg-amber-500" 
                  : "bg-green-500/80 hover:bg-green-500"
                : "bg-destructive/80 hover:bg-destructive"
            )}
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <Loader2Icon className="h-5 w-5 text-white animate-spin" />
            ) : isOnline ? (
              <CloudSyncIcon className={cn(
                "h-5 w-5 text-white",
                pendingOperations > 0 && "animate-pulse"
              )} />
            ) : (
              <CloudOffIcon className="h-5 w-5 text-white" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs p-4">
          <div className="space-y-3">
            <p className="font-medium">
              {isSyncing 
                ? "Sincronizando datos..." 
                : isOnline 
                  ? pendingOperations > 0 
                    ? `Hay ${pendingOperations} cambios pendientes de sincronizar` 
                    : "Datos sincronizados" 
                  : "Sin conexión, los cambios se sincronizarán cuando vuelvas a estar en línea"}
            </p>
            
            {lastSyncAttempt && (
              <p className="text-xs text-muted-foreground">
                Último intento: {lastSyncAttempt.toLocaleTimeString()}
              </p>
            )}
            
            {!isSyncing && (
              <p className="text-xs italic mt-2">
                Haz clic para sincronizar manualmente
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default DataSyncIndicator;
