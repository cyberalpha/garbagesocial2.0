
import { supabase, testSupabaseConnection as testConnection } from '@/integrations/supabase/client';

export const testSupabaseConnection = async () => {
  return await testConnection();
};

export const checkDatabaseConnection = async () => {
  try {
    console.log('Intentando verificar conexión a Supabase...');
    
    // Primero usamos un método simple para verificar la conexión
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('Error de conexión a Supabase:', error);
      
      // Intento alternativo con una consulta más básica
      try {
        console.log('Intentando verificación alternativa...');
        const { data: healthData, error: healthError } = await supabase.rpc('pg_stat_database_select_health');
        
        if (healthError) {
          return { 
            success: false, 
            error: error.message || 'Error al conectar con la base de datos'
          };
        }
        
        console.log('Verificación alternativa exitosa');
        return { success: true };
      } catch (innerError) {
        console.error('Error en verificación alternativa:', innerError);
        return { 
          success: false, 
          error: error.message || 'Error al conectar con la base de datos'
        };
      }
    }
    
    // Si llegamos aquí, la conexión fue exitosa
    console.log('Conexión a Supabase verificada exitosamente');
    return { success: true };
  } catch (error: any) {
    console.error('Error inesperado al verificar conexión:', error);
    return { 
      success: false, 
      error: error.message || 'Error inesperado al verificar la conexión'
    };
  }
};
