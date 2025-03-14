
import { supabase, offlineMode } from '@/integrations/supabase/client';
import { syncQueue, SyncOperation } from './SyncQueue';
import { getWastes, saveWaste, deleteWaste } from '../wastes';
import { getUsers, saveUser, deleteUser } from '../users';
import { Waste, User } from '@/types';
import { transformWasteForSupabase } from '../wastes/utils';
import { safeTableAccess } from '@/utils/supabaseMockUtils';

const SYNC_INTERVAL = 3 * 60 * 1000;

interface SyncError {
  id: string;
  timestamp: Date;
  operation?: string;
  entityType?: string;
  message: string;
}

/**
 * Servicio para gestionar la sincronización de datos con Supabase
 */
export class DataSynchronizer {
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing = false;
  private isOnline = navigator.onLine;
  private syncErrors: SyncError[] = [];
  
  // Callback para errores de sincronización
  public onSyncError: ((error: Error | string, operation?: string, entityType?: string) => void) | null = null;
  
  /**
   * Iniciar el servicio de sincronización
   */
  public start(): void {
    console.log('Iniciando servicio de sincronización...');
    
    // Configurar listeners para el estado de la conexión
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    window.addEventListener('offlinemodechange', this.handleOfflineModeChange);
    
    // Intentar sincronizar inmediatamente si estamos online y no en modo offline
    if (this.isOnline && !offlineMode()) {
      this.sync();
    }
    
    // Configurar intervalo de sincronización
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !offlineMode()) {
        this.sync();
      }
    }, SYNC_INTERVAL);
  }
  
  /**
   * Detener el servicio de sincronización
   */
  public stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    window.removeEventListener('offlinemodechange', this.handleOfflineModeChange);
    
    console.log('Servicio de sincronización detenido');
  }
  
  /**
   * Manejador para cuando el dispositivo se conecta
   */
  private handleOnline = (): void => {
    console.log('Dispositivo en línea, iniciando sincronización...');
    this.isOnline = true;
    if (!offlineMode()) {
      this.sync();
    }
  };
  
  /**
   * Manejador para cuando el dispositivo pierde conexión
   */
  private handleOffline = (): void => {
    console.log('Dispositivo sin conexión, sincronización pausada');
    this.isOnline = false;
  };
  
  /**
   * Manejador para cambios en el modo offline
   */
  private handleOfflineModeChange = (event: Event): void => {
    const customEvent = event as CustomEvent;
    const newOfflineMode = customEvent.detail?.offlineMode || false;
    console.log(`Modo offline cambiado a: ${newOfflineMode}`);
    
    if (!newOfflineMode && this.isOnline) {
      // Si salimos del modo offline y hay conexión, iniciar sincronización
      setTimeout(() => this.sync(), 500);
    }
  };
  
  /**
   * Reportar error de sincronización
   */
  private reportError(error: Error | string, operation?: string, entityType?: string): void {
    const errorMsg = typeof error === 'string' ? error : error.message || 'Error desconocido';
    
    // Guardar el error en la lista local
    this.syncErrors.unshift({
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
      operation,
      entityType,
      message: errorMsg
    });
    
    // Mantener solo los 20 errores más recientes
    if (this.syncErrors.length > 20) {
      this.syncErrors = this.syncErrors.slice(0, 20);
    }
    
    // Llamar al callback si existe
    if (this.onSyncError) {
      this.onSyncError(error, operation, entityType);
    }
  }
  
  /**
   * Sincronizar datos con Supabase
   */
  public async sync(): Promise<void> {
    if (this.isSyncing || !this.isOnline || offlineMode()) {
      return;
    }
    
    this.isSyncing = true;
    console.log('Iniciando sincronización de datos...');
    
    try {
      // Procesar cola de operaciones pendientes
      await syncQueue.processQueue({
        processWasteOperation: this.processWasteOperation.bind(this),
        processUserOperation: this.processUserOperation.bind(this),
        processRatingOperation: this.processRatingOperation.bind(this)
      });
      
      // TODO: Sincronizar datos remotos con locales (pull)
      // Esto se podría implementar en una fase posterior
      
    } catch (error) {
      console.error('Error durante la sincronización:', error);
      this.reportError(error as Error, 'sync', 'global');
    } finally {
      this.isSyncing = false;
      console.log('Sincronización completada');
    }
  }
  
  /**
   * Forzar sincronización manual
   */
  public async forceSyncIfOnline(): Promise<boolean> {
    if (!this.isOnline) {
      console.log('No se puede sincronizar, dispositivo sin conexión');
      return false;
    }
    
    if (this.isSyncing) {
      console.log('Sincronización ya en progreso');
      return false;
    }
    
    try {
      await this.sync();
      return true;
    } catch (error) {
      console.error('Error durante la sincronización forzada:', error);
      this.reportError(error as Error, 'sync', 'manual');
      return false;
    }
  }
  
  /**
   * Procesar operación de residuo
   */
  private async processWasteOperation(op: SyncOperation): Promise<boolean> {
    try {
      switch (op.operation) {
        case 'create':
        case 'update': {
          const waste = op.data as Waste;
          if (!waste) return false;
          
          const supabaseData = transformWasteForSupabase(waste);
          const result = await safeTableAccess('wastes')
            .upsert(supabaseData);
            
          const { error } = result;
          
          if (error) {
            console.error(`Error al sincronizar residuo ${waste.id}:`, error);
            this.reportError(error, op.operation, 'waste');
            return false;
          }
          
          return true;
        }
        case 'delete': {
          const result = await safeTableAccess('wastes')
            .delete()
            .eq('id', op.entityId);
            
          const { error } = result;
          
          if (error) {
            console.error(`Error al eliminar residuo ${op.entityId}:`, error);
            this.reportError(error, 'delete', 'waste');
            return false;
          }
          
          return true;
        }
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error procesando operación de residuo ${op.id}:`, error);
      this.reportError(error as Error, op.operation, 'waste');
      return false;
    }
  }
  
  /**
   * Procesar operación de usuario
   */
  private async processUserOperation(op: SyncOperation): Promise<boolean> {
    // Por ahora, implementación básica ya que los usuarios se gestionan en auth
    return true;
  }
  
  /**
   * Procesar operación de calificación
   */
  private async processRatingOperation(op: SyncOperation): Promise<boolean> {
    // Implementación futura para ratings
    return true;
  }
  
  /**
   * Limpiar todos los errores de sincronización
   */
  public clearErrors(): void {
    this.syncErrors = [];
  }
  
  /**
   * Verificar si el dispositivo está en línea
   */
  public isDeviceOnline(): boolean {
    return this.isOnline;
  }
  
  /**
   * Obtener el estado actual de sincronización
   */
  public getSyncState(): {
    isSyncing: boolean;
    isOnline: boolean;
    offlineMode: boolean;
    pendingOperations: number;
    syncErrors: SyncError[];
  } {
    return {
      isSyncing: this.isSyncing,
      isOnline: this.isOnline,
      offlineMode: offlineMode(),
      pendingOperations: syncQueue.getPendingCount(),
      syncErrors: [...this.syncErrors]
    };
  }
}

// Exportar una instancia singleton
export const dataSynchronizer = new DataSynchronizer();
