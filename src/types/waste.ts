
export type WasteType = 
  | 'organic' 
  | 'paper' 
  | 'glass' 
  | 'plastic' 
  | 'metal' 
  | 'sanitary' 
  | 'dump' 
  | 'various';

export type WasteStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'collected' 
  | 'canceled';

export interface Waste {
  id: string;
  userId: string;
  type: WasteType;
  description: string;
  imageUrl?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  createdAt: Date;
  status: WasteStatus;
  collectionCommitment?: {
    recyclerId: string;
    commitmentDate: Date;
  };
}
