-- =====================================================
-- Create reviews table
-- =====================================================
-- This script creates the reviews table for doctor reviews

-- Create the reviews table with proper structure
CREATE TABLE IF NOT EXISTS reviews (
  review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  appointment_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Foreign key constraints
  CONSTRAINT fk_reviews_doctor FOREIGN KEY (doctor_id) 
    REFERENCES doctors(doctor_id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_patient FOREIGN KEY (patient_id) 
    REFERENCES patients(patient_id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_appointment FOREIGN KEY (appointment_id) 
    REFERENCES appointments(appointment_id) ON DELETE SET NULL,
  
  -- Unique constraint: one review per appointment
  CONSTRAINT unique_appointment_review UNIQUE (appointment_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_doctor_id 
  ON reviews(doctor_id);
  
CREATE INDEX IF NOT EXISTS idx_reviews_patient_id 
  ON reviews(patient_id);
  
CREATE INDEX IF NOT EXISTS idx_reviews_appointment_id 
  ON reviews(appointment_id);

CREATE INDEX IF NOT EXISTS idx_reviews_created_at 
  ON reviews(created_at DESC);

-- Add comments describing the table
COMMENT ON TABLE reviews IS 'Reviews left by patients for doctors after completed appointments';
COMMENT ON COLUMN reviews.appointment_id IS 'Links review to the specific appointment - ensures one review per appointment';
COMMENT ON COLUMN reviews.rating IS 'Rating from 1-5 stars';
COMMENT ON COLUMN reviews.deleted_at IS 'Soft delete timestamp - NULL means active review';

-- Verification query
SELECT 
  COUNT(*) as total_reviews,
  COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_reviews,
  COUNT(appointment_id) as reviews_with_appointments
FROM reviews;
