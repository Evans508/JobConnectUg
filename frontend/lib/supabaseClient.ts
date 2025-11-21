
import { createClient } from '@supabase/supabase-js';

// To enable Supabase, add these variables to your environment (.env file)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

export const isSupabaseConfigured = () => {
  return !!SUPABASE_URL && !!SUPABASE_KEY;
};

// Only log this warning once on load
if (!isSupabaseConfigured()) {
  // Using a timeout to ensure it prints after other system logs
  setTimeout(() => {
    console.group("⚠️  DATABASE NOT CONNECTED");
    console.log("%cThe app is running in MOCK MODE.", "color: orange; font-weight: bold;");
    console.log("Data is being stored in memory and will be lost on refresh.");
    console.log("To enable persistence:");
    console.log("1. Create a project at https://supabase.com");
    console.log("2. Copy the SQL from 'supabase_schema.sql' and run it in the Supabase SQL Editor.");
    console.log("3. Add SUPABASE_URL and SUPABASE_KEY to your .env file.");
    console.groupEnd();
  }, 1000);
} else {
  setTimeout(() => {
    console.log("%c✅ Connected to Supabase", "color: green; font-weight: bold;");
  }, 1000);
}

// Initialize with environment variables or fallback placeholders to prevent crash on init
// The API service checks isSupabaseConfigured() before making actual requests
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co', 
  SUPABASE_KEY || 'placeholder-key'
);
