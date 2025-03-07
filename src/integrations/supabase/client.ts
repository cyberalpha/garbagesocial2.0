
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kkiymeuqlznkpiqdedgz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtraXltZXVxbHpua3BpcWRlZGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMjYwNjMsImV4cCI6MjA1NjkwMjA2M30.aAsK16xq_dvzYBbj8HfmGGmTX5NUu1Xipe6CwbLDAe0";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
