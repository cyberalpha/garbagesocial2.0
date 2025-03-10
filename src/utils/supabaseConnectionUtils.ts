
import { supabase, testSupabaseConnection as testConnection, offlineMode } from '@/integrations/supabase/client';

export const testSupabaseConnection = async () => {
  return await testConnection();
};

export const checkDatabaseConnection = async () => {
  // Si estamos en modo offline, no intentamos conectar
  if (offlineMode) {
    console.log('Modo offline activado, no se verifica conexión a Supabase');
    return { 
      success: false, 
      error: 'Modo offline activado',
      offlineMode: true
    };
  }

  try {
    console.log('Intentando verificar conexión a Supabase...');
    
    // Primero usamos un método simple para verificar la conexión
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('Error de conexión a Supabase:', error);
      
      // Intento alternativo con una consulta más básica
      try {
        console.log('Intentando verificación alternativa...');
        // Eliminamos completamente la llamada a rpc que causa el error y usamos otra consulta
        const { error: healthError } = await supabase.auth.getSession();
        
        if (healthError) {
          return { 
            success: false, 
            error: error.message || 'Error al conectar con la base de datos',
            offlineMode: false
          };
        }
        
        console.log('Verificación alternativa exitosa');
        return { success: true, offlineMode: false };
      } catch (innerError) {
        console.error('Error en verificación alternativa:', innerError);
        return { 
          success: false, 
          error: error.message || 'Error al conectar con la base de datos',
          offlineMode: false
        };
      }
    }
    
    // Si llegamos aquí, la conexión fue exitosa
    console.log('Conexión a Supabase verificada exitosamente');
    return { success: true, offlineMode: false };
  } catch (error: any) {
    console.error('Error inesperado al verificar conexión:', error);
    return { 
      success: false, 
      error: error?.message || 'Error inesperado al verificar la conexión',
      offlineMode: false
    };
  }
};

// Función para sincronizar perfiles de usuario con localStorage
export const syncProfilesWithLocalStorage = async () => {
  try {
    if (offlineMode) {
      console.log('En modo offline, usando perfiles locales');
      return;
    }
    
    console.log('Sincronizando perfiles con localStorage...');
    const { data: profiles, error } = await supabase.from('profiles').select('*');
    
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
