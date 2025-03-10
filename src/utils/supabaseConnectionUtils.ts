
import { supabase, testSupabaseConnection as testConnection } from '@/integrations/supabase/client';

export const testSupabaseConnection = async () => {
  return await testConnection();
};

export const checkDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count');
    return { success: !error, error };
  } catch (error) {
    console.error('Database connection check failed:', error);
    return { success: false, error };
  }
};
