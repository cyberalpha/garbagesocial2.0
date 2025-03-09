
import { supabase } from '@/integrations/supabase/client';
import { syncQueue, SyncOperation } from './SyncQueue';
import { getWastes, saveWaste, deleteWaste } from '../wastes';
import { getUsers, saveUser, deleteUser } from '../users';
import { Waste, User } from '@/types';
import { transformWasteForSupabase } from '../wastes/utils';

// Intervalo de sincronización en ms (3 minutos)
const SYNC_INTERVAL = 3 * 60 * 1000;

/**
 * Servicio para gestionar la sincronización de datos con Supabase
 */
export class DataSynchronizer {
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing = false;
  private isOnline = navigator.onLine;
  
  /**
   * Iniciar el servicio de sincronización
   */
  public start(): void {
    console.log('Iniciando servicio de sincronización...');
    
    // Configurar listeners para el estado de la conexión
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Intentar sincronizar inmediatamente si estamos online
    if (this.isOnline) {
      this.sync();
    }
    
    // Configurar intervalo de sincronización
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
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
    
    console.log('Servicio de sincronización detenido');
  }
  
  /**
   * Manejador para cuando el dispositivo se conecta
   */
  private handleOnline = (): void => {
    console.log('Dispositivo en línea, iniciando sincronización...');
    this.isOnline = true;
    this.sync();
  };
  
  /**
   * Manejador para cuando el dispositivo pierde conexión
   */
  private handleOffline = (): void => {
    console.log('Dispositivo sin conexión, sincronización pausada');
    this.isOnline = false;
  };
  
  /**
   * Sincronizar datos con Supabase
   */
  public async sync(): Promise<void> {
    if (this.isSyncing || !this.isOnline) {
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
          const { error } = await supabase
            .from('wastes')
            .upsert(supabaseData);
          
          if (error) {
            console.error(`Error al sincronizar residuo ${waste.id}:`, error);
            return false;
          }
          
          return true;
        }
        case 'delete': {
          const { error } = await supabase
            .from('wastes')
            .delete()
            .eq('id', op.entityId);
          
          if (error) {
            console.error(`Error al eliminar residuo ${op.entityId}:`, error);
            return false;
          }
          
          return true;
        }
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error procesando operación de residuo ${op.id}:`, error);
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
    pendingOperations: number;
  } {
    return {
      isSyncing: this.isSyncing,
      isOnline: this.isOnline,
      pendingOperations: syncQueue.getPendingCount()
    };
  }
}

// Exportar una instancia singleton
export const dataSynchronizer = new DataSynchronizer();
