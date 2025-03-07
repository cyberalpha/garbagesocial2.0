
/**
 * Constants used for user data management
 */
import { User } from "@/types";

// Storage key for users
export const USERS_STORAGE_KEY = 'garbage_social_users';

// Initial user data
export const initialUsers: User[] = [
  {
    id: "2",
    name: "María López",
    email: "maria@example.com",
    isOrganization: false,
    averageRating: 4.8,
    profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
    emailVerified: true,
    active: true,
    location: {
      type: "Point",
      coordinates: [-58.3716, -34.6137]
    }
  },
  {
    id: "3",
    name: "EcoRecycle",
    email: "info@ecorecycle.com",
    isOrganization: true,
    averageRating: 4.7,
    profileImage: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=200&auto=format&fit=crop",
    emailVerified: true,
    active: true,
    location: {
      type: "Point",
      coordinates: [-58.3916, -34.5937]
    }
  }
];
