
/**
 * Re-export all data services for backward compatibility
 */

// Re-export User service functions for backward compatibility
export {
  getAllUsers,
  getAllActiveUsers,
  getUserById,
  getActiveUserById,
  getUserByEmail, 
  getActiveUserByEmail,
  addUser,
  updateUser,
  deleteUser
} from './users';

// Re-export Waste service functions for backward compatibility
export {
  getAllWastes,
  getWasteById,
  getWastesByUserId,
  getWastesByType,
  getWastesByStatus,
  addWaste,
  commitToCollect
} from './wastes';

// Re-export constants for backward compatibility
export { wasteTypeImages } from './wastes/constants';
export { initialUsers as users } from './users/constants';
export { initialWastes as wastes } from './wastes/constants';
