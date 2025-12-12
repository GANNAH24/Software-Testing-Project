-- =====================================================
-- Convert active_doctor_reviews VIEW to TABLE
-- =====================================================
-- This script safely converts the view to a table while preserving data

-- Step 1: Create a temporary backup of existing data from the view
CREATE TEMP TABLE temp_reviews_backup AS
SELECT * FROM active_doctor_reviews;

-- Step 2: Drop the existing view
DROP VIEW IF EXISTS active_doctor_reviews;

-- Step 3: Create the reviews table with proper structure
CREATE TABLE active_doctor_reviews (
  review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  appointment_id UUID,  -- New column for appointment linking
  
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

-- Step 4: Restore the backed-up data
INSERT INTO active_doctor_reviews (
  review_id, 
  doctor_id, 
  patient_id, 
  rating, 
  comment, 
  created_at, 
  updated_at, 
  deleted_at
)
SELECT 
  review_id, 
  doctor_id, 
  patient_id, 
  rating, 
  comment, 
  created_at, 
  updated_at, 
  deleted_at
FROM temp_reviews_backup;

-- Step 5: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_active_doctor_reviews_doctor_id 
  ON active_doctor_reviews(doctor_id);
  
CREATE INDEX IF NOT EXISTS idx_active_doctor_reviews_patient_id 
  ON active_doctor_reviews(patient_id);
  
CREATE INDEX IF NOT EXISTS idx_active_doctor_reviews_appointment_id 
  ON active_doctor_reviews(appointment_id);

CREATE INDEX IF NOT EXISTS idx_active_doctor_reviews_created_at 
  ON active_doctor_reviews(created_at DESC);

-- Step 6: Add comment describing the table
COMMENT ON TABLE active_doctor_reviews IS 'Reviews left by patients for doctors after completed appointments';
COMMENT ON COLUMN active_doctor_reviews.appointment_id IS 'Links review to the specific appointment - ensures one review per appointment';
COMMENT ON COLUMN active_doctor_reviews.rating IS 'Rating from 0-5 stars';
COMMENT ON COLUMN active_doctor_reviews.deleted_at IS 'Soft delete timestamp - NULL means active review';

-- Step 7: Clean up temp table
DROP TABLE temp_reviews_backup;

-- Verification query - run this to check the conversion
SELECT 
  COUNT(*) as total_reviews,
  COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_reviews,
  COUNT(appointment_id) as reviews_with_appointments
FROM active_doctor_reviews;
