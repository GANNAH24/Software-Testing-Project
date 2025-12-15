/**
 * Check Admin Status Script
 */
require('dotenv').config();
const { supabase } = require('../config/database');

const checkAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  console.log(`Checking status for: ${email}`);

  // 1. Check Auth User
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  const user = users?.find(u => u.email === email);

  if (!user) {
    console.log('❌ User NOT found in Supabase Auth');
    return;
  }
  console.log(`✅ User found in Auth. ID: ${user.id}`);

  // 2. Check Profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.log('❌ Profile NOT found in database');
    console.log('Profile Error:', profileError?.message);
  } else {
    console.log(`✅ Profile found. Role: ${profile.role}`);
    if (profile.role !== 'admin') {
        console.log(`⚠️ WARNING: Role is '${profile.role}'! Fixing it to 'admin'...`);
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', user.id);
        
        if (updateError) {
            console.log('❌ Failed to update role:', updateError.message);
        } else {
            console.log('✅ Role updated to admin successfully.');
        }
    }
  }
};

checkAdmin();
