
import { User } from '@/types';

// Tipo para usuario mock con contraseña
export interface MockUser extends User {
  password: string;
}

// Lista de usuarios mock para autenticación offline
let mockUsers: MockUser[] = [
  {
    id: 'mock-user-1',
    name: 'Usuario Demo',
    email: 'demo@example.com',
    password: 'password',
    isOrganization: false,
    profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=demo@example.com',
    averageRating: 4.5,
    emailVerified: true,
    active: true
  },
  {
    id: 'mock-user-2',
    name: 'Organización Demo',
    email: 'org@example.com',
    password: 'password',
    isOrganization: true,
    profileImage: 'https://api.dicebear.com/7.x/initials/svg?seed=org@example.com',
    averageRating: 4.8,
    emailVerified: true,
    active: true
  }
];

// Inicializar usuarios mock desde localStorage
const initMockUsers = () => {
  try {
    const storedUsers = localStorage.getItem('mock_users');
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
        mockUsers = parsedUsers;
      }
    }
  } catch (error) {
    console.error('Error al cargar usuarios mock:', error);
  }
};

// Guardar usuarios mock en localStorage
const saveMockUsers = () => {
  try {
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));
  } catch (error) {
    console.error('Error al guardar usuarios mock:', error);
  }
};

// Añadir un nuevo usuario mock
export const createMockUser = (user: User & { password?: string }) => {
  // Verificar si ya existe
  const existingIndex = mockUsers.findIndex(u => u.email === user.email);
  
  if (existingIndex >= 0) {
    // Actualizar usuario existente
    mockUsers[existingIndex] = {
      ...mockUsers[existingIndex],
      ...user,
      password: user.password || mockUsers[existingIndex].password
    };
  } else {
    // Añadir nuevo usuario
    mockUsers.push({
      ...user,
      password: user.password || 'password'
    } as MockUser);
  }
  
  saveMockUsers();
};

// Eliminar un usuario mock
export const removeMockUser = (id: string) => {
  mockUsers = mockUsers.filter(user => user.id !== id);
  saveMockUsers();
};

// Actualizar un usuario mock
export const updateMockUser = (id: string, userData: Partial<User>) => {
  const index = mockUsers.findIndex(user => user.id === id);
  
  if (index >= 0) {
    mockUsers[index] = {
      ...mockUsers[index],
      ...userData
    };
    saveMockUsers();
    return mockUsers[index];
  }
  
  return null;
};

// Obtener un usuario mock por ID
export const getMockUserById = (id: string): User | null => {
  const user = mockUsers.find(user => user.id === id);
  
  if (user) {
    // Devolver sin contraseña
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  return null;
};

// Obtener todos los usuarios mock
export const getAllMockUsers = (): User[] => {
  return mockUsers.map(({ password, ...user }) => user);
};

// Inicializar usuarios mock al cargar el módulo
initMockUsers();

// Exportar la lista de usuarios mock
export { mockUsers };
