import { Waste, WasteType, WasteStatus } from "@/types";
import { WASTES_STORAGE_KEY, initialWastes } from "./constants";
import { getFromStorage, saveToStorage } from "../localStorage";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

// Función para transformar datos de Supabase al formato de la aplicación
const transformSupabaseWaste = (waste: any): Waste => {
  return {
    id: waste.id,
    userId: waste.user_id,
    type: waste.type as WasteType,
    description: waste.description,
    imageUrl: waste.image_url,
    location: waste.location || {
      type: 'Point',
      coordinates: [0, 0]
    },
    publicationDate: new Date(waste.publication_date),
    status: waste.status as WasteStatus,
    pickupCommitment: waste.pickup_commitment
  };
};

// Función para transformar datos de la aplicación al formato de Supabase
const transformWasteForSupabase = (waste: Waste) => {
  return {
    id: waste.id,
    user_id: waste.userId,
    type: waste.type,
    description: waste.description,
    image_url: waste.imageUrl,
    location: waste.location as unknown as Json,
    publication_date: waste.publicationDate instanceof Date ? waste.publicationDate.toISOString() : waste.publicationDate,
    status: waste.status,
    pickup_commitment: waste.pickupCommitment as unknown as Json
  };
};

/**
 * Get all wastes from Supabase or localStorage as fallback
 */
export const getWastes = async (): Promise<Waste[]> => {
  try {
    // Intentar obtener datos de Supabase
    const { data, error } = await supabase
      .from('wastes')
      .select('*');
    
    if (error) {
      console.error("Error al obtener residuos de Supabase:", error);
      throw error;
    }
    
    if (data && data.length > 0) {
      return data.map(transformSupabaseWaste);
    }
    
    // Si no hay datos en Supabase, usar localStorage como respaldo
    console.log("No hay datos en Supabase, usando localStorage como respaldo");
    return getFromStorage<Waste[]>(WASTES_STORAGE_KEY, initialWastes);
  } catch (error) {
    // En caso de error (por ejemplo, si Supabase no está disponible)
    console.error("Error en getWastes, usando localStorage:", error);
    return getFromStorage<Waste[]>(WASTES_STORAGE_KEY, initialWastes);
  }
};

// Función para obtener residuos (alias para mantener compatibilidad con código existente)
export const getAllWastes = getWastes;

/**
 * Get wastes by type
 */
export const getWastesByType = async (type: WasteType): Promise<Waste[]> => {
  try {
    // Intentar obtener datos de Supabase filtrados por tipo
    const { data, error } = await supabase
      .from('wastes')
      .select('*')
      .eq('type', type);
    
    if (error) {
      console.error(`Error al obtener residuos de tipo ${type} de Supabase:`, error);
      throw error;
    }
    
    if (data && data.length > 0) {
      return data.map(transformSupabaseWaste);
    }
    
    // Si no hay datos en Supabase, usar localStorage como respaldo
    console.log(`No hay datos en Supabase para el tipo ${type}, usando localStorage como respaldo`);
    const wastes = getFromStorage<Waste[]>(WASTES_STORAGE_KEY, initialWastes);
    return wastes.filter(waste => waste.type === type);
  } catch (error) {
    // En caso de error (por ejemplo, si Supabase no está disponible)
    console.error(`Error en getWastesByType para ${type}, usando localStorage:`, error);
    const wastes = getFromStorage<Waste[]>(WASTES_STORAGE_KEY, initialWastes);
    return wastes.filter(waste => waste.type === type);
  }
};

/**
 * Get waste by ID
 */
export const getWasteById = async (id: string): Promise<Waste | null> => {
  try {
    // Intentar obtener datos de Supabase
    const { data, error } = await supabase
      .from('wastes')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error(`Error al obtener residuo con ID ${id} de Supabase:`, error);
      throw error;
    }
    
    if (data) {
      return transformSupabaseWaste(data);
    }
    
    // Si no hay datos en Supabase, usar localStorage como respaldo
    console.log(`No hay datos en Supabase para el ID ${id}, usando localStorage como respaldo`);
    const wastes = getFromStorage<Waste[]>(WASTES_STORAGE_KEY, initialWastes);
    return wastes.find(waste => waste.id === id) || null;
  } catch (error) {
    // En caso de error (por ejemplo, si Supabase no está disponible)
    console.error(`Error en getWasteById para ${id}, usando localStorage:`, error);
    const wastes = getFromStorage<Waste[]>(WASTES_STORAGE_KEY, initialWastes);
    return wastes.find(waste => waste.id === id) || null;
  }
};

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
    const wastes = getFromStorage<Waste[]>(WASTES_STORAGE_KEY, initialWastes);
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
    const wastes = getFromStorage<Waste[]>(WASTES_STORAGE_KEY, initialWastes);
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
    const wastes = getFromStorage<Waste[]>(WASTES_STORAGE_KEY, initialWastes);
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
