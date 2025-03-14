
export type UserRole = 'publisher' | 'recycler';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  isOrganization: boolean;
  averageRating: number;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  profileImage?: string;
  emailVerified?: boolean;
  active?: boolean;
}

export interface Rating {
  id: string;
  wasteId: string;
  publisherId: string;
  recyclerId: string;
  publisherRating: number; // 1-5 stars
  recyclerRating: number; // 1-5 stars
  createdAt: Date;
}
