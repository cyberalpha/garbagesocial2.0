
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { WasteType, WasteStatus } from '@/types';

// This utility provides mock implementations for Supabase operations
// on tables that don't exist yet in our database schema

/**
 * Creates a mock query builder for tables that don't exist in the Supabase schema yet
 * @param tableName The name of the non-existent table
 */
export const mockTableQuery = (tableName: string) => {
  // Return an object with methods that mimic the Supabase API
  return {
    select: (columns?: string) => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        maybeSingle: async () => ({ data: null, error: null })
      }),
      order: () => ({
        limit: () => ({
          then: () => Promise.resolve({ data: [], error: null })
        })
      }),
      then: () => Promise.resolve({ data: [], error: null }),
      data: null,
      error: null
    }),
    insert: (values: any) => ({
      then: () => Promise.resolve({ data: values, error: null }),
      select: () => ({
        then: () => Promise.resolve({ data: values, error: null })
      })
    }),
    upsert: (values: any) => ({
      then: () => Promise.resolve({ data: values, error: null })
    }),
    update: (values: any) => ({
      eq: () => ({
        then: () => Promise.resolve({ data: values, error: null })
      }),
      match: () => ({
        then: () => Promise.resolve({ data: values, error: null })
      })
    }),
    delete: () => ({
      eq: () => ({
        then: () => Promise.resolve({ data: null, error: null })
      })
    })
  };
};

/**
 * Safely accesses a table from Supabase, falling back to mock implementation
 * if the table doesn't exist.
 * @param tableName The name of the table to access
 */
export const safeTableAccess = (tableName: string) => {
  try {
    // First try to access the table directly
    return supabase.from(tableName as any);
  } catch (error) {
    console.warn(`Table '${tableName}' doesn't exist yet. Using mock implementation.`);
    return mockTableQuery(tableName);
  }
};

/**
 * Mock structure for a waste record that matches what's expected in the code
 */
export const mockWasteStructure = {
  id: '',
  user_id: '',
  type: 'various' as WasteType,
  description: '',
  image_url: '',
  location: {} as Json,
  publication_date: new Date().toISOString(),
  status: 'pending' as WasteStatus,
  pickup_commitment: null as Json
};

/**
 * Mock structure for a profile record that matches what's expected in the code
 */
export const mockProfileStructure = {
  id: '',
  user_id: '',
  name: '',
  email: '',
  is_organization: false,
  average_rating: 0,
  profile_image: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};
