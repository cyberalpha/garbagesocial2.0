
import { supabase } from '@/integrations/supabase/client';
import { getFromStorage, saveToStorage } from '@/services/localStorage';
import { WASTES_STORAGE_KEY } from '@/types';
import { getAllWastes } from '../wastes';
import { Waste, User } from '@/types';
import { transformWasteToSupabase } from '../wastes/utils';

type SyncOperation = {
  type: 'create' | 'update' | 'delete';
  data: any;
  id: string;
  timestamp: number;
  entity: 'waste' | 'user';
  synced: boolean;
};

// Clase para sincronizar datos entre localStorage y Supabase
export class DataSynchronizer {
  private syncQueue: SyncOperation[] = [];
  
  constructor() {
    this.loadSyncQueue();
  }
  
  private loadSyncQueue() {
    const storedQueue = localStorage.getItem('sync_queue');
    if (storedQueue) {
      try {
        this.syncQueue = JSON.parse(storedQueue);
      } catch (error) {
        console.error('Error loading sync queue:', error);
        this.syncQueue = [];
      }
    }
  }
  
  private saveSyncQueue() {
    try {
      localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }
  
  // Agregar operación al queue
  public addToQueue(operation: Omit<SyncOperation, 'timestamp' | 'synced'>) {
    const queueItem: SyncOperation = {
      ...operation,
      timestamp: Date.now(),
      synced: false
    };
    
    this.syncQueue.push(queueItem);
    this.saveSyncQueue();
  }
  
  // Sincronizar un residuo con Supabase
  private async syncWaste(operation: SyncOperation): Promise<boolean> {
    try {
      const waste = operation.data as Waste;
      const supabaseData = transformWasteToSupabase(waste);
      
      switch (operation.type) {
        case 'create':
        case 'update':
          const { error: upsertError } = await supabase
            .from('wastes')
            .upsert(supabaseData, { onConflict: 'id' });
          
          if (upsertError) {
            console.error('Error syncing waste:', upsertError);
            return false;
          }
          break;
          
        case 'delete':
          const { error: deleteError } = await supabase
            .from('wastes')
            .delete()
            .eq('id', operation.id);
          
          if (deleteError) {
            console.error('Error deleting waste:', deleteError);
            return false;
          }
          break;
      }
      
      return true;
    } catch (error) {
      console.error('Error syncing waste:', error);
      return false;
    }
  }
  
  // Sincronizar con Supabase
  public async synchronize(): Promise<{ success: boolean; synced: number; failed: number }> {
    if (this.syncQueue.length === 0) {
      return { success: true, synced: 0, failed: 0 };
    }
    
    let synced = 0;
    let failed = 0;
    
    for (const operation of this.syncQueue) {
      if (operation.synced) continue;
      
      let success = false;
      
      switch (operation.entity) {
        case 'waste':
          success = await this.syncWaste(operation);
          break;
        case 'user':
          // Implementar sincronización de usuarios si es necesario
          success = true;
          break;
      }
      
      if (success) {
        operation.synced = true;
        synced++;
      } else {
        failed++;
      }
    }
    
    // Limpiar operaciones sincronizadas
    this.syncQueue = this.syncQueue.filter(op => !op.synced);
    this.saveSyncQueue();
    
    return {
      success: failed === 0,
      synced,
      failed
    };
  }
  
  // Obtener número de operaciones pendientes
  public getPendingOperationsCount(): number {
    return this.syncQueue.filter(op => !op.synced).length;
  }
  
  // Sincronizar residuos desde Supabase
  public async syncFromSupabase(): Promise<void> {
    try {
      // Obtener residuos de Supabase
      const { data: supabaseWastes, error } = await supabase
        .from('wastes')
        .select('*');
      
      if (error) {
        console.error('Error getting wastes from Supabase:', error);
        return;
      }
      
      if (!supabaseWastes) {
        return;
      }
      
      // Convertir al formato de la aplicación
      const wastes = supabaseWastes.map(waste => transformWasteToSupabase(waste));
      
      // Guardar en localStorage
      saveToStorage(WASTES_STORAGE_KEY, wastes);
      
    } catch (error) {
      console.error('Error syncing from Supabase:', error);
    }
  }
}

// Exportar una instancia para uso global
export const dataSynchronizer = new DataSynchronizer();
