
import { supabase, testConnection } from '@/integrations/supabase/client';
import { safeTableAccess } from './supabaseMockUtils';

// Función para verificar la conexión a la base de datos
export const checkDatabaseConnection = async () => {
  try {
    console.log('Verificando conexión a Supabase...');
    return await testConnection();
  } catch (error: any) {
    console.error('Error al verificar conexión:', error);
    return { 
      success: false, 
      error: error?.message || 'Error inesperado al verificar la conexión',
      offlineMode: false
    };
  }
};

// Mantener compatibilidad con código existente
export const testSupabaseConnection = checkDatabaseConnection;

// Función para sincronizar perfiles de usuario con localStorage
export const syncProfilesWithLocalStorage = async () => {
  try {
    console.log('Sincronizando perfiles con localStorage...');
    // Use safe access to prevent errors on non-existent table
    const { data: profiles, error } = await safeTableAccess('profiles').select('*');
    
    if (error) {
      console.error('Error al obtener perfiles:', error);
      return;
    }
    
    if (profiles && profiles.length > 0) {
      // Guardar perfiles en localStorage con expiración de 7 días
      localStorage.setItem('offline_profiles', JSON.stringify({
        data: profiles,
        timestamp: Date.now(),
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
        version: '1.0'
      }));
      console.log(`${profiles.length} perfiles sincronizados con localStorage`);
    }
  } catch (error) {
    console.error('Error al sincronizar perfiles:', error);
  }
};

// Función para obtener perfiles desde localStorage en modo offline
export const getOfflineProfiles = () => {
  try {
    const storedProfiles = localStorage.getItem('offline_profiles');
    
    if (!storedProfiles) {
      console.log('No hay perfiles almacenados en localStorage');
      return [];
    }
    
    const parsedData = JSON.parse(storedProfiles);
    
    // Verificar si los datos han expirado
    if (parsedData.expiresAt && parsedData.expiresAt < Date.now()) {
      console.log('Los datos de perfiles han expirado');
      localStorage.removeItem('offline_profiles');
      return [];
    }
    
    console.log(`Recuperados ${parsedData.data.length} perfiles de localStorage`);
    return parsedData.data;
  } catch (error) {
    console.error('Error al recuperar perfiles de localStorage:', error);
    return [];
  }
};
