/*
  # Enhanced HVAC KPI Tracker Schema Updates

  1. Profile Enhancements
    - Add `user_role` column (owner or technician)
    - Add `owned_by` column for technician accounts referencing owner
    - Add `trial_start` timestamp for trial tracking
    - Add `trial_expired` boolean flag
    - Add `demo_mode` boolean flag to identify sample data users
    
  2. Analytics Snapshots Enhancements
    - Add `avg_job_revenue` (numeric) - average revenue per job
    - Add `first_time_fix_rate` (numeric) - percentage of jobs completed without callbacks
    - Add `avg_response_time` (numeric) - average hours from scheduling to completion
    - Add `revenue_per_technician` (numeric) - revenue divided by active technician count
    - Add `jobs_per_tech_per_week` (numeric) - jobs per technician in rolling 7 days
    - Add `maintenance_completion_rate` (numeric) - percentage of maintenance jobs completed
    
  3. New Tables
    - `consultation_requests` - stores free consultation form submissions
      - `id` (uuid, primary key)
      - `name` (text) - contact name
      - `email` (text) - contact email
      - `company` (text) - company name
      - `user_id` (uuid, optional reference to profiles)
      - `message` (text) - optional message
      - `status` (text) - pending, contacted, completed
      - `created_at` (timestamptz)
      
  4. Security
    - Enable RLS on consultation_requests
    - Users can view their own consultation requests
    - Owners can view all requests from their organization
*/

-- Add new columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_role text DEFAULT 'owner';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'owned_by'
  ) THEN
    ALTER TABLE profiles ADD COLUMN owned_by uuid REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'trial_start'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_start timestamptz DEFAULT now();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'trial_expired'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_expired boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'demo_mode'
  ) THEN
    ALTER TABLE profiles ADD COLUMN demo_mode boolean DEFAULT false;
  END IF;
END $$;

-- Add new KPI columns to analytics_snapshots table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_snapshots' AND column_name = 'avg_job_revenue'
  ) THEN
    ALTER TABLE analytics_snapshots ADD COLUMN avg_job_revenue numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_snapshots' AND column_name = 'first_time_fix_rate'
  ) THEN
    ALTER TABLE analytics_snapshots ADD COLUMN first_time_fix_rate numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_snapshots' AND column_name = 'avg_response_time'
  ) THEN
    ALTER TABLE analytics_snapshots ADD COLUMN avg_response_time numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_snapshots' AND column_name = 'revenue_per_technician'
  ) THEN
    ALTER TABLE analytics_snapshots ADD COLUMN revenue_per_technician numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_snapshots' AND column_name = 'jobs_per_tech_per_week'
  ) THEN
    ALTER TABLE analytics_snapshots ADD COLUMN jobs_per_tech_per_week numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_snapshots' AND column_name = 'maintenance_completion_rate'
  ) THEN
    ALTER TABLE analytics_snapshots ADD COLUMN maintenance_completion_rate numeric DEFAULT 0;
  END IF;
END $$;

-- Create consultation_requests table
CREATE TABLE IF NOT EXISTS consultation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  message text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consultation requests"
  ON consultation_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert consultation requests"
  ON consultation_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_profiles_owned_by ON profiles(owned_by);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON consultation_requests(status);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_created_at ON consultation_requests(created_at);