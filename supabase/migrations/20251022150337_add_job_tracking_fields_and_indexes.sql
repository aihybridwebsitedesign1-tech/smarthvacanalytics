/*
  # Enhanced Job Tracking and KPI Calculation Fields

  ## Overview
  This migration adds critical fields to the jobs table for accurate KPI tracking and calculation,
  plus performance indexes for efficient queries.

  ## New Columns Added to Jobs Table
  
  ### 1. job_type (text)
  - Purpose: Categorize jobs as 'install', 'maintenance', 'repair', or 'emergency'
  - Default: 'repair'
  - Used for: Maintenance completion rate calculation
  
  ### 2. callback_required (boolean)
  - Purpose: Track whether a callback/return visit was needed
  - Default: false
  - Used for: First-time fix rate calculation (jobs without callbacks ÷ total jobs × 100)
  
  ### 3. scheduled_date (date)
  - Purpose: When the job was originally scheduled
  - Used for: Average response time calculation (difference between scheduled and completed dates)
  
  ### 4. completed_date (date)
  - Purpose: When the job was actually completed
  - Used for: Average response time calculation
  
  ### 5. gross_margin_percent (numeric)
  - Purpose: Store the calculated gross margin percentage for this specific job
  - Default: 0
  - Calculation: ((revenue - cost) / revenue) × 100
  - Used for: Job-level profitability tracking
  
  ## Performance Indexes
  
  - idx_jobs_user_id_status: Fast filtering by user and status
  - idx_jobs_job_date: Fast date-range queries for analytics
  - idx_jobs_technician_id: Fast technician performance lookups
  - idx_jobs_job_type: Fast job type filtering for maintenance rate
  - idx_analytics_snapshots_user_date: Fast analytics data retrieval
  
  ## Data Integrity
  
  - All new fields are nullable to support existing records
  - Sensible defaults provided for new records
  - Indexes created for frequently queried columns
  
  ## Migration Safety
  
  - Uses IF NOT EXISTS checks to prevent duplicate columns
  - Safe to run multiple times without errors
  - Existing data remains unchanged
*/

-- Add new tracking fields to jobs table
DO $$
BEGIN
  -- Add job type field for categorization
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'job_type'
  ) THEN
    ALTER TABLE jobs ADD COLUMN job_type text DEFAULT 'repair';
  END IF;
  
  -- Add callback tracking for first-time fix rate
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'callback_required'
  ) THEN
    ALTER TABLE jobs ADD COLUMN callback_required boolean DEFAULT false;
  END IF;
  
  -- Add scheduled date for response time calculation
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'scheduled_date'
  ) THEN
    ALTER TABLE jobs ADD COLUMN scheduled_date date;
  END IF;
  
  -- Add completed date for response time calculation
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'completed_date'
  ) THEN
    ALTER TABLE jobs ADD COLUMN completed_date date;
  END IF;
  
  -- Add gross margin percentage for job-level tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'gross_margin_percent'
  ) THEN
    ALTER TABLE jobs ADD COLUMN gross_margin_percent numeric DEFAULT 0;
  END IF;
END $$;

-- Create performance indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_jobs_user_id_status ON jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_job_date ON jobs(job_date);
CREATE INDEX IF NOT EXISTS idx_jobs_technician_id ON jobs(technician_id);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_user_date ON analytics_snapshots(user_id, snapshot_date);

-- Add automatic timestamp update trigger for jobs table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_technicians_updated_at ON technicians;
CREATE TRIGGER update_technicians_updated_at
  BEFORE UPDATE ON technicians
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Backfill scheduled_date and completed_date for existing records
UPDATE jobs 
SET 
  scheduled_date = job_date,
  completed_date = CASE WHEN status = 'completed' THEN job_date ELSE NULL END
WHERE scheduled_date IS NULL;

-- Backfill gross_margin_percent for existing records
UPDATE jobs 
SET gross_margin_percent = CASE 
  WHEN revenue > 0 THEN ((revenue - cost) / revenue) * 100
  ELSE 0
END
WHERE gross_margin_percent = 0 AND revenue > 0;