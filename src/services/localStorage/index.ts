
/**
 * Utility functions for handling localStorage operations with versioning and expiration
 */

// Key para la versión del schema local
export const SCHEMA_VERSION_KEY = 'app_schema_version';
export const CURRENT_SCHEMA_VERSION = '1.0';

// Tiempo de expiración por defecto: 7 días (en milisegundos)
const DEFAULT_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

// Verificar y actualizar la versión del schema
export const initLocalStorage = (): void => {
  try {
    const storedVersion = localStorage.getItem(SCHEMA_VERSION_KEY);
    
    if (!storedVersion || storedVersion !== CURRENT_SCHEMA_VERSION) {
      console.log(`Actualizando schema de localStorage de ${storedVersion || 'ninguno'} a ${CURRENT_SCHEMA_VERSION}`);
      
      // Aquí podríamos implementar migraciones si hay cambios importantes en el schema
      // Por ahora solo actualizamos la versión
      localStorage.setItem(SCHEMA_VERSION_KEY, CURRENT_SCHEMA_VERSION);
    }
  } catch (error) {
    console.error('Error al inicializar localStorage:', error);
  }
};

// Estructura para los datos en localStorage con metadatos
interface StorageItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number | null;
  version: string;
  syncStatus?: 'synced' | 'pending' | 'conflict';
}

// Save data to localStorage with expiration
export const saveToStorage = <T>(
  key: string, 
  data: T, 
  options?: { 
    expiration?: number | null;
    syncStatus?: 'synced' | 'pending' | 'conflict';
  }
): void => {
  try {
    const now = Date.now();
    const expiresAt = options?.expiration === null ? null : now + (options?.expiration || DEFAULT_EXPIRATION);
    
    const storageItem: StorageItem<T> = {
      data,
      timestamp: now,
      expiresAt,
      version: CURRENT_SCHEMA_VERSION,
      syncStatus: options?.syncStatus || 'synced'
    };
    
    localStorage.setItem(key, JSON.stringify(storageItem));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Get data from localStorage
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const storedItem = localStorage.getItem(key);
    
    if (!storedItem) {
      return defaultValue;
    }
    
    const parsedItem = JSON.parse(storedItem) as StorageItem<T> | T;
    
    // Verificar si es un item con metadatos o datos antiguos
    if (parsedItem && typeof parsedItem === 'object' && 'data' in parsedItem && 'timestamp' in parsedItem) {
      // Es un item con metadatos
      const storageItem = parsedItem as StorageItem<T>;
      
      // Verificar expiración
      if (storageItem.expiresAt !== null && storageItem.expiresAt < Date.now()) {
        console.log(`Item ${key} ha expirado, eliminando...`);
        localStorage.removeItem(key);
        return defaultValue;
      }
      
      return storageItem.data;
    } else {
      // Es un formato antiguo, convertirlo
      saveToStorage(key, parsedItem as T);
      return parsedItem as T;
    }
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Obtener metadatos del item
export const getStorageItemMeta = <T>(key: string): Omit<StorageItem<T>, 'data'> | null => {
  try {
    const storedItem = localStorage.getItem(key);
    
    if (!storedItem) {
      return null;
    }
    
    const parsedItem = JSON.parse(storedItem) as StorageItem<T> | T;
    
    if (parsedItem && typeof parsedItem === 'object' && 'timestamp' in parsedItem) {
      // Extraer todo menos los datos
      const { data, ...metadata } = parsedItem as StorageItem<T>;
      return metadata;
    }
    
    return null;
  } catch (error) {
    console.error(`Error loading metadata for ${key} from localStorage:`, error);
    return null;
  }
};

// Marcar un item como pendiente de sincronización
export const markItemAsPending = <T>(key: string): void => {
  try {
    const storedItem = localStorage.getItem(key);
    
    if (storedItem) {
      const parsedItem = JSON.parse(storedItem) as StorageItem<T>;
      
      if (parsedItem && 'data' in parsedItem) {
        parsedItem.syncStatus = 'pending';
        localStorage.setItem(key, JSON.stringify(parsedItem));
      }
    }
  } catch (error) {
    console.error(`Error marking ${key} as pending:`, error);
  }
};

// Marcar un item como sincronizado
export const markItemAsSynced = <T>(key: string): void => {
  try {
    const storedItem = localStorage.getItem(key);
    
    if (storedItem) {
      const parsedItem = JSON.parse(storedItem) as StorageItem<T>;
      
      if (parsedItem && 'data' in parsedItem) {
        parsedItem.syncStatus = 'synced';
        localStorage.setItem(key, JSON.stringify(parsedItem));
      }
    }
  } catch (error) {
    console.error(`Error marking ${key} as synced:`, error);
  }
};

// Eliminar un item expirado
export const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
};

// Limpiar todos los items expirados
export const clearExpiredItems = (): void => {
  try {
    const now = Date.now();
    const keys = Object.keys(localStorage);
    
    for (const key of keys) {
      // Ignorar keys de sistema
      if (key === SCHEMA_VERSION_KEY) continue;
      
      const storedItem = localStorage.getItem(key);
      if (storedItem) {
        try {
          const parsedItem = JSON.parse(storedItem);
          
          if (parsedItem && 'expiresAt' in parsedItem && parsedItem.expiresAt !== null && parsedItem.expiresAt < now) {
            localStorage.removeItem(key);
            console.log(`Item expirado eliminado: ${key}`);
          }
        } catch (e) {
          // Si no se puede parsear, ignorar
        }
      }
    }
  } catch (error) {
    console.error('Error clearing expired items:', error);
  }
};
