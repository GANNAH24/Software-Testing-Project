require('dotenv').config();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttclfbqepumctddoxyyj.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Now you can use `supabase` to interact with your Supabase project