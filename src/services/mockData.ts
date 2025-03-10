
import { User } from '@/types';
import { getUsers } from './users';

export const findUserById = async (id: string): Promise<User | null> => {
  try {
    const users = await getUsers();
    return users.find(user => user.id === id) || null;
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
};
