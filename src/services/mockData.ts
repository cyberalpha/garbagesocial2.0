
// Re-export from the new modules for backward compatibility
import { Waste, User } from '@/types';
import { saveToStorage } from './localStorage';

// Re-export user functions from users module
export { 
  getUsers,
  getUserById,
  getWastesByUserId,
  saveUser,
  deleteUser
} from './users';

// Re-export waste functions from wastes module
export {
  getWastes,
  getWasteById,
  saveWaste,
  deleteWaste,
  updateWasteStatus
} from './wastes';

// Export function names that were in the original mockData.ts
// but map them to the new implementations for backward compatibility
export const getAllUsers = getUsers;
export const getAllActiveUsers = getUsers; // Filter for active users if needed
export const getActiveUserById = getUserById; // Filter for active user if needed
export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(user => user.email === email) || null;
};
export const getActiveUserByEmail = getUserByEmail; // Filter for active user if needed
export const addUser = saveUser;
export const updateUser = saveUser;
