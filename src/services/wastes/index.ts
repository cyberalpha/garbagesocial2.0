
import { Waste, WasteType, WASTES_STORAGE_KEY } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { saveToStorage, getFromStorage } from '@/services/localStorage';
import { transformSupabaseWaste, transformWasteToSupabase } from './utils';
import { dataSynchronizer } from '../sync/DataSynchronizer';
import { supabase } from '@/integrations/supabase/client';
import { offlineMode } from '@/integrations/supabase/client';

// Obtiene todos los residuos del localStorage
export const getAllWastes = async (): Promise<Waste[]> => {
  const wastes = getFromStorage<Waste[]>(WASTES_STORAGE_KEY, []);
  return wastes;
};

// Obtiene residuos por tipo
export const getWastesByType = async (type: WasteType): Promise<Waste[]> => {
  const wastes = await getAllWastes();
  return wastes.filter(waste => waste.type === type);
};

// Obtiene residuos de un usuario específico
export const getWastesByUserId = async (userId: string): Promise<Waste[]> => {
  const wastes = await getAllWastes();
  return wastes.filter(waste => waste.userId === userId);
};

// Obtiene un residuo específico por su ID
export const getWasteById = async (id: string): Promise<Waste | null> => {
  const wastes = await getAllWastes();
  return wastes.find(waste => waste.id === id) || null;
};

// Agrega un nuevo residuo
export const addWaste = async (wasteData: Partial<Waste>): Promise<Waste> => {
  // Verificar datos obligatorios
  if (!wasteData.userId) {
    throw new Error('userId es obligatorio');
  }
  
  if (!wasteData.type) {
    throw new Error('El tipo de residuo es obligatorio');
  }
  
  // Crear nuevo residuo con ID único
  const newWaste: Waste = {
    id: uuidv4(),
    userId: wasteData.userId,
    type: wasteData.type,
    description: wasteData.description || '',
    imageUrl: wasteData.imageUrl,
    location: wasteData.location || { type: 'Point', coordinates: [0, 0] },
    publicationDate: wasteData.publicationDate || new Date(),
    status: wasteData.status || 'pending',
    pickupCommitment: wasteData.pickupCommitment
  };
  
  // Obtener lista actual de residuos
  const wastes = await getAllWastes();
  
  // Agregar nuevo residuo
  const updatedWastes = [...wastes, newWaste];
  
  // Guardar en localStorage
  saveToStorage(WASTES_STORAGE_KEY, updatedWastes);
  
  // Agregar a la cola de sincronización
  dataSynchronizer.addToQueue({
    type: 'create',
    data: newWaste,
    id: newWaste.id,
    entity: 'waste'
  });
  
  return newWaste;
};

// Actualiza un residuo existente
export const updateWaste = async (id: string, updates: Partial<Waste>): Promise<Waste> => {
  const wastes = await getAllWastes();
  const wasteIndex = wastes.findIndex(waste => waste.id === id);
  
  if (wasteIndex === -1) {
    throw new Error(`Residuo con ID ${id} no encontrado`);
  }
  
  // Actualizar el residuo con los nuevos datos
  const updatedWaste = {
    ...wastes[wasteIndex],
    ...updates
  };
  
  // Actualizar la lista
  wastes[wasteIndex] = updatedWaste;
  
  // Guardar en localStorage
  saveToStorage(WASTES_STORAGE_KEY, wastes);
  
  // Agregar a la cola de sincronización
  dataSynchronizer.addToQueue({
    type: 'update',
    data: updatedWaste,
    id: updatedWaste.id,
    entity: 'waste'
  });
  
  return updatedWaste;
};

// Elimina un residuo
export const deleteWaste = async (id: string): Promise<void> => {
  const wastes = await getAllWastes();
  const wasteToDelete = wastes.find(waste => waste.id === id);
  
  if (!wasteToDelete) {
    throw new Error(`Residuo con ID ${id} no encontrado`);
  }
  
  // Filtrar el residuo a eliminar
  const updatedWastes = wastes.filter(waste => waste.id !== id);
  
  // Guardar en localStorage
  saveToStorage(WASTES_STORAGE_KEY, updatedWastes);
  
  // Agregar a la cola de sincronización
  dataSynchronizer.addToQueue({
    type: 'delete',
    data: wasteToDelete,
    id: wasteToDelete.id,
    entity: 'waste'
  });
};

// Sincronizar residuos con Supabase (si está online)
export const syncWastesWithSupabase = async (): Promise<{
  success: boolean;
  synced: number;
  message: string;
}> => {
  try {
    if (offlineMode()) {
      return {
        success: false,
        synced: 0,
        message: 'Modo offline activo, no se puede sincronizar'
      };
    }
    
    // Sincronizar datos con Supabase
    const result = await dataSynchronizer.synchronize();
    
    return {
      success: result.success,
      synced: result.synced,
      message: result.success 
        ? `${result.synced} residuos sincronizados correctamente` 
        : `Error al sincronizar residuos. ${result.failed} operaciones fallidas.`
    };
  } catch (error) {
    console.error('Error sincronizando residuos:', error);
    return {
      success: false,
      synced: 0,
      message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
};
