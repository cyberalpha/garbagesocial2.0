
import { Waste, WasteType } from '@/types';

// Función temporal para simular la obtención de todos los residuos
export const getAllWastes = async (): Promise<Waste[]> => {
  console.log("Simulando obtención de residuos");
  return [];
};

// Función temporal para simular la obtención de residuos por tipo
export const getWastesByType = async (type: WasteType): Promise<Waste[]> => {
  console.log(`Simulando obtención de residuos de tipo ${type}`);
  return [];
};

// Función temporal para simular la adición de un nuevo residuo
export const addWaste = async (wasteData: Partial<Waste>): Promise<Waste> => {
  console.log("Simulando adición de residuo", wasteData);
  return {
    id: "temp-" + Date.now(),
    userId: wasteData.userId || "temp-user",
    type: wasteData.type || "various",
    description: wasteData.description || "",
    location: wasteData.location || { type: "Point", coordinates: [0, 0] },
    publicationDate: wasteData.publicationDate || new Date(),
    status: wasteData.status || "pending"
  };
};
