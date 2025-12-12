-- SQL Script to add appointment_id column to reviews table
-- This script adds the appointment_id column and constraints

-- Add appointment_id column to reviews table
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS appointment_id UUID;

-- Add foreign key constraint to appointments table
ALTER TABLE reviews 
ADD CONSTRAINT fk_reviews_appointment
FOREIGN KEY (appointment_id) 
REFERENCES appointments(appointment_id)
ON DELETE SET NULL;

-- Add unique constraint to ensure one review per appointment
ALTER TABLE reviews
ADD CONSTRAINT unique_appointment_review
UNIQUE (appointment_id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_appointment_id ON reviews(appointment_id);
CREATE INDEX IF NOT EXISTS idx_reviews_doctor_id ON reviews(doctor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_patient_id ON reviews(patient_id);

-- Update existing rows: set appointment_id to NULL for existing reviews without appointment_id
-- (Optional: You may want to write a migration script to populate this if you have historical data)

-- Verify the changes
COMMENT ON COLUMN reviews.appointment_id IS 'Foreign key to appointments table - links review to specific appointment';
