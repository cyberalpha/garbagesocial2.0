
// Tipos de residuos disponibles
export type WasteType = 
  | 'organic' 
  | 'paper' 
  | 'glass' 
  | 'plastic' 
  | 'metal' 
  | 'sanitary' 
  | 'dump' 
  | 'various';

// Estados posibles de una publicación de residuo
export type WasteStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'collected' 
  | 'canceled';

// Roles de usuario - lo mantenemos para referencias existentes en otros archivos
export type UserRole = 
  | 'publisher' 
  | 'recycler';

// Estructura de un usuario
export interface User {
  id: string;
  name: string;
  email: string;
  isOrganization: boolean;
  averageRating: number;
  location?: GeoLocation;
  profileImage?: string;
  emailVerified?: boolean;
}

// Estructura para localización geográfica
export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// Estructura para un compromiso de retiro
export interface PickupCommitment {
  recyclerId: string;
  commitmentDate: Date;
}

// Estructura de un residuo publicado
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

// Estructura para una calificación
export interface Rating {
  id: string;
  wasteId: string;
  publisherId: string;
  recyclerId: string;
  publisherRating?: number; // 1-5 estrellas
  recyclerRating?: number; // 1-5 estrellas
}

// Opciones para el mapa
export interface MapOptions {
  center: [number, number]; // [longitude, latitude]
  zoom: number;
}
