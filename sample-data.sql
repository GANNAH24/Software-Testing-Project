-- Sample Test Data for Se7ety Healthcare Platform
-- Run this in your Supabase SQL Editor to populate the database

-- Note: This assumes your tables are already created
-- If tables don't exist, you'll need to create them first

-- ============================================
-- 1. Sample Doctors
-- ============================================
INSERT INTO doctors (name, specialty, qualifications, reviews, location, phone, experience, created_at)
VALUES 
  ('Dr. Sarah Johnson', 'Cardiology', 'MD, FACC - Board Certified Cardiologist', 150, 'New York, NY', '+1-212-555-0101', '15 years', NOW()),
  ('Dr. Michael Chen', 'Pediatrics', 'MD, FAAP - Board Certified Pediatrician', 200, 'Los Angeles, CA', '+1-310-555-0202', '12 years', NOW()),
  ('Dr. Emily Rodriguez', 'Dermatology', 'MD, FAAD - Board Certified Dermatologist', 175, 'Chicago, IL', '+1-312-555-0303', '10 years', NOW()),
  ('Dr. James Wilson', 'Orthopedics', 'MD, FAAOS - Orthopedic Surgeon', 180, 'Houston, TX', '+1-713-555-0404', '18 years', NOW()),
  ('Dr. Lisa Anderson', 'Neurology', 'MD, FAAN - Board Certified Neurologist', 165, 'Phoenix, AZ', '+1-602-555-0505', '14 years', NOW()),
  ('Dr. David Lee', 'Internal Medicine', 'MD, FACP - Internal Medicine Specialist', 220, 'Philadelphia, PA', '+1-215-555-0606', '20 years', NOW()),
  ('Dr. Maria Garcia', 'Obstetrics & Gynecology', 'MD, FACOG - OB/GYN Specialist', 190, 'San Antonio, TX', '+1-210-555-0707', '16 years', NOW()),
  ('Dr. Robert Brown', 'Psychiatry', 'MD, FAPA - Board Certified Psychiatrist', 140, 'San Diego, CA', '+1-619-555-0808', '11 years', NOW()),
  ('Dr. Jennifer Taylor', 'Ophthalmology', 'MD, FACS - Eye Surgeon', 155, 'Dallas, TX', '+1-214-555-0909', '13 years', NOW()),
  ('Dr. William Martinez', 'Dentistry', 'DDS - General Dentist', 210, 'San Jose, CA', '+1-408-555-1010', '17 years', NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. Sample Patients (if you have a patients table)
-- ============================================
-- Note: You may need to adjust this based on your actual table structure
-- Uncomment if you want to add sample patients

-- INSERT INTO patients (patient_id, date_of_birth, gender, phone, created_at)
-- VALUES 
--   ('patient-uuid-1', '1990-05-15', 'male', '+1-555-1001', NOW()),
--   ('patient-uuid-2', '1985-08-22', 'female', '+1-555-1002', NOW()),
--   ('patient-uuid-3', '1992-03-10', 'female', '+1-555-1003', NOW())
-- ON CONFLICT DO NOTHING;

-- ============================================
-- 3. Verify Data
-- ============================================
-- Run these queries to check if data was inserted correctly

-- Check doctors
SELECT doctor_id, name, specialty, location FROM doctors WHERE deleted_at IS NULL;

-- Count doctors by specialty
SELECT specialty, COUNT(*) as count 
FROM doctors 
WHERE deleted_at IS NULL 
GROUP BY specialty 
ORDER BY count DESC;

-- ============================================
-- 4. Sample Appointments (Optional)
-- ============================================
-- Note: You'll need valid patient_id and doctor_id values
-- Uncomment and replace with actual IDs after patients are registered

-- INSERT INTO appointments (patient_id, doctor_id, date, time_slot, reason, status, created_at)
-- VALUES 
--   ('patient-uuid-1', (SELECT doctor_id FROM doctors WHERE name = 'Dr. Sarah Johnson' LIMIT 1), '2025-11-25', '10:00-11:00', 'Annual checkup', 'scheduled', NOW()),
--   ('patient-uuid-2', (SELECT doctor_id FROM doctors WHERE name = 'Dr. Michael Chen' LIMIT 1), '2025-11-26', '14:00-15:00', 'Follow-up visit', 'scheduled', NOW())
-- ON CONFLICT DO NOTHING;

-- ============================================
-- 5. Clean up (if needed)
-- ============================================
-- Uncomment these if you want to remove all test data

-- DELETE FROM appointments WHERE reason LIKE '%test%' OR reason LIKE '%sample%';
-- DELETE FROM doctors WHERE name LIKE 'Dr. %' AND created_at > NOW() - INTERVAL '1 hour';

-- ============================================
-- Notes:
-- ============================================
-- 1. Make sure your tables have the correct structure before running this
-- 2. Adjust field names if your schema is different
-- 3. For production, you should use proper user authentication before creating appointments
-- 4. The phone numbers and addresses are fictional
