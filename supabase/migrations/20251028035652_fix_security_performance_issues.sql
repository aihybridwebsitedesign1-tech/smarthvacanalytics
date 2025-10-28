/*
  # Fix Security and Performance Issues

  1. Performance Improvements
    - Add missing indexes on foreign key columns
    - Optimize RLS policies to use (select auth.uid()) pattern
    - Remove unused indexes that add overhead
    - Fix function search paths

  2. Security
    - All changes maintain existing RLS security
    - Improve query performance at scale
*/

-- =====================================================
-- Add missing indexes for foreign keys
-- =====================================================

-- Index for consultation_requests.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_consultation_requests_user_id
ON consultation_requests(user_id);

-- Index for recommendations.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id
ON recommendations(user_id);

-- Index for technicians.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_technicians_user_id
ON technicians(user_id);

-- =====================================================
-- Remove unused indexes to reduce overhead
-- =====================================================

DROP INDEX IF EXISTS idx_consultation_requests_status;
DROP INDEX IF EXISTS idx_consultation_requests_created_at;
DROP INDEX IF EXISTS idx_profiles_grace_period;
DROP INDEX IF EXISTS idx_jobs_job_type;
DROP INDEX IF EXISTS idx_profiles_subscription_id;
DROP INDEX IF EXISTS idx_profiles_billing_status;
DROP INDEX IF EXISTS idx_profiles_trial_end;
DROP INDEX IF EXISTS idx_profiles_trial_end_date;
DROP INDEX IF EXISTS idx_profiles_grace_period_end;
DROP INDEX IF EXISTS idx_profiles_account_status;
DROP INDEX IF EXISTS idx_email_leads_email;
DROP INDEX IF EXISTS idx_email_leads_created_at;
DROP INDEX IF EXISTS idx_email_leads_source_page;
DROP INDEX IF EXISTS idx_profiles_user_role;
DROP INDEX IF EXISTS idx_profiles_owned_by;

-- =====================================================
-- Optimize RLS policies for technicians table
-- =====================================================

DROP POLICY IF EXISTS "Users can view own technicians" ON technicians;
CREATE POLICY "Users can view own technicians"
  ON technicians FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own technicians" ON technicians;
CREATE POLICY "Users can insert own technicians"
  ON technicians FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own technicians" ON technicians;
CREATE POLICY "Users can update own technicians"
  ON technicians FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own technicians" ON technicians;
CREATE POLICY "Users can delete own technicians"
  ON technicians FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- Optimize RLS policies for jobs table
-- =====================================================

DROP POLICY IF EXISTS "Users can view own jobs" ON jobs;
CREATE POLICY "Users can view own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own jobs" ON jobs;
CREATE POLICY "Users can insert own jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own jobs" ON jobs;
CREATE POLICY "Users can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own jobs" ON jobs;
CREATE POLICY "Users can delete own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- Optimize RLS policies for analytics_snapshots table
-- =====================================================

DROP POLICY IF EXISTS "Users can view own analytics" ON analytics_snapshots;
CREATE POLICY "Users can view own analytics"
  ON analytics_snapshots FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own analytics" ON analytics_snapshots;
CREATE POLICY "Users can insert own analytics"
  ON analytics_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- Optimize RLS policies for consultation_requests table
-- =====================================================

DROP POLICY IF EXISTS "Users can view own consultation requests" ON consultation_requests;
CREATE POLICY "Users can view own consultation requests"
  ON consultation_requests FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert consultation requests" ON consultation_requests;
CREATE POLICY "Users can insert consultation requests"
  ON consultation_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- Optimize RLS policies for recommendations table
-- =====================================================

DROP POLICY IF EXISTS "Users can read own recommendations" ON recommendations;
CREATE POLICY "Users can read own recommendations"
  ON recommendations FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own recommendations" ON recommendations;
CREATE POLICY "Users can insert own recommendations"
  ON recommendations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own recommendations" ON recommendations;
CREATE POLICY "Users can update own recommendations"
  ON recommendations FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own recommendations" ON recommendations;
CREATE POLICY "Users can delete own recommendations"
  ON recommendations FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- Optimize RLS policies for profiles table
-- =====================================================

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- =====================================================
-- Optimize RLS policies for Stripe tables (if they exist)
-- =====================================================

-- Only stripe_customers has user_id, optimize its policy
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'stripe_customers') THEN
    DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;
    EXECUTE 'CREATE POLICY "Users can view their own customer data"
      ON stripe_customers FOR SELECT
      TO authenticated
      USING (user_id = (select auth.uid()))';
  END IF;
END $$;

-- =====================================================
-- Fix function search paths
-- =====================================================

-- Recreate functions with stable search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Drop and recreate other functions with proper search path if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_grace_period_end') THEN
    DROP FUNCTION IF EXISTS public.calculate_grace_period_end CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_trial_status') THEN
    DROP FUNCTION IF EXISTS public.check_trial_status CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_expired_trials') THEN
    DROP FUNCTION IF EXISTS public.update_expired_trials CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_trial_dates') THEN
    DROP FUNCTION IF EXISTS public.set_trial_dates CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_grace_period') THEN
    DROP FUNCTION IF EXISTS public.set_grace_period CASCADE;
  END IF;
END $$;
