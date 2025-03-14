
import { Waste, WasteStatus } from "@/types";
import { WASTES_STORAGE_KEY } from "./constants";
import { getFromStorage, saveToStorage } from "../localStorage";
import { supabase, offlineMode } from "@/integrations/supabase/client";
import { transformWasteForSupabase } from "./utils";
import { getWasteById } from "./fetchers";
import { syncQueue } from "../sync/SyncQueue";
import { dataSynchronizer } from "../sync/DataSynchronizer";
import { safeTableAccess } from "@/utils/supabaseMockUtils";

/**
 * Guardar residuo localmente y añadir a la cola de sincronización
 */
const saveWasteLocally = (waste: Waste, operation: 'create' | 'update'): void => {
  // Guardar en localStorage como respaldo
  const wastes = getFromStorage<Waste[]>(WASTES_STORAGE_KEY, []);
  const existingIndex = wastes.findIndex(w => w.id === waste.id);
  
  if (existingIndex >= 0) {
    wastes[existingIndex] = waste;
  } else {
    wastes.push(waste);
  }
  
  saveToStorage(WASTES_STORAGE_KEY, wastes, { syncStatus: 'pending' });
  console.log(`Residuo guardado localmente (${operation}):`, waste);
  
  // En modo offline, no agregamos a la cola de sincronización
  if (!offlineMode()) {
    // Añadir a la cola de sincronización
    syncQueue.addOperation(operation, 'waste', waste.id, waste);
    
    // Intentar sincronizar inmediatamente si estamos online
    dataSynchronizer.forceSyncIfOnline();
  }
};

/**
 * Add new waste to Supabase and localStorage as backup
 * Accepts partial waste and returns the complete waste object
 */
