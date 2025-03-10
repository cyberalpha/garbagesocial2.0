
import { supabase, testSupabaseConnection as testConnection } from '@/integrations/supabase/client';

export const testSupabaseConnection = async () => {
  return await testConnection();
};

export const checkDatabaseConnection = async () => {
  try {
    // Intentamos una consulta simple para verificar la conexión
    const { data, error } = await supabase.from('profiles').select('count');
    
    if (error) {
      console.error('Error de conexión a Supabase:', error);
      return { 
        success: false, 
        error: error.message || 'Error al conectar con la base de datos'
      };
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
