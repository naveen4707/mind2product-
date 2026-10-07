require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('YOUR_SUPABASE') &&
  !supabaseKey.includes('YOUR_SUPABASE')
);

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

async function checkBackendSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      message: 'Supabase server environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are not set in node-backend/.env'
    };
  }

  try {
    // Check connection via PostgREST OpenAPI endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!response.ok) {
      return {
        connected: false,
        status: response.status,
        message: `Supabase returned HTTP ${response.status}: ${response.statusText}`
      };
    }

    const openApiData = await response.json();
    const availableTables = Object.keys(openApiData.definitions || {});

    return {
      connected: true,
      url: supabaseUrl,
      hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      availableTables: availableTables,
      message: 'Connected to your existing Supabase project!'
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message,
      message: `Failed to connect to Supabase: ${err.message}`
    };
  }
}

module.exports = {
  supabase,
  isSupabaseConfigured,
  checkBackendSupabase
};
