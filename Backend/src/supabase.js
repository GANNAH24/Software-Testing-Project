require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Prefer env vars so different environments work without code changes
const supabaseUrl = process.env.SUPABASE_URL;
// On the server, it's best to use the service role key. Fall back to anon if provided.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
	throw new Error('Missing SUPABASE_URL in environment. Add it to Backend/.env');
}
if (!supabaseKey) {
	throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) in environment. Add it to Backend/.env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
