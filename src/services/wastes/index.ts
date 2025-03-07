
// Re-export all waste service functionality from module files
import { transformSupabaseWaste, transformWasteForSupabase } from './utils';
import { getWastes, getAllWastes, getWastesByType, getWasteById } from './fetchers';
import { addWaste, saveWaste, deleteWaste, updateWasteStatus, commitToCollect } from './mutations';

// Export all functions to maintain the same API
export {
  // Transformation utilities
  transformSupabaseWaste,
  transformWasteForSupabase,
  
  // Fetching functions
  getWastes,
  getAllWastes,
  getWastesByType,
  getWasteById,
  
  // Mutation functions
  addWaste,
  saveWaste,
  deleteWaste,
  updateWasteStatus,
  commitToCollect
};
