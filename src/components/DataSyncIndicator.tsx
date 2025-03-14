
import React, { useState } from 'react';
import { useDataSync } from '@/hooks/useDataSync';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { CloudOff, Loader2, Database, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DataSyncIndicatorProps {
  className?: string;
}

/**
 * Componente que muestra el estado de sincronización de datos
 */
const DataSyncIndicator = ({ className }: DataSyncIndicatorProps) => {
  const { isOnline, isSyncing, pendingOperations, syncNow, lastSyncAttempt, syncErrors } = useDataSync();
  const { toast } = useToast();
  const [isTrying, setIsTrying] = useState(false);

  const handleSync = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSyncing || isTrying) return;
    
    try {
      setIsTrying(true);
      const result = await syncNow();
      if (!result) {
        toast({
          title: "Error de sincronización",
          description: "No se pudo sincronizar. Intente nuevamente más tarde.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error en sincronización manual:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
    } finally {
      setIsTrying(false);
    }
  };

  const hasErrors = syncErrors && syncErrors.length > 0;

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
              !isOnline
                ? "bg-destructive/80 hover:bg-destructive"
                : hasErrors
                  ? "bg-red-500/80 hover:bg-red-500"
                  : pendingOperations > 0 
                    ? "bg-amber-500/80 hover:bg-amber-500" 
                    : "bg-green-500/80 hover:bg-green-500"
            )}
            onClick={handleSync}
            disabled={isSyncing || isTrying}
          >
            {isSyncing || isTrying ? (
              <Loader2 className="h-5 w-5 text-white animate-spin" />
            ) : !isOnline ? (
              <CloudOff className="h-5 w-5 text-white" />
            ) : hasErrors ? (
              <AlertTriangle className="h-5 w-5 text-white animate-pulse" />
            ) : (
              <Database className={cn(
                "h-5 w-5 text-white",
                pendingOperations > 0 && "animate-pulse"
              )} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs p-4">
          <div className="space-y-3">
            <p className="font-medium">
              {isSyncing 
                ? "Sincronizando datos..." 
                : !isOnline 
                  ? "Sin conexión, los cambios se sincronizarán cuando vuelvas a estar en línea"
                  : hasErrors
                    ? "Errores de sincronización. Haz clic para reintentar."
                    : pendingOperations > 0 
                      ? `Hay ${pendingOperations} cambios pendientes de sincronizar` 
                      : "Datos sincronizados" 
              }
            </p>
            
            {hasErrors && (
              <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
                <p className="font-medium mb-1">Últimos errores:</p>
                <ul className="list-disc pl-4">
                  {syncErrors.slice(0, 3).map((err, i) => (
                    <li key={i}>{err.message || "Error desconocido"}</li>
                  ))}
                  {syncErrors.length > 3 && <li>...y {syncErrors.length - 3} más</li>}
                </ul>
              </div>
            )}
            
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
