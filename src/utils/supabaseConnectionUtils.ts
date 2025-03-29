
import { supabase, offlineMode } from '@/integrations/supabase/client';
import { safeTableAccess } from './supabaseMockUtils';

/**
 * Verificar la conexión a la base de datos Supabase
 */
export const checkDatabaseConnection = async (): Promise<{
  success: boolean;
  error?: any;
  offlineMode: boolean;
  latency?: number;
  supabaseVersion?: string;
}> => {
  try {
    // Si estamos en modo offline, no intentamos conexión
    if (offlineMode()) {
      console.log('En modo offline, no se verifica conexión a Supabase');
      return {
        success: false,
        error: 'Modo offline activado',
        offlineMode: true,
        latency: 0
      };
    }
    
    const startTime = Date.now();
    
    // Mejorar la robustez de la prueba de conexión con reintentos
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: any = null;
    
    while (attempts < maxAttempts) {
      try {
        // Probar conexión con una consulta simple
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        if (!error) {
          const endTime = Date.now();
          const latency = endTime - startTime;
          
          console.log('Conexión a Supabase exitosa');
          return {
            success: true,
            offlineMode: false,
            latency,
            supabaseVersion: '2.x'
          };
        }
        
        lastError = error;
        attempts++;
        
        // Esperar antes de reintentar (exponential backoff)
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      } catch (err) {
        lastError = err;
        attempts++;
        
        // Esperar antes de reintentar
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
    }
    
    // Si llegamos aquí, todos los intentos fallaron
    console.error('Error verificando conexión a Supabase después de múltiples intentos:', lastError);
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    return {
      success: false,
      error: lastError,
      offlineMode: false,
      latency
    };
  } catch (error) {
    console.error('Error inesperado al verificar conexión a Supabase:', error);
    return {
      success: false,
      error,
      offlineMode: false
    };
  }
};

// Mantener compatibilidad con código existente
export const testConnection = checkDatabaseConnection;

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
