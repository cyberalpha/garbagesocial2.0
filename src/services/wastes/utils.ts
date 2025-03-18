
import { Waste } from '@/types';

// Función para transformar datos de residuos desde Supabase al formato de la aplicación
export const transformSupabaseWaste = (wasteData: any): Waste => {
  return {
    id: wasteData.id,
    userId: wasteData.user_id,
    type: wasteData.type || 'various',
    description: wasteData.description || '',
    imageUrl: wasteData.image_url,
    location: wasteData.location || { type: 'Point', coordinates: [0, 0] },
    publicationDate: new Date(wasteData.created_at),
    status: wasteData.status || 'pending',
    pickupCommitment: wasteData.pickup_recycler_id ? {
      recyclerId: wasteData.pickup_recycler_id,
      commitmentDate: new Date(wasteData.pickup_commitment_date)
    } : undefined
  };
};

// Función para transformar datos del formato de la aplicación a Supabase
export const transformWasteToSupabase = (waste: Waste): any => {
  return {
    id: waste.id,
    user_id: waste.userId,
    type: waste.type,
    description: waste.description,
    image_url: waste.imageUrl,
    location: waste.location,
    status: waste.status,
    pickup_recycler_id: waste.pickupCommitment?.recyclerId,
    pickup_commitment_date: waste.pickupCommitment?.commitmentDate
  };
};
