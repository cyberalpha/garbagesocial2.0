
import { Waste, WasteType } from "@/types";
import { WASTES_STORAGE_KEY, initialWastes } from "./constants";
import { getFromStorage } from "../localStorage";
import { supabase, offlineMode } from "@/integrations/supabase/client";
import { transformSupabaseWaste } from "./utils";
import { safeTableAccess } from "@/utils/supabaseMockUtils";

/**
 * Get all wastes from Supabase or localStorage as fallback
 */
export const getWastes = async (): Promise<Waste[]> => {
  // En modo offline, siempre usamos localStorage
  if (offlineMode()) {
    console.log("Modo offline activado, usando datos locales");
    return getFromStorage<Waste[]>(WASTES_STORAGE_KEY, initialWastes);
  }
  
  try {
    // Intentar obtener datos de Supabase usando safe access
    const { data, error } = await safeTableAccess('wastes').select('*');
    
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

/**
 * Function alias to maintain compatibility with existing code
 */
export const getAllWastes = getWastes;

/**
 * Get wastes by type
 */
export const getWastesByType = async (type: WasteType): Promise<Waste[]> => {
  // En modo offline, siempre usamos localStorage
  if (offlineMode()) {
    console.log(`Modo offline activado, usando datos locales para tipo ${type}`);
    const wastes = getFromStorage<Waste[]>(WASTES_STORAGE_KEY, initialWastes);
    return wastes.filter(waste => waste.type === type);
  }
  
  try {
    // Intentar obtener datos de Supabase filtrados por tipo
    const { data, error } = await safeTableAccess('wastes')
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
  // En modo offline, siempre usamos localStorage
  if (offlineMode()) {
    console.log(`Modo offline activado, usando datos locales para ID ${id}`);
    const wastes = getFromStorage<Waste[]>(WASTES_STORAGE_KEY, initialWastes);
    return wastes.find(waste => waste.id === id) || null;
  }
  
  try {
    // Intentar obtener datos de Supabase
    const result = await safeTableAccess('wastes')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    const { data, error } = result;
    
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
