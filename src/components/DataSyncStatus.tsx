
import React from 'react';
import { useDataSynchronizer } from '@/hooks/useDataSynchronizer';
import { useInternetConnection } from '@/hooks/useInternetConnection';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CloudSync, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataSyncStatusProps {
  className?: string;
}

const DataSyncStatus: React.FC<DataSyncStatusProps> = ({ className }) => {
  const { isSynchronizing, lastSyncTime, forceSynchronize } = useDataSynchronizer();
  const { isOnline } = useInternetConnection();
  const { status: supabaseStatus } = useSupabaseConnection();

  const canSync = isOnline && supabaseStatus === 'connected' && !isSynchronizing;

  const handleSyncClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canSync) {
      await forceSynchronize();
    }
  };

  const getFormatTime = (date: Date | null) => {
    if (!date) return 'Nunca';
    return new Intl.DateTimeFormat('es', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div 
      className={cn(
        "fixed bottom-28 right-4 z-40 transition-all duration-300",
        className
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={!canSync}
            onClick={handleSyncClick}
            className={cn(
              "p-2 rounded-full shadow-md flex items-center justify-center transition-colors",
              isSynchronizing 
                ? "bg-amber-500/80 hover:bg-amber-500" 
                : canSync
                  ? "bg-primary/80 hover:bg-primary" 
                  : "bg-slate-500/80"
            )}
          >
            {isSynchronizing ? (
              <RefreshCw className="h-5 w-5 text-white animate-spin" />
            ) : (
              <CloudSync className="h-5 w-5 text-white" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs p-4">
          <div className="space-y-2">
            <p className="font-medium">
              {isSynchronizing 
                ? 'Sincronizando datos...' 
                : canSync 
                  ? 'Sincronización disponible' 
                  : 'Sincronización no disponible'
              }
            </p>
            {lastSyncTime && (
              <p className="text-xs text-muted-foreground">
                Última sincronización: {getFormatTime(lastSyncTime)}
              </p>
            )}
            <p className="text-xs italic">
              {canSync 
                ? 'Haz clic para sincronizar manualmente' 
                : !isOnline 
                  ? 'Se requiere conexión a internet' 
                  : supabaseStatus !== 'connected' 
                    ? 'Se requiere conexión a Supabase' 
                    : 'Sincronización en progreso...'
              }
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default DataSyncStatus;
