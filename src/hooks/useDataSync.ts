
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { dataSynchronizer } from '@/services/sync/DataSynchronizer';
import { syncQueue } from '@/services/sync/SyncQueue';
import { initLocalStorage, clearExpiredItems } from '@/services/localStorage';

interface DataSyncState {
  isSyncing: boolean;
  isOnline: boolean;
  pendingOperations: number;
  lastSyncAttempt: Date | null;
}

/**
 * Hook para gestionar la sincronización de datos entre local y Supabase
 */
export const useDataSync = () => {
  const [syncState, setSyncState] = useState<DataSyncState>({
    isSyncing: false,
    isOnline: navigator.onLine,
    pendingOperations: 0,
    lastSyncAttempt: null
  });
  const { toast } = useToast();
  
  // Obtener estado actualizado
  const refreshState = useCallback(() => {
    const state = dataSynchronizer.getSyncState();
    setSyncState(prev => ({
      ...prev,
      isSyncing: state.isSyncing,
      isOnline: state.isOnline,
      pendingOperations: state.pendingOperations
    }));
  }, []);
  
  // Forzar sincronización
  const syncNow = useCallback(async () => {
    if (!syncState.isOnline) {
      toast({
        title: "Sin conexión",
        description: "No es posible sincronizar sin conexión a internet",
        variant: "destructive"
      });
      return false;
    }
    
    if (syncState.isSyncing) {
      toast({
        title: "Sincronización en progreso",
        description: "Ya hay una sincronización en curso"
      });
      return false;
    }
    
    try {
      setSyncState(prev => ({ ...prev, isSyncing: true, lastSyncAttempt: new Date() }));
      
      const success = await dataSynchronizer.forceSyncIfOnline();
      
      // Pequeña pausa para que el usuario vea que algo ocurrió
      await new Promise(resolve => setTimeout(resolve, 500));
      
      refreshState();
      
      if (success) {
        toast({
          title: "Sincronización completada",
          description: "Los datos se han sincronizado correctamente"
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error durante la sincronización manual:", error);
      toast({
        title: "Error de sincronización",
        description: "No se pudieron sincronizar los datos. Intente nuevamente más tarde.",
        variant: "destructive"
      });
      return false;
    } finally {
      setSyncState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [syncState.isOnline, syncState.isSyncing, toast, refreshState]);
  
  // Inicializar sincronización
  useEffect(() => {
    // Inicializar localStorage
    initLocalStorage();
    
    // Limpiar items expirados
    clearExpiredItems();
    
    // Iniciar el servicio de sincronización
    dataSynchronizer.start();
    
    // Configurar intervalo para actualizar el estado
    const intervalId = setInterval(() => {
      refreshState();
    }, 5000);
    
    // Configurar manejador para cambios en el estado de la red
    const handleOnlineStatusChange = () => {
      setSyncState(prev => ({ ...prev, isOnline: navigator.onLine }));
    };
    
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    // Limpiar al desmontar
    return () => {
      dataSynchronizer.stop();
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, [refreshState]);
  
  return {
    ...syncState,
    syncNow,
    hasPendingChanges: syncState.pendingOperations > 0
  };
};
