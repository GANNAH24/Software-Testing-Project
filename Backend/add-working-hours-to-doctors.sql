-- ================================================
-- Add Working Hours Columns to Doctors Table
-- Run this in Supabase SQL Editor
-- ================================================

-- Add working hours columns to doctors table
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS working_hours_start TIME,
ADD COLUMN IF NOT EXISTS working_hours_end TIME;

-- Add default working hours for existing doctors (9 AM to 5 PM)
UPDATE public.doctors 
SET working_hours_start = '09:00:00',
    working_hours_end = '17:00:00'
WHERE working_hours_start IS NULL;

-- Add check constraint to ensure end time is after start time
ALTER TABLE public.doctors 
ADD CONSTRAINT check_working_hours 
CHECK (working_hours_end > working_hours_start);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_doctors_working_hours 
ON public.doctors(working_hours_start, working_hours_end);

-- Add comment to document the columns
COMMENT ON COLUMN public.doctors.working_hours_start IS 'Doctor daily start time (e.g., 09:00:00)';
COMMENT ON COLUMN public.doctors.working_hours_end IS 'Doctor daily end time (e.g., 17:00:00)';
