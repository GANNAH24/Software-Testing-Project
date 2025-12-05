-- ================================================
-- Fix patients table user_id column
-- Run this in Supabase SQL Editor
-- ================================================

-- Add user_id column to patients table if it doesn't exist
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- For existing records, copy patient_id to user_id
-- (assuming patient_id was meant to reference the user)
UPDATE public.patients
SET user_id = patient_id
WHERE user_id IS NULL;

-- Create index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'patients'
AND column_name IN ('patient_id', 'user_id')
ORDER BY ordinal_position;
