
import { useState, useEffect, useCallback } from 'react';
import { dataSynchronizer } from '@/services/sync/DataSynchronizer';
import { useAuth } from '@/hooks/useAuth';
import { isOnline, offlineMode, setOfflineMode } from '@/integrations/supabase/client';

type SyncState = {
  syncing: boolean;
  lastSync: Date | null;
  error: Error | null;
  pendingOperations: number;
  online: boolean;
  offlineMode: boolean;
};

export const useDataSync = () => {
  const { currentUser } = useAuth();
  const [state, setState] = useState<SyncState>({
    syncing: false,
    lastSync: null,
    error: null,
    pendingOperations: 0,
    online: navigator.onLine,
    offlineMode: offlineMode()
  });

  // Actualiza estado con info de pendientes
  const updateState = useCallback(() => {
    const syncState = dataSynchronizer.getSyncState();
    const pendingCount = dataSynchronizer.getPendingOperationsCount();
    
    setState(prevState => ({
      ...prevState,
      syncing: syncState.syncing,
      lastSync: syncState.lastSync,
      error: syncState.error,
      pendingOperations: pendingCount,
      online: navigator.onLine,
      offlineMode: offlineMode()
    }));
  }, []);

  // Sincronizar datos (forzado)
  const syncData = useCallback(async () => {
    if (!isOnline() || offlineMode()) {
      return { success: false, message: 'No hay conexión o modo offline activo' };
    }
    
    try {
      const result = await dataSynchronizer.synchronize();
      updateState();
      
      return {
        success: result.success,
        message: result.success 
          ? `Sincronizado correctamente (${result.synced} cambios)`
          : `Error al sincronizar (${result.failed} fallidos)`
      };
    } catch (error) {
      console.error('Error al sincronizar:', error);
      return {
        success: false,
        message: `Error al sincronizar: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }, [updateState]);

  // Sincronizar si hay conexión
  const syncIfOnline = useCallback(async () => {
    if (isOnline() && !offlineMode()) {
      return await dataSynchronizer.forceSyncIfOnline();
    }
    return false;
  }, []);

  // Cambiar modo offline
  const toggleOfflineMode = useCallback(() => {
    const newOfflineMode = !offlineMode();
    setOfflineMode(newOfflineMode);
    updateState();
    
    return { success: true, offlineMode: newOfflineMode };
  }, [updateState]);

  // Efecto para actualizar conteo de pendientes y escuchar cambios de red
  useEffect(() => {
    const handleOnline = () => {
      updateState();
      
      // Intentar sincronizar automáticamente cuando vuelve la conexión
      if (!offlineMode()) {
        syncIfOnline().catch(console.error);
      }
    };
    
    const handleOffline = () => {
      updateState();
    };
    
    const handleOfflineModeChange = () => {
      updateState();
    };
    
    // Configurar manejador de errores de sincronización
    dataSynchronizer.onSyncError = (error) => {
      console.error('Error de sincronización:', error);
      updateState();
    };
    
    // Iniciar sincronización automática
    if (currentUser) {
      dataSynchronizer.start(60000); // Cada 60 segundos
    }
    
    // Registrar event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offlinemodechange', handleOfflineModeChange);
    
    // Actualizar estado inicial
    updateState();
    
    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offlinemodechange', handleOfflineModeChange);
      
      dataSynchronizer.onSyncError = null;
      dataSynchronizer.stop();
    };
  }, [currentUser, updateState, syncIfOnline]);

  return {
    ...state,
    syncData,
    syncIfOnline,
    toggleOfflineMode
  };
};
