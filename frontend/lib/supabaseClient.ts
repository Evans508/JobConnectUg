import { createClient } from '@supabase/supabase-js';

// Helper to safely get environment variables
const getEnvVar = (key: string): string => {
  // Check Vite's import.meta.env
  try {
    // Explicitly cast to any to avoid TypeScript errors regarding 'env' on ImportMeta
    const meta = import.meta as any;
    if (meta && meta.env && meta.env[key]) {
      return meta.env[key] as string;
    }
  } catch (e) {
    // Ignore errors if import.meta is not available
  }

  // Check Node's process.env
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch (e) {
    // Ignore errors
  }

  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL');
const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_KEY');

export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseKey && 
         supabaseUrl !== 'undefined' && supabaseKey !== 'undefined' &&
         !supabaseUrl.includes('placeholder');
};

if (!isSupabaseConfigured()) {
  console.warn("Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.");
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder-key'
);