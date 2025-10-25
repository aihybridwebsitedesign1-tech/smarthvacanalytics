/*
  # Initial HVAC KPI Tracker Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `company_name` (text)
      - `technician_count` (integer)
      - `plan_tier` (text) - starter, growth, or pro
      - `trial_end_date` (timestamptz)
      - `theme_preference` (text) - light or dark
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `plans`
      - `id` (uuid, primary key)
      - `name` (text) - Starter, Growth, Pro
      - `slug` (text) - starter, growth, pro
      - `price_monthly` (integer) - price in cents
      - `max_technicians` (integer)
      - `analytics_days_limit` (text[]) - available time ranges
      - `can_export_reports` (boolean)
      - `support_level` (text)
      - `created_at` (timestamptz)
    
    - `technicians`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `status` (text) - active, inactive
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `jobs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `technician_id` (uuid, references technicians)
      - `title` (text)
      - `client_name` (text)
      - `client_address` (text)
      - `job_date` (date)
      - `hours_spent` (numeric)
      - `revenue` (numeric)
      - `cost` (numeric)
      - `status` (text) - scheduled, in_progress, completed, cancelled
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `analytics_snapshots`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `snapshot_date` (date)
      - `total_revenue` (numeric)
      - `total_jobs` (integer)
      - `avg_hours_per_job` (numeric)
      - `gross_margin` (numeric)
      - `created_at` (timestamptz)
    
    - `recommendations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `category` (text) - efficiency, revenue, scheduling, training
      - `priority` (text) - low, medium, high
      - `is_read` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Users can only read/write their own profiles, jobs, technicians, analytics, and recommendations
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  company_name text NOT NULL,
  technician_count integer DEFAULT 0,
  plan_tier text DEFAULT 'starter',
  trial_end_date timestamptz DEFAULT (now() + interval '14 days'),
  theme_preference text DEFAULT 'light',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  price_monthly integer NOT NULL,
  max_technicians integer,
  analytics_days_limit text[] DEFAULT ARRAY['7d', '30d'],
  can_export_reports boolean DEFAULT false,
  support_level text DEFAULT 'email',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans are viewable by everyone"
  ON plans FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS technicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own technicians"
  ON technicians FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own technicians"
  ON technicians FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own technicians"
  ON technicians FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own technicians"
  ON technicians FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  technician_id uuid REFERENCES technicians(id) ON DELETE SET NULL,
  title text NOT NULL,
  client_name text NOT NULL,
  client_address text,
  job_date date NOT NULL,
  hours_spent numeric DEFAULT 0,
  revenue numeric DEFAULT 0,
  cost numeric DEFAULT 0,
  status text DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL,
  total_revenue numeric DEFAULT 0,
  total_jobs integer DEFAULT 0,
  avg_hours_per_job numeric DEFAULT 0,
  gross_margin numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);

ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
  ON analytics_snapshots FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON analytics_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text DEFAULT 'efficiency',
  priority text DEFAULT 'medium',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
  ON recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON recommendations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

INSERT INTO plans (name, slug, price_monthly, max_technicians, analytics_days_limit, can_export_reports, support_level)
VALUES 
  ('Starter', 'starter', 4900, 3, ARRAY['7d', '30d'], false, 'email'),
  ('Growth', 'growth', 9900, 10, ARRAY['7d', '30d', '3m', '6m', '1y'], true, 'priority'),
  ('Pro', 'pro', 19900, NULL, ARRAY['7d', '30d', '3m', '6m', '1y'], true, 'dedicated')
ON CONFLICT (slug) DO NOTHING;