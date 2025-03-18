
// Archivo temporal de tipos para mantener compatibilidad
// después de eliminar los módulos de Perfil y Residuo

// Este archivo será reemplazado cuando se reconstruyan los módulos
export interface MapOptions {
  center: [number, number]; // [longitude, latitude]
  zoom: number;
}

// Definiciones temporales para mantener compatibilidad
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

export type UserRole = 
  | 'publisher' 
  | 'recycler';

export interface User {
  id: string;
  name: string;
  email: string;
  isOrganization: boolean;
  averageRating: number;
  location?: GeoLocation;
  profileImage?: string;
  emailVerified?: boolean;
  active?: boolean;
  password?: string; // Solo para mock users
}

export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface PickupCommitment {
  recyclerId: string;
  commitmentDate: Date;
}

export interface Waste {
  id: string;
  userId: string;
  type: WasteType;
  description: string;
  imageUrl?: string;
  location: GeoLocation;
  publicationDate: Date;
  status: WasteStatus;
  pickupCommitment?: PickupCommitment;
}

export interface Rating {
  id: string;
  wasteId: string;
  publisherId: string;
  recyclerId: string;
  publisherRating?: number;
  recyclerRating?: number;
}

// Para compatibilidad con mockUsers.ts
export interface MockUser extends User {
  password: string;
}

// Constantes para servicios
export const WASTES_STORAGE_KEY = 'local_wastes';
