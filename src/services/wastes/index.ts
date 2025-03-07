
import { Waste, WasteType, WasteStatus } from "@/types";
import { WASTES_STORAGE_KEY, initialWastes } from "./constants";
import { getFromStorage, saveToStorage } from "../localStorage";

/**
 * Get all wastes from localStorage
 */
export const getWastes = (): Waste[] => {
  return getFromStorage<Waste[]>(WASTES_STORAGE_KEY, initialWastes);
};

// Alias para mantener compatibilidad con el código que usa la función anterior
export const getAllWastes = getWastes;

/**
 * Get wastes by type
 */
export const getWastesByType = (type: WasteType): Waste[] => {
  const wastes = getWastes();
  return wastes.filter(waste => waste.type === type);
};

/**
 * Get waste by ID
 */
export const getWasteById = (id: string): Waste | null => {
  const wastes = getWastes();
  return wastes.find(waste => waste.id === id) || null;
};

/**
 * Add new waste to localStorage
 */
export const addWaste = (waste: Waste): void => {
  const wastes = getWastes();
  wastes.push(waste);
  saveToStorage(WASTES_STORAGE_KEY, wastes);
};

/**
 * Save waste to localStorage
 */
export const saveWaste = (waste: Waste): void => {
  const wastes = getWastes();
  const existingIndex = wastes.findIndex(w => w.id === waste.id);
  
  if (existingIndex >= 0) {
    wastes[existingIndex] = waste;
  } else {
    wastes.push(waste);
  }
  
  saveToStorage(WASTES_STORAGE_KEY, wastes);
};

/**
 * Delete waste by ID
 */
export const deleteWaste = (id: string): void => {
  const wastes = getWastes();
  const filteredWastes = wastes.filter(waste => waste.id !== id);
  saveToStorage(WASTES_STORAGE_KEY, filteredWastes);
};

/**
 * Update waste status
 */
export const updateWasteStatus = (id: string, status: WasteStatus): Waste | null => {
  const waste = getWasteById(id);
  
  if (!waste) {
    return null;
  }
  
  const updatedWaste = {
    ...waste,
    status
  };
  
  saveWaste(updatedWaste);
  return updatedWaste;
};

/**
 * Commit to collect a waste
 */
export const commitToCollect = (wasteId: string, recyclerId: string): Waste | null => {
  const waste = getWasteById(wasteId);
  
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
  
  saveWaste(updatedWaste);
  return updatedWaste;
};
