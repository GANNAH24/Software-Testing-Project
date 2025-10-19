-- ================================================
-- Fix Row Level Security (RLS) Policies
-- Run this in Supabase SQL Editor
-- ================================================

-- Option 1: Disable RLS for development (RECOMMENDED FOR TESTING)
-- ================================================
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_reviews DISABLE ROW LEVEL SECURITY;

-- ================================================
-- Option 2: Enable RLS with Policies (FOR PRODUCTION)
-- Uncomment the section below if you want to use RLS
-- ================================================

/*
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;

DROP POLICY IF EXISTS "patients_select_policy" ON public.patients;
DROP POLICY IF EXISTS "patients_insert_policy" ON public.patients;
DROP POLICY IF EXISTS "patients_update_policy" ON public.patients;

DROP POLICY IF EXISTS "doctors_select_policy" ON public.doctors;
DROP POLICY IF EXISTS "doctors_insert_policy" ON public.doctors;
DROP POLICY IF EXISTS "doctors_update_policy" ON public.doctors;

DROP POLICY IF EXISTS "appointments_select_policy" ON public.appointments;
DROP POLICY IF EXISTS "appointments_insert_policy" ON public.appointments;
DROP POLICY IF EXISTS "appointments_update_policy" ON public.appointments;

-- PROFILES TABLE POLICIES
-- Allow users to read all profiles
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT
  USING (true);

-- Allow service role to insert profiles (for registration trigger)
CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own profile
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- PATIENTS TABLE POLICIES
-- Allow users to read their own patient record
CREATE POLICY "patients_select_policy" ON public.patients
  FOR SELECT
  USING (auth.uid() = patient_id);

-- Allow service role to insert patient records (for registration)
CREATE POLICY "patients_insert_policy" ON public.patients
  FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own patient record
CREATE POLICY "patients_update_policy" ON public.patients
  FOR UPDATE
  USING (auth.uid() = patient_id);

-- DOCTORS TABLE POLICIES
-- Allow everyone to read doctor profiles (public browsing)
CREATE POLICY "doctors_select_policy" ON public.doctors
  FOR SELECT
  USING (true);

-- Allow service role to insert doctor records (for registration)
CREATE POLICY "doctors_insert_policy" ON public.doctors
  FOR INSERT
  WITH CHECK (true);

-- Allow doctors to update their own profile
CREATE POLICY "doctors_update_policy" ON public.doctors
  FOR UPDATE
  USING (auth.uid() = user_id);

-- APPOINTMENTS TABLE POLICIES
-- Allow patients and doctors to view their own appointments
CREATE POLICY "appointments_select_policy" ON public.appointments
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT patient_id FROM public.patients WHERE patient_id = auth.uid()
      UNION
      SELECT user_id FROM public.doctors WHERE user_id = auth.uid()
    )
  );

-- Allow patients to create appointments
CREATE POLICY "appointments_insert_policy" ON public.appointments
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT patient_id FROM public.patients)
  );

-- Allow patients and doctors to update appointments
CREATE POLICY "appointments_update_policy" ON public.appointments
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT patient_id FROM public.patients WHERE patient_id = auth.uid()
      UNION
      SELECT user_id FROM public.doctors WHERE user_id = auth.uid()
    )
  );

-- DOCTOR SCHEDULES POLICIES
-- Allow everyone to view schedules
CREATE POLICY "schedules_select_policy" ON public.doctor_schedules
  FOR SELECT
  USING (true);

-- Allow doctors to manage their schedules
CREATE POLICY "schedules_insert_policy" ON public.doctor_schedules
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.doctors WHERE doctor_id = doctor_schedules.doctor_id)
  );

CREATE POLICY "schedules_update_policy" ON public.doctor_schedules
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT user_id FROM public.doctors WHERE doctor_id = doctor_schedules.doctor_id)
  );

-- DOCTOR REVIEWS POLICIES
-- Allow everyone to read reviews
CREATE POLICY "reviews_select_policy" ON public.doctor_reviews
  FOR SELECT
  USING (true);

-- Allow patients to create reviews
CREATE POLICY "reviews_insert_policy" ON public.doctor_reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT patient_id FROM public.patients)
  );

-- Allow patients to update their own reviews
CREATE POLICY "reviews_update_policy" ON public.doctor_reviews
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT patient_id FROM public.patients WHERE patient_id = doctor_reviews.patient_id)
  );
*/

-- ================================================
-- Verification
-- ================================================
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN 'ENABLED' 
        ELSE 'DISABLED' 
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'patients', 'admins', 'doctors', 'appointments', 'doctor_schedules', 'doctor_reviews')
ORDER BY tablename;

-- ================================================
-- SUCCESS!
-- ================================================
