
import { markItemAsPending, markItemAsSynced } from '../localStorage';

export interface SyncOperation {
  id: string;
  operation: 'create' | 'update' | 'delete';
  entityType: 'waste' | 'user' | 'rating';
  entityId: string;
  data?: any;
  timestamp: number;
  retryCount: number;
}

const SYNC_QUEUE_KEY = 'sync_operation_queue';
const MAX_RETRY_ATTEMPTS = 5;

/**
 * Servicio para gestionar la cola de sincronización
 */
export class SyncQueue {
  private queue: SyncOperation[] = [];
  private isProcessing = false;
  
  constructor() {
    this.loadQueue();
  }
  
  /**
   * Cargar la cola desde localStorage
   */
  private loadQueue(): void {
    try {
      const queueStr = localStorage.getItem(SYNC_QUEUE_KEY);
      if (queueStr) {
        this.queue = JSON.parse(queueStr);
        console.log(`Cola de sincronización cargada: ${this.queue.length} operaciones pendientes`);
      }
    } catch (error) {
      console.error('Error al cargar la cola de sincronización:', error);
      this.queue = [];
    }
  }
  
  /**
   * Guardar la cola en localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error al guardar la cola de sincronización:', error);
    }
  }
  
  /**
   * Añadir una operación a la cola
   */
  public addOperation(
    operation: 'create' | 'update' | 'delete',
    entityType: 'waste' | 'user' | 'rating',
    entityId: string,
    data?: any
  ): string {
    const opId = `${operation}_${entityType}_${entityId}_${Date.now()}`;
    
    const syncOp: SyncOperation = {
      id: opId,
      operation,
      entityType,
      entityId,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };
    
    this.queue.push(syncOp);
    this.saveQueue();
    
    // Marcar el item como pendiente en localStorage
    if (entityType === 'waste') {
      markItemAsPending(`waste_${entityId}`);
    }
    
    console.log(`Operación añadida a la cola de sincronización: ${opId}`);
    
    return opId;
  }
  
  /**
   * Procesar la cola de sincronización
   */
  public async processQueue(processors: {
    processWasteOperation: (op: SyncOperation) => Promise<boolean>;
    processUserOperation: (op: SyncOperation) => Promise<boolean>;
    processRatingOperation: (op: SyncOperation) => Promise<boolean>;
  }): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    console.log(`Procesando cola de sincronización: ${this.queue.length} operaciones`);
    
    // Crear una copia de la cola para procesarla
    const currentQueue = [...this.queue];
    const successfulOps: string[] = [];
    const failedOps: string[] = [];
    
    for (const operation of currentQueue) {
      try {
        let success = false;
        
        switch (operation.entityType) {
          case 'waste':
            success = await processors.processWasteOperation(operation);
            break;
          case 'user':
            success = await processors.processUserOperation(operation);
            break;
          case 'rating':
            success = await processors.processRatingOperation(operation);
            break;
        }
        
        if (success) {
          successfulOps.push(operation.id);
          
          // Marcar el item como sincronizado en localStorage
          if (operation.entityType === 'waste' && operation.operation !== 'delete') {
            markItemAsSynced(`waste_${operation.entityId}`);
          }
        } else {
          // Incrementar el contador de reintentos
          operation.retryCount++;
          
          if (operation.retryCount >= MAX_RETRY_ATTEMPTS) {
            console.warn(`Operación ${operation.id} ha excedido el máximo de reintentos y será descartada`);
            failedOps.push(operation.id);
          }
        }
      } catch (error) {
        console.error(`Error al procesar operación ${operation.id}:`, error);
        operation.retryCount++;
        
        if (operation.retryCount >= MAX_RETRY_ATTEMPTS) {
          failedOps.push(operation.id);
        }
      }
    }
    
    // Eliminar operaciones exitosas o fallidas definitivamente
    this.queue = this.queue.filter(op => 
      !successfulOps.includes(op.id) && !failedOps.includes(op.id)
    );
    
    this.saveQueue();
    this.isProcessing = false;
    
    console.log(`Procesamiento de cola completado. Éxitos: ${successfulOps.length}, Fallos: ${failedOps.length}, Pendientes: ${this.queue.length}`);
  }
  
  /**
   * Obtener el número de operaciones pendientes
   */
  public getPendingCount(): number {
    return this.queue.length;
  }
  
  /**
   * Comprobar si hay operaciones pendientes para una entidad específica
   */
  public hasPendingOperationsForEntity(entityType: string, entityId: string): boolean {
    return this.queue.some(op => op.entityType === entityType && op.entityId === entityId);
  }
  
  /**
   * Limpiar la cola (solo para pruebas)
   */
  public clearQueue(): void {
    this.queue = [];
    this.saveQueue();
  }
}

// Singleton instance
export const syncQueue = new SyncQueue();
