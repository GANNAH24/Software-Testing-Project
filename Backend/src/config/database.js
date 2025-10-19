/**
 * Database Configuration
 * Supabase client setup for the monolith
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('❌ Missing SUPABASE_URL in environment variables. Add it to Backend/.env');
}

if (!supabaseKey) {
  throw new Error('❌ Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) in environment. Add it to Backend/.env');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Test connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

module.exports = {
  supabase,
  testConnection
};
