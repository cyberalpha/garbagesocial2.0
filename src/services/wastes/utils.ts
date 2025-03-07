
import { Waste, WasteType, WasteStatus } from "@/types";
import { Json } from "@/integrations/supabase/types";

/**
 * Transform data from Supabase to application format
 */
export const transformSupabaseWaste = (waste: any): Waste => {
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

/**
 * Transform data from application format to Supabase format
 */
export const transformWasteForSupabase = (waste: Waste) => {
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
