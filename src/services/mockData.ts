
// Este archivo re-exporta funciones de los nuevos archivos de servicios
// para mantener compatibilidad con el código existente
import { getWastes, getAllWastes, getWasteById, getWastesByType, saveWaste, addWaste, deleteWaste, updateWasteStatus, commitToCollect } from './wastes';
import { getUsers, getUserById, saveUser, deleteUser, getWastesByUserId } from './users';

// Re-exportar todas las funciones
export {
  getWastes,
  getAllWastes,
  getWasteById,
  getWastesByType,
  saveWaste,
  addWaste,
  deleteWaste,
  updateWasteStatus,
  commitToCollect,
  getUsers,
  getUserById,
  saveUser,
  deleteUser,
  getWastesByUserId
};

// Estas exportaciones están en desuso y eventualmente se eliminarán
export const getAllUsers = getUsers;
export const getUserByEmail = (email: string) => {
  const users = getUsers();
  return users.find(user => user.email === email) || null;
};
export const saveUserData = saveUser;
export const updateUserData = saveUser;
