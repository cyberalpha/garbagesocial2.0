
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
        const { data: healthData, error: healthError } = await supabase.rpc('pg_stat_database');
        
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
      error: error.message || 'Error inesperado al verificar la conexión',
      offlineMode: false
    };
  }
};
