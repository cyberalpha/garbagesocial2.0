
/**
 * Waste data service functions
 */
import { Waste, WasteType, WasteStatus } from "@/types";
import { WASTES_STORAGE_KEY, wasteTypeImages, initialWastes } from "./constants";
import { saveToStorage, getFromStorage } from "../localStorage";

// Initialize localWastes from localStorage or default to wastes array
const getInitialWastes = (): Waste[] => {
  try {
    const storedWastes = localStorage.getItem(WASTES_STORAGE_KEY);
    if (storedWastes) {
      const parsedWastes = JSON.parse(storedWastes);
      // Convertimos las fechas de string a Date
      if (Array.isArray(parsedWastes)) {
        return parsedWastes.map(waste => ({
          ...waste,
          publicationDate: new Date(waste.publicationDate),
          pickupCommitment: waste.pickupCommitment ? {
            ...waste.pickupCommitment,
            commitmentDate: new Date(waste.pickupCommitment.commitmentDate)
          } : undefined
        }));
      }
    }
  } catch (error) {
    console.error('Error loading wastes from localStorage:', error);
  }
  return [...initialWastes];
};

// Local waste data store
let localWastes = getInitialWastes();

// Function to save wastes to localStorage
const saveWastesToStorage = () => {
  saveToStorage(WASTES_STORAGE_KEY, localWastes);
};

// Get all wastes
export const getAllWastes = (): Waste[] => {
  return localWastes;
};

// Get waste by id
export const getWasteById = (id: string): Waste | undefined => {
  return localWastes.find(waste => waste.id === id);
};

// Get wastes by user id
export const getWastesByUserId = (userId: string): Waste[] => {
  return localWastes.filter(waste => waste.userId === userId);
};

// Get wastes by type
export const getWastesByType = (type: WasteType): Waste[] => {
  return localWastes.filter(waste => waste.type === type);
};

// Get wastes by status
export const getWastesByStatus = (status: WasteStatus): Waste[] => {
  return localWastes.filter(waste => waste.status === status);
};

// Add new waste
export const addWaste = (waste: Partial<Waste>): Waste => {
  const newId = Date.now().toString();
  const newWaste: Waste = {
    id: newId,
    userId: waste.userId || '',
    type: waste.type || 'various',
    description: waste.description || '',
    imageUrl: waste.imageUrl || wasteTypeImages[waste.type || 'various'],
    location: waste.location || {
      type: "Point",
      coordinates: [0, 0]
    },
    publicationDate: waste.publicationDate || new Date(),
    status: waste.status || 'pending',
    pickupCommitment: waste.pickupCommitment
  };
  
  localWastes.push(newWaste);
  saveWastesToStorage(); // Guardamos en localStorage
  return newWaste;
};

// Add the commitToCollect function
export const commitToCollect = (wasteId: string, recyclerId: string): Waste => {
  const wasteIndex = localWastes.findIndex(waste => waste.id === wasteId);
  
  if (wasteIndex === -1) {
    throw new Error('Waste not found');
  }
  
  // Update the waste status and add pickup commitment
  localWastes[wasteIndex] = {
    ...localWastes[wasteIndex],
    status: 'in_progress',
    pickupCommitment: {
      recyclerId: recyclerId,
      commitmentDate: new Date()
    }
  };
  
  saveWastesToStorage(); // Guardamos en localStorage
  return localWastes[wasteIndex];
};
