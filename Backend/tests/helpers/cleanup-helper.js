/**
 * Database Cleanup Helper for Integration Tests
 * Ensures all test data is properly removed in the correct order
 * Respects foreign key constraints
 */

const { supabase } = require('../../src/config/database');

/**
 * Clean up all test data for a user
 * Deletes in order to respect foreign key constraints:
 * 1. Appointments (references patients, doctors, schedules)
 * 2. Reviews (references appointments)
 * 3. Messages (references users)
 * 4. Doctor Schedules (references doctors)
 * 5. Patients record
 * 6. Doctors record
 * 7. Profiles/Users (auth.users)
 */
async function cleanupTestUser(userId) {
  if (!userId) return;

  try {
    console.log(`[CLEANUP] Starting cleanup for user: ${userId}`);

    // 1. Delete appointments where user is patient
    const { error: apptError1 } = await supabase
      .from('appointments')
      .delete()
      .eq('patient_id', userId);
    if (apptError1) console.error('[CLEANUP] Error deleting patient appointments:', apptError1);

    // 2. Get doctor_id if user is a doctor
    const { data: doctorData } = await supabase
      .from('doctors')
      .select('doctor_id')
      .eq('user_id', userId)
      .single();

    if (doctorData) {
      const doctorId = doctorData.doctor_id;
      console.log(`[CLEANUP] User ${userId} is doctor ${doctorId}`);

      // Delete appointments where user is doctor
      const { error: apptError2 } = await supabase
        .from('appointments')
        .delete()
        .eq('doctor_id', doctorId);
      if (apptError2) console.error('[CLEANUP] Error deleting doctor appointments:', apptError2);

      // Delete reviews
      const { error: reviewError } = await supabase
        .from('doctor_reviews')
        .delete()
        .eq('doctor_id', doctorId);
      if (reviewError) console.error('[CLEANUP] Error deleting reviews:', reviewError);

      // Delete schedules
      const { error: scheduleError } = await supabase
        .from('doctor_schedules')
        .delete()
        .eq('doctor_id', doctorId);
      if (scheduleError) console.error('[CLEANUP] Error deleting schedules:', scheduleError);
    }

    // 3. Delete messages and conversations
    // First get conversations where user is involved
    const { data: userConversations } = await supabase
      .from('conversations')
      .select('id')
      .or(`patient_id.eq.${userId},doctor_id.eq.${userId}`);
    
    if (userConversations && userConversations.length > 0) {
      const conversationIds = userConversations.map(c => c.id);
      
      // Delete messages from those conversations
      const { error: msgError } = await supabase
        .from('messages')
        .delete()
        .in('conversation_id', conversationIds);
      if (msgError) console.error('[CLEANUP] Error deleting messages:', msgError);
      
      // Delete conversations
      const { error: convError } = await supabase
        .from('conversations')
        .delete()
        .or(`patient_id.eq.${userId},doctor_id.eq.${userId}`);
      if (convError) console.error('[CLEANUP] Error deleting conversations:', convError);
    }

    // 4. Delete from patients table
    const { error: patientError } = await supabase
      .from('patients')
      .delete()
      .eq('patient_id', userId);
    if (patientError && patientError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('[CLEANUP] Error deleting patient:', patientError);
    }

    // 5. Delete from doctors table
    if (doctorData) {
      const { error: doctorError } = await supabase
        .from('doctors')
        .delete()
        .eq('user_id', userId);
      if (doctorError) console.error('[CLEANUP] Error deleting doctor:', doctorError);
    }

    // 6. Delete from profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('[CLEANUP] Error deleting profile:', profileError);
    }

    // 7. Delete from auth.users (requires service role key)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError && authError.message !== 'User not found') {
      console.error('[CLEANUP] Error deleting auth user:', authError);
    }

    console.log(`[CLEANUP] Completed cleanup for user: ${userId}`);
  } catch (error) {
    console.error(`[CLEANUP] Unexpected error cleaning up user ${userId}:`, error);
  }
}

/**
 * Clean up specific appointment
 */
async function cleanupAppointment(appointmentId) {
  if (!appointmentId) return;

  try {
    await supabase
      .from('appointments')
      .delete()
      .eq('appointment_id', appointmentId);
  } catch (error) {
    console.error(`[CLEANUP] Error deleting appointment ${appointmentId}:`, error);
  }
}

/**
 * Clean up specific schedule
 */
async function cleanupSchedule(scheduleId) {
  if (!scheduleId) return;

  try {
    // First delete any appointments using this schedule
    await supabase
      .from('appointments')
      .delete()
      .eq('schedule_id', scheduleId);

    // Then delete the schedule
    await supabase
      .from('doctor_schedules')
      .delete()
      .eq('schedule_id', scheduleId);
  } catch (error) {
    console.error(`[CLEANUP] Error deleting schedule ${scheduleId}:`, error);
  }
}

/**
 * Clean up all test data created during a test suite
 */
async function cleanupTestSuite(userIds = [], appointmentIds = [], scheduleIds = []) {
  console.log('[CLEANUP] Starting test suite cleanup...');

  // Clean up appointments first
  for (const apptId of appointmentIds) {
    await cleanupAppointment(apptId);
  }

  // Clean up schedules
  for (const schedId of scheduleIds) {
    await cleanupSchedule(schedId);
  }

  // Clean up users last (this will cascade to related data)
  for (const userId of userIds) {
    await cleanupTestUser(userId);
  }

  console.log('[CLEANUP] Test suite cleanup complete');
}

module.exports = {
  cleanupTestUser,
  cleanupAppointment,
  cleanupSchedule,
  cleanupTestSuite
};
