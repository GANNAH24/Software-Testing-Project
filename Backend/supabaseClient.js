import { createClient } from '@supabase/supabase-js';
// Load environment variables from the .env file
import 'dotenv/config'; 

// Load Supabase credentials from the environment variables
const supabaseUrl = process.env.SUPABASE_URL;
 process.env.SUPABASE_SERVICE_ROLE_KEY; 

// --- Critical Check ---
if (!supabaseUrl || !supabaseAnonKey) {
    console.error("FATAL ERROR: Supabase credentials are not defined in the .env file.");
    // Exit the process if secrets are missing to prevent connection failure.
    process.exit(1); 
}

// Initialize and export the Supabase client instance
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log(" Supabase client module initialized.");

export default supabase;
 