
import React from 'react';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { WifiOff, Database, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useDataSync } from '@/hooks/useDataSync';

interface OfflineModeToggleProps {
  className?: string;
}

const OfflineModeToggle = ({ className }: OfflineModeToggleProps) => {
  const { isOfflineMode, toggleOfflineMode, status, error } = useSupabaseConnection();
  const { pendingOperations, syncNow, isSyncing, hasErrors } = useDataSync();

  const handleSyncNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOfflineMode && !isSyncing) {
      await syncNow();
    }
  };

  return (
    <div className={cn("p-3 rounded-lg border", isOfflineMode ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Switch 
            id="offline-mode" 
            checked={isOfflineMode} 
            onCheckedChange={toggleOfflineMode} 
            className={isOfflineMode ? "bg-amber-500" : ""}
          />
          <Label 
            htmlFor="offline-mode" 
            className="flex items-center cursor-pointer"
          >
            <WifiOff className={cn(
              "h-4 w-4 mr-2", 
              isOfflineMode ? "text-amber-500" : "text-gray-400"
            )} />
            <span className={cn(
              "text-sm font-medium",
              isOfflineMode ? "text-amber-600" : "text-gray-600"
            )}>
              Modo offline
            </span>
          </Label>
        </div>
        
        {pendingOperations > 0 && (
          <Badge variant={isOfflineMode ? "outline" : "secondary"} className="ml-auto">
            {pendingOperations} {pendingOperations === 1 ? "cambio pendiente" : "cambios pendientes"}
          </Badge>
        )}
      </div>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="mt-2 text-xs text-muted-foreground flex items-center">
            {isOfflineMode ? (
              <>
                <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
                <span className="text-amber-600">Los cambios se guardan localmente</span>
              </>
            ) : (
              <>
                <Database className="h-3 w-3 mr-1" />
                <span>Estado: {status === 'connected' ? 'Conectado' : 'Desconectado'}</span>
                {error && <span className="ml-2 text-destructive">[{error}]</span>}
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          {isOfflineMode ? (
            <div className="space-y-2">
              <p>Los cambios se guardan localmente y se sincronizarán cuando vuelvas a estar en línea</p>
              {pendingOperations > 0 && (
                <p className="text-amber-600 font-medium">Tienes {pendingOperations} {pendingOperations === 1 ? "cambio" : "cambios"} sin sincronizar</p>
              )}
              <p className="text-xs italic">Desactiva el modo offline para sincronizar automáticamente</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p>Estado: {status === 'connected' ? 'Conectado a Supabase' : 'Sin conexión'}</p>
              {error ? (
                <p className="text-destructive text-xs">{error}</p>
              ) : null}
              {pendingOperations > 0 && (
                <button 
                  onClick={handleSyncNow}
                  className="text-xs px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded flex items-center w-full justify-center"
                  disabled={isSyncing}
                >
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}
                </button>
              )}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default OfflineModeToggle;
