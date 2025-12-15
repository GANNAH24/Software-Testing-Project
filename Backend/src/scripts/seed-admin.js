/**
 * Admin Seeding Script
 * Automatically creates/resets admin user based on environment variables
 */

const { supabase } = require('../config/database');
const logger = require('../shared/utils/logger.util');

const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'System Admin';

  if (!adminEmail || !adminPassword) {
    logger.warn('⚠️ Admin seeding skipped: ADMIN_EMAIL or ADMIN_PASSWORD not set in .env');
    return;
  }

  logger.info(`🔄 key starting with: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) : 'undefined'}...`);
  
  // Verify we have service role access (needed for admin management)
  // We can check if we can list users (restricted op)
  // OR just try to proceed and catch errors.

  try {
    logger.info(`🔄 Checking for existing admin: ${adminEmail}`);

    // 1. List users to find if admin exists
    // supabase.auth.admin.listUsers() returns a paginated list
    // We filter manually by email since listUsers doesn't support direct email filtering in all versions
    // or use getUserById if we knew the ID, but we don't.
    // Actually, listUsers allows searching in newer versions but exact match filter implies iterating or search query?
    // Let's iterate or assume low user count for now? No, better to try to create and catch "already exists" or use listUsers.
    // listUsers() is best.

    // 1. List users to find if admin exists
    // Handle pagination to ensure we find the user
    let existingAdmin;
    let page = 1; 
    let keepSearching = true;

    while (keepSearching) {
       const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ page: page, perPage: 1000 });
       
       if (listError) {
          logger.error('❌ Failed to list users. Ensure SUPABASE_SERVICE_ROLE_KEY is set correctly.');
          throw listError;
       }

       if (!users || users.length === 0) {
         keepSearching = false;
       } else {
         const found = users.find(u => u.email === adminEmail);
         if (found) {
           existingAdmin = found;
           keepSearching = false;
         } else {
           page++;
           // Safety break to prevent infinite loops if too many users
           if (page > 50) keepSearching = false; 
         }
       }
    }

    if (existingAdmin) {
      logger.info(`⚠️ Admin user found (ID: ${existingAdmin.id}). Deleting to enforce new credentials...`);
      
      // 2. Delete existing admin
      const { error: deleteError } = await supabase.auth.admin.deleteUser(existingAdmin.id);
      
      if (deleteError) {
        throw new Error(`Failed to delete existing admin: ${deleteError.message}`);
      }
      
      logger.info('✅ Existing admin deleted.');
    }

    // 3. Create fresh admin
    logger.info('🆕 Creating new admin user...');
    
    const { data: authData, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: adminName,
        role: 'admin'
      }
    });

    if (createError) {
      throw new Error(`Failed to create admin user: ${createError.message}`);
    }

    const userId = authData.user.id;
    logger.info(`✅ Admin auth user created (ID: ${userId}). Waiting for trigger...`);

    // 4. Wait for database trigger to create profile/admin tables
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 5. Verify profile exists and has correct role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      logger.warn('⚠️ Admin profile not created by trigger. Creating manually...');
      
      // Manual fallback: Insert profile directly
      const { error: insertError } = await supabase.from('profiles').insert({
        id: userId,
        email: adminEmail,
        role: 'admin',
        full_name: adminName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (insertError) {
        logger.error(`❌ Failed to manually create admin profile: ${insertError.message}`);
      } else {
        logger.info('✅ Admin profile created manually.');
      }
    } else {
        // Double check role
        if (profile.role !== 'admin') {
             logger.warn(`⚠️ Created user has role '${profile.role}', expected 'admin'. Force updating...`);
             await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId);
        }
        logger.info('✅ Admin profile verified.');
    }

    logger.info('🎉 Admin seeding completed successfully.');
    
  } catch (error) {
    logger.error('❌ Admin seeding failed', { error: error.message });
    // Don't throw error to stop server, just log it.
  }
};

module.exports = seedAdmin;
