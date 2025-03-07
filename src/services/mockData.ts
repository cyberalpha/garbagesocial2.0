
import { User, Waste, WasteType, WasteStatus, UserRole } from "@/types";

// Mock users data
export const users: User[] = [
  {
    id: "1",
    name: "Juan Pérez",
    email: "juan@example.com",
    role: "publisher",
    isOrganization: false,
    averageRating: 4.5,
    profileImage: "https://randomuser.me/api/portraits/men/1.jpg", // Corregido: usando profileImage en lugar de profileImageUrl
    location: {
      type: "Point",
      coordinates: [-58.3816, -34.6037]
    }
  },
  {
    id: "2",
    name: "María López",
    email: "maria@example.com",
    role: "recycler",
    isOrganization: false,
    averageRating: 4.8,
    profileImage: "https://randomuser.me/api/portraits/women/2.jpg", // Corregido: usando profileImage en lugar de profileImageUrl
    location: {
      type: "Point",
      coordinates: [-58.3716, -34.6137]
    }
  },
  {
    id: "3",
    name: "EcoRecycle",
    email: "info@ecorecycle.com",
    role: "recycler",
    isOrganization: true,
    averageRating: 4.7,
    profileImage: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=200&auto=format&fit=crop", // Corregido: usando profileImage en lugar de profileImageUrl
    location: {
      type: "Point",
      coordinates: [-58.3916, -34.5937]
    }
  }
];

// Images for each waste type
const wasteTypeImages: Record<WasteType, string> = {
  organic: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=300&auto=format&fit=crop",
  paper: "https://images.unsplash.com/photo-1589634749000-1551f5ece54f?q=80&w=300&auto=format&fit=crop",
  glass: "https://images.unsplash.com/photo-1604187354137-20f569033f81?q=80&w=300&auto=format&fit=crop",
  plastic: "https://images.unsplash.com/photo-1605600659873-d808a13e4e2c?q=80&w=300&auto=format&fit=crop",
  metal: "https://images.unsplash.com/photo-1605600659896-77944fca3f3c?q=80&w=300&auto=format&fit=crop",
  sanitary: "https://images.unsplash.com/photo-1583947581924-860bda6a26df?q=80&w=300&auto=format&fit=crop",
  dump: "https://images.unsplash.com/photo-1578899952107-9c98894eeae5?q=80&w=300&auto=format&fit=crop",
  various: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=300&auto=format&fit=crop"
};

// Mock waste data
export const wastes: Waste[] = [
  {
    id: "1",
    userId: "1",
    type: "plastic",
    description: "Botellas de plástico para reciclar",
    imageUrl: wasteTypeImages.plastic,
    location: {
      type: "Point",
      coordinates: [-58.3816, -34.6037]
    },
    publicationDate: new Date("2024-06-10T10:00:00Z"), // Corregido: usando publicationDate en lugar de createdAt
    status: "pending"
  },
  {
    id: "2",
    userId: "1",
    type: "paper",
    description: "Cajas de cartón y periódicos",
    imageUrl: wasteTypeImages.paper,
    location: {
      type: "Point",
      coordinates: [-58.3788, -34.6012]
    },
    publicationDate: new Date("2024-06-09T15:30:00Z"), // Corregido: usando publicationDate en lugar de createdAt
    status: "in_progress",
    pickupCommitment: { // Asumiendo que este es el nombre correcto basado en el tipo
      recyclerId: "2",
      commitmentDate: new Date("2024-06-09T16:30:00Z")
    }
  },
  {
    id: "3",
    userId: "2",
    type: "glass",
    description: "Botellas de vidrio para reciclar",
    imageUrl: wasteTypeImages.glass,
    location: {
      type: "Point",
      coordinates: [-58.3850, -34.6050]
    },
    publicationDate: new Date("2024-06-08T09:15:00Z"), // Corregido: usando publicationDate en lugar de createdAt
    status: "collected"
  },
  {
    id: "4",
    userId: "3",
    type: "organic",
    description: "Restos de poda y jardinería",
    imageUrl: wasteTypeImages.organic,
    location: {
      type: "Point",
      coordinates: [-58.3900, -34.6100]
    },
    publicationDate: new Date("2024-06-07T14:45:00Z"), // Corregido: usando publicationDate en lugar de createdAt
    status: "pending"
  },
  {
    id: "5",
    userId: "1",
    type: "metal",
    description: "Latas de aluminio",
    imageUrl: wasteTypeImages.metal,
    location: {
      type: "Point",
      coordinates: [-58.3950, -34.6150]
    },
    publicationDate: new Date("2024-06-06T11:20:00Z"), // Corregido: usando publicationDate en lugar de createdAt
    status: "pending"
  }
];

// Get all wastes
export const getAllWastes = (): Waste[] => {
  return wastes;
};

// Get waste by id
export const getWasteById = (id: string): Waste | undefined => {
  return wastes.find(waste => waste.id === id);
};

// Get wastes by user id
export const getWastesByUserId = (userId: string): Waste[] => {
  return wastes.filter(waste => waste.userId === userId);
};

// Get wastes by type
export const getWastesByType = (type: WasteType): Waste[] => {
  return wastes.filter(waste => waste.type === type);
};

// Get wastes by status
export const getWastesByStatus = (status: WasteStatus): Waste[] => {
  return wastes.filter(waste => waste.status === status);
};

// Get all users
export const getAllUsers = (): User[] => {
  return users;
};

// Get user by id
export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

// Get current user (mock)
export const getCurrentUser = (): User => {
  return users[0]; // Return first user as current user for demo
};
