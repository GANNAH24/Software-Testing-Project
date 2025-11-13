-- ================================================
-- Database Enhancements for Layered Monolith Architecture
-- Run this in Supabase SQL Editor
-- ================================================
-- Updated to match your exact table schema
-- ================================================

-- ================================================
-- PART 1: Performance Indexes
-- ================================================

-- Appointments indexes (improve query performance)
/*
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_time_slot ON public.appointments(time_slot);

-- Doctors indexes
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON public.doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON public.doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_location ON public.doctors(location);
CREATE INDEX IF NOT EXISTS idx_doctors_name ON public.doctors(name);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Admins indexes
CREATE INDEX IF NOT EXISTS idx_admins_admin_id ON public.admins(admin_id);

-- Patients indexes
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON public.patients(patient_id);

-- Schedules indexes
CREATE INDEX IF NOT EXISTS idx_schedules_doctor_id ON public.doctor_schedules(doctor_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON public.doctor_schedules(date);
CREATE INDEX IF NOT EXISTS idx_schedules_is_available ON public.doctor_schedules(is_available);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_doctor_id ON public.doctor_reviews(doctor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_patient_id ON public.doctor_reviews(patient_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.doctor_reviews(rating);

-- ================================================
-- PART 2: Audit Columns (updated_at)
-- ================================================

-- Add updated_at to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at to patients
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at to admins
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at to doctors
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at to appointments
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at to doctor_schedules
ALTER TABLE public.doctor_schedules 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at to doctor_reviews
ALTER TABLE public.doctor_reviews 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ================================================
-- PART 3: Soft Delete Support (deleted_at)
-- ================================================

-- Add deleted_at to appointments (for cancellations/soft delete)
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add deleted_at to doctors (for soft delete)
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add deleted_at to doctor_schedules
ALTER TABLE public.doctor_schedules 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add deleted_at to doctor_reviews
ALTER TABLE public.doctor_reviews 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add deleted_at to admins
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add deleted_at to patients
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- ================================================
-- PART 4: Automatic updated_at Trigger Function
-- ================================================

-- Create function to automatically update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;
DROP TRIGGER IF EXISTS update_admins_updated_at ON public.admins;
DROP TRIGGER IF EXISTS update_doctors_updated_at ON public.doctors;
DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
DROP TRIGGER IF EXISTS update_schedules_updated_at ON public.doctor_schedules;
DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.doctor_reviews;

-- Create triggers for automatic updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admins_updated_at
    BEFORE UPDATE ON public.admins
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON public.doctors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON public.doctor_schedules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.doctor_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================
-- PART 5: Helper Views for Active Records
-- ================================================

-- View for active appointments (not soft-deleted)
CREATE OR REPLACE VIEW public.active_appointments AS
SELECT * FROM public.appointments
WHERE deleted_at IS NULL;

-- View for active doctors (not soft-deleted)
CREATE OR REPLACE VIEW public.active_doctors AS
SELECT * FROM public.doctors
WHERE deleted_at IS NULL;

-- View for active schedules (not soft-deleted)
CREATE OR REPLACE VIEW public.active_doctor_schedules AS
SELECT * FROM public.doctor_schedules
WHERE deleted_at IS NULL;

-- View for active reviews (not soft-deleted)
CREATE OR REPLACE VIEW public.active_doctor_reviews AS
SELECT * FROM public.doctor_reviews
WHERE deleted_at IS NULL;

-- View for active patients (not soft-deleted)
CREATE OR REPLACE VIEW public.active_patients AS
SELECT * FROM public.patients
WHERE deleted_at IS NULL;

-- View for active admins (not soft-deleted)
CREATE OR REPLACE VIEW public.active_admins AS
SELECT * FROM public.admins
WHERE deleted_at IS NULL;

-- ================================================
-- PART 6: Verification Queries
-- ================================================

-- Check all indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('appointments', 'doctors', 'profiles', 'patients', 'admins', 'doctor_schedules', 'doctor_reviews')
ORDER BY tablename, indexname;

-- Check all columns in appointments
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'appointments'
ORDER BY ordinal_position;

-- Check all triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('profiles', 'patients', 'admins', 'doctors', 'appointments', 'doctor_schedules', 'doctor_reviews')
ORDER BY event_object_table, trigger_name;

-- ================================================
-- SUCCESS! Database is now enhanced for layered monolith
-- ================================================
-- Next steps:
-- 1. Run this script in Supabase SQL Editor
-- 2. Verify indexes and columns were created
-- 3. Start the layered monolith application
-- ================================================
