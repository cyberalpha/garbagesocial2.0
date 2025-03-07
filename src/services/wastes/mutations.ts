
import { Waste, WasteStatus } from "@/types";
import { WASTES_STORAGE_KEY } from "./constants";
import { getFromStorage, saveToStorage } from "../localStorage";
import { supabase } from "@/integrations/supabase/client";
import { transformWasteForSupabase } from "./utils";
import { getWasteById } from "./fetchers";

/**
 * Add new waste to Supabase and localStorage as backup
 * Accepts partial waste and returns the complete waste object
 */
export const addWaste = async (wasteData: Partial<Waste>): Promise<Waste> => {
  // Generate a unique ID (simple implementation)
  const newId = `waste_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  // Create complete waste object with defaults for required fields
  const newWaste: Waste = {
    id: newId,
    userId: wasteData.userId || '',
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
  
  try {
    // Transformar para Supabase y guardar
    const supabaseData = transformWasteForSupabase(newWaste);
    
    // Intentar guardar en Supabase
    const { error } = await supabase
      .from('wastes')
      .insert(supabaseData);
    
    if (error) {
      console.error("Error al insertar residuo en Supabase:", error);
      throw error;
    }
    
    console.log("Residuo guardado correctamente en Supabase:", newWaste);
  } catch (error) {
    // En caso de error (por ejemplo, si Supabase no está disponible)
    console.error("Error en addWaste, usando localStorage como respaldo:", error);
    // Guardar en localStorage como respaldo
    const wastes = getFromStorage<Waste[]>(WASTES_STORAGE_KEY, []);
    wastes.push(newWaste);
    saveToStorage(WASTES_STORAGE_KEY, wastes);
  }
  
  return newWaste;
};

/**
 * Save waste to Supabase and localStorage as backup
 */
export const saveWaste = async (waste: Waste): Promise<void> => {
  try {
    // Transformar para Supabase
    const supabaseData = transformWasteForSupabase(waste);
    
    // Intentar guardar en Supabase
    const { error } = await supabase
      .from('wastes')
      .upsert(supabaseData);
    
    if (error) {
      console.error("Error al actualizar residuo en Supabase:", error);
      throw error;
    }
    
    console.log("Residuo actualizado correctamente en Supabase:", waste);
  } catch (error) {
    // En caso de error (por ejemplo, si Supabase no está disponible)
    console.error("Error en saveWaste, usando localStorage como respaldo:", error);
    // Guardar en localStorage como respaldo
    const wastes = getFromStorage<Waste[]>(WASTES_STORAGE_KEY, []);
    const existingIndex = wastes.findIndex(w => w.id === waste.id);
    
    if (existingIndex >= 0) {
      wastes[existingIndex] = waste;
    } else {
      wastes.push(waste);
    }
    
    saveToStorage(WASTES_STORAGE_KEY, wastes);
  }
};

/**
 * Delete waste by ID from Supabase and localStorage
 */
export const deleteWaste = async (id: string): Promise<void> => {
  try {
    // Intentar eliminar de Supabase
    const { error } = await supabase
      .from('wastes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error al eliminar residuo con ID ${id} de Supabase:`, error);
      throw error;
    }
    
    console.log(`Residuo con ID ${id} eliminado correctamente de Supabase`);
  } catch (error) {
    // En caso de error (por ejemplo, si Supabase no está disponible)
    console.error(`Error en deleteWaste para ${id}, usando localStorage:`, error);
  } finally {
    // Siempre eliminar de localStorage para mantener sincronización
    const wastes = getFromStorage<Waste[]>(WASTES_STORAGE_KEY, []);
    const filteredWastes = wastes.filter(waste => waste.id !== id);
    saveToStorage(WASTES_STORAGE_KEY, filteredWastes);
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
