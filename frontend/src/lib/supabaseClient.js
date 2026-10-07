import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verify if environment variables are provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('YOUR_SUPABASE') &&
  !supabaseAnonKey.includes('YOUR_SUPABASE')
);

// Create and export the Supabase client instance
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      }
    })
  : null;

/**
 * Safely checks connectivity to the user's Supabase project.
 * Does not make destructive changes or assume any table structure.
 */
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      message: 'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing or not yet set in frontend/.env',
    };
  }

  try {
    // Check authentication service status safely
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return {
        connected: false,
        error: error.message,
        message: 'Connected to Supabase endpoint, but auth session query failed: ' + error.message,
      };
    }

    return {
      connected: true,
      session: data.session,
      url: supabaseUrl,
      message: 'Successfully connected to your existing Supabase project!',
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message,
      message: 'Failed to reach Supabase: ' + err.message,
    };
  }
}
