
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useDataSync } from '@/hooks/useDataSync';
import { Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Componente que permite activar/desactivar el modo offline
 */
const OfflineModeToggle: React.FC = () => {
  const { 
    syncData, 
    syncing, 
    error, 
    offlineMode, 
    toggleOfflineMode 
  } = useDataSync();

  const handleSync = async () => {
    await syncData();
  };

  return (
    <div className="mb-6 flex flex-col gap-2 p-4 border border-border rounded-lg">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          {offlineMode ? <WifiOff className="h-4 w-4 text-red-500" /> : <Wifi className="h-4 w-4 text-green-500" />}
          <Label htmlFor="offline-mode" className="text-sm font-medium cursor-pointer">
            Modo offline
          </Label>
        </div>
        <Switch
          id="offline-mode"
          checked={offlineMode}
          onCheckedChange={toggleOfflineMode}
        />
      </div>
      
      <div className="text-xs text-muted-foreground">
        {offlineMode ? (
          <>La aplicación funciona sin conexión a internet. Los cambios se guardarán localmente.</>
        ) : (
          <>La aplicación está conectada a internet y sincronizará cambios automáticamente.</>
        )}
      </div>
      
      {!offlineMode && (
        <div className="mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? 'Sincronizando...' : 'Sincronizar ahora'}
          </Button>
          {error && (
            <p className="text-xs text-red-500 mt-1">
              Error: {error.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default OfflineModeToggle;
