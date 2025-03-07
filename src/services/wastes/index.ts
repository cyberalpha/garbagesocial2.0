
import { Waste } from "@/types";
import { WASTES_STORAGE_KEY, initialWastes } from "./constants";
import { getFromStorage, saveToStorage } from "../localStorage";

/**
 * Get all wastes from localStorage
 */
export const getWastes = (): Waste[] => {
  return getFromStorage<Waste[]>(WASTES_STORAGE_KEY, initialWastes);
};

/**
 * Get waste by ID
 */
export const getWasteById = (id: string): Waste | null => {
  const wastes = getWastes();
  return wastes.find(waste => waste.id === id) || null;
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
export const updateWasteStatus = (id: string, status: string): Waste | null => {
  const waste = getWasteById(id);
  
  if (!waste) {
    return null;
  }
  
  const updatedWaste = {
    ...waste,
    status: status as any
  };
  
  saveWaste(updatedWaste);
  return updatedWaste;
};