export const addWaste = async (wasteData: Partial<Waste>): Promise<Waste> => {
  // Check for user ID before proceeding
  if (!wasteData.userId) {
    console.error("Error: No se proporcionó un ID de usuario para crear el residuo");
    throw new Error("Se requiere un ID de usuario para crear un residuo");
  }

  // Generate a unique ID (simple implementation)
  const newId = `waste_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  // Create complete waste object with defaults for required fields
  const newWaste: Waste = {
    id: newId,
    userId: wasteData.userId,
    type: wasteData.type || 'various',
    description: wasteData.description || '',
    imageUrl: wasteData.imageUrl,
    location: wasteData.location || {
      type: 'Point',
      coordinates: [0, 0]
    },
    publicationDate: wasteData.publicationDate || new Date(),
    status: wasteData.status || 'pending',
    pickupCommitment: wasteData.pickupCommitment
  };
  
  console.log("Generando nuevo residuo con ID:", newId, "para usuario:", wasteData.userId);
  
  // En modo offline, sólo guardamos localmente
  if (offlineMode()) {
    console.log("Modo offline: guardando residuo sólo localmente");
    saveWasteLocally(newWaste, 'create');
    return newWaste;
  }
  
  try {
    // Intentar guardar en Supabase si hay conexión
    const isOnline = dataSynchronizer.isDeviceOnline();
    
    if (isOnline) {
      // Transformar para Supabase y guardar
      const supabaseData = transformWasteForSupabase(newWaste);
      console.log("Datos transformados para Supabase:", supabaseData);
      
      // Intentar guardar en Supabase directamente con cliente
      const { data, error } = await supabase
        .from('wastes')
        .insert(supabaseData)
        .select()
        .single();
        
      if (error) {
        console.error("Error al insertar residuo en Supabase:", error);
        // Guardar localmente y agregar a la cola si hay error
        saveWasteLocally(newWaste, 'create');
      } else {
        console.log("Residuo guardado correctamente en Supabase:", data);
        // Usar el ID devuelto por Supabase si está disponible
        if (data && data.id) {
          newWaste.id = data.id;
        }
        // También guardar en localStorage para acceso rápido
        const wastes = getFromStorage<Waste[]>(WASTES_STORAGE_KEY, []);
        wastes.push(newWaste);
        saveToStorage(WASTES_STORAGE_KEY, wastes, { syncStatus: 'synced' });
      }
    } else {
      // Sin conexión, guardar localmente y agregar a la cola
      console.log("Sin conexión, guardando localmente");
      saveWasteLocally(newWaste, 'create');
    }
  } catch (error) {
    // En caso de error (por ejemplo, si Supabase no está disponible)
    console.error("Error en addWaste, usando localStorage como respaldo:", error);
    saveWasteLocally(newWaste, 'create');
    throw error; // Re-lanzar el error para que se pueda manejar en la interfaz
  }
  
  return newWaste;
};

/**
 * Save waste to Supabase and localStorage as backup
 */
export const saveWaste = async (waste: Waste): Promise<void> => {
  try {
    const isOnline = dataSynchronizer.isDeviceOnline();
    
    if (isOnline) {
      // Transformar para Supabase
      const supabaseData = transformWasteForSupabase(waste);
      
      // Intentar guardar en Supabase
      const result = await safeTableAccess('wastes')
        .upsert(supabaseData);
        
      const { error } = result;
      
      if (error) {
        console.error("Error al actualizar residuo en Supabase:", error);
        // Guardar localmente y agregar a la cola si hay error
        saveWasteLocally(waste, 'update');
      } else {
        console.log("Residuo actualizado correctamente en Supabase:", waste);
        // También guardar en localStorage para acceso rápido
        const wastes = getFromStorage<Waste[]>(WASTES_STORAGE_KEY, []);
        const existingIndex = wastes.findIndex(w => w.id === waste.id);
        
        if (existingIndex >= 0) {
          wastes[existingIndex] = waste;
        } else {
          wastes.push(waste);
        }
        
        saveToStorage(WASTES_STORAGE_KEY, wastes, { syncStatus: 'synced' });
      }
    } else {
      // Sin conexión, guardar localmente y agregar a la cola
      saveWasteLocally(waste, 'update');
    }
  } catch (error) {
    // En caso de error (por ejemplo, si Supabase no está disponible)
    console.error("Error en saveWaste, usando localStorage como respaldo:", error);
    saveWasteLocally(waste, 'update');
  }
};

/**
 * Delete waste by ID from Supabase and localStorage
 */
export const deleteWaste = async (id: string): Promise<void> => {
  // Siempre eliminar de localStorage primero para respuesta inmediata
  const wastes = getFromStorage<Waste[]>(WASTES_STORAGE_KEY, []);
  const filteredWastes = wastes.filter(waste => waste.id !== id);
  saveToStorage(WASTES_STORAGE_KEY, filteredWastes);
  
  try {
    const isOnline = dataSynchronizer.isDeviceOnline();
    
    if (isOnline) {
      // Intentar eliminar de Supabase
      const result = await safeTableAccess('wastes')
        .delete()
        .eq('id', id);
        
      const { error } = result;
      
      if (error) {
        console.error(`Error al eliminar residuo con ID ${id} de Supabase:`, error);
        // Agregar a la cola de sincronización
        syncQueue.addOperation('delete', 'waste', id);
      } else {
        console.log(`Residuo con ID ${id} eliminado correctamente de Supabase`);
      }
    } else {
      // Sin conexión, agregar a la cola de sincronización
      syncQueue.addOperation('delete', 'waste', id);
    }
  } catch (error) {
    // En caso de error, asegurar que se agregue a la cola
    console.error(`Error en deleteWaste para ${id}:`, error);
    syncQueue.addOperation('delete', 'waste', id);
  }
};

/**
 * Update waste status in Supabase and localStorage
 */
export const updateWasteStatus = async (id: string, status: WasteStatus): Promise<Waste | null> => {
  const waste = await getWasteById(id);
  
  if (!waste) {
    return null;
  }
  
  const updatedWaste = {
    ...waste,
    status
  };
  
  await saveWaste(updatedWaste);
  return updatedWaste;
};

/**
 * Commit to collect a waste in Supabase and localStorage
 */
export const commitToCollect = async (wasteId: string, recyclerId: string): Promise<Waste | null> => {
  const waste = await getWasteById(wasteId);
  
  if (!waste) {
    return null;
  }
  
  const updatedWaste: Waste = {
    ...waste,
    status: 'in_progress' as WasteStatus,
    pickupCommitment: {
      recyclerId,
      commitmentDate: new Date()
    }
  };
  
  await saveWaste(updatedWaste);
  return updatedWaste;
};
