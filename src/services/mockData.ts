
import { User, Waste, WasteType, WasteStatus } from "@/types";

// Mock users data
export const users: User[] = [
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

// For simplicity we'll maintain a local "database" of users
// Add persistence by checking localStorage first
const USERS_STORAGE_KEY = 'garbage_social_users';

// Initialize localUsers from localStorage or default to users array
const getInitialUsers = (): User[] => {
  try {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      return Array.isArray(parsedUsers) ? parsedUsers : [...users];
    }
  } catch (error) {
    console.error('Error loading users from localStorage:', error);
  }
  return [...users];
};

let localUsers = getInitialUsers();

// Function to save users to localStorage
const saveUsersToStorage = () => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(localUsers));
  } catch (error) {
    console.error('Error saving users to localStorage:', error);
  }
};

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
  // Modificamos los wastes para asignarlos a usuarios existentes
  {
    id: "2",
    userId: "2",  // Ahora pertenece a María López
    type: "paper",
    description: "Cajas de cartón y periódicos",
    imageUrl: wasteTypeImages.paper,
    location: {
      type: "Point",
      coordinates: [-58.3788, -34.6012]
    },
    publicationDate: new Date("2024-06-09T15:30:00Z"),
    status: "in_progress",
    pickupCommitment: {
      recyclerId: "3",  // Ahora EcoRecycle
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
    publicationDate: new Date("2024-06-08T09:15:00Z"),
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
    publicationDate: new Date("2024-06-07T14:45:00Z"),
    status: "pending"
  },
  {
    id: "5",
    userId: "2",
    type: "metal",
    description: "Latas de aluminio",
    imageUrl: wasteTypeImages.metal,
    location: {
      type: "Point",
      coordinates: [-58.3950, -34.6150]
    },
    publicationDate: new Date("2024-06-06T11:20:00Z"),
    status: "pending"
  }
];

// For simplicity we'll maintain a local "database" of wastes
let localWastes = [...wastes];

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

// Get all users
export const getAllUsers = (): User[] => {
  return localUsers;
};

// Get all active users
export const getAllActiveUsers = (): User[] => {
  return localUsers.filter(user => user.active !== false);
};

// Get user by id
export const getUserById = (id: string): User | undefined => {
  console.log('Looking for user with ID:', id);
  console.log('Available users:', localUsers);
  const user = localUsers.find(user => user.id === id);
  console.log('Found user:', user);
  return user;
};

// Get active user by id
export const getActiveUserById = (id: string): User | undefined => {
  return localUsers.find(user => user.id === id && user.active !== false);
};

// Get user by email
export const getUserByEmail = (email: string): User | undefined => {
  return localUsers.find(user => user.email === email);
};

// Get active user by email
export const getActiveUserByEmail = (email: string): User | undefined => {
  return localUsers.find(user => user.email === email && user.active !== false);
};

// Add a new user
export const addUser = (user: User): User => {
  console.log('Adding user:', user);
  
  // Check if user with the same email exists but is deactivated
  const existingUserIndex = localUsers.findIndex(u => u.email === user.email);
  
  if (existingUserIndex !== -1 && localUsers[existingUserIndex].active === false) {
    // Reactivate and update existing user
    localUsers[existingUserIndex] = { 
      ...localUsers[existingUserIndex], 
      ...user, 
      active: true 
    };
    console.log('Reactivated user:', localUsers[existingUserIndex]);
    saveUsersToStorage(); // Save to localStorage
    return localUsers[existingUserIndex];
  }
  
  // Add as new user with active status
  const newUser = { ...user, active: true };
  localUsers.push(newUser);
  console.log('Added new user:', newUser);
  console.log('Updated users list:', localUsers);
  saveUsersToStorage(); // Save to localStorage
  return newUser;
};

// Update a user
export const updateUser = (userId: string, userData: Partial<User>): User | null => {
  const index = localUsers.findIndex(user => user.id === userId);
  if (index === -1) return null;
  
  localUsers[index] = { ...localUsers[index], ...userData };
  saveUsersToStorage(); // Save to localStorage
  return localUsers[index];
};

// Deactivate a user (soft delete)
export const deleteUser = (userId: string): boolean => {
  const index = localUsers.findIndex(user => user.id === userId);
  
  if (index === -1) return false;
  
  // Mark user as inactive instead of removing
  localUsers[index] = { ...localUsers[index], active: false };
  saveUsersToStorage(); // Save to localStorage
  return true;
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
  
  return localWastes[wasteIndex];
};
