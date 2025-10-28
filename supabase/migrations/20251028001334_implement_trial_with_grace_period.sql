/*
  # Implement 14-Day Free Trial with 48-Hour Grace Period

  ## Overview
  This migration implements a complete 14-day free trial system with automatic
  grace period tracking and account suspension enforcement.

  ## Changes

  1. New Tables
    - None (using existing profiles table)

  2. Schema Updates
    - Add `grace_period_end` (timestamptz): Tracks when grace period expires
    - Add `account_status` (text): active, suspended - separate from billing_status
    - Add `last_payment_reminder` (timestamptz): Tracks when last reminder was sent
    - Add `trial_days` (integer): Configurable trial length (default 14)
    - Update `billing_status` to properly track trial phases

  3. Functions
    - `calculate_grace_period_end()`: Automatically calculates grace period end date
    - `check_trial_status()`: Returns current trial phase for a user
    - `update_expired_trials()`: Background job to suspend expired accounts

  4. Triggers
    - Auto-set trial_end_date on profile creation
    - Auto-calculate grace_period_end when trial expires

  5. Indexes
    - Add index on trial_end_date for efficient expiration checks
    - Add index on grace_period_end for grace period queries
    - Add index on account_status for suspended account lookups

  6. Security
    - RLS policies remain unchanged
    - All trial calculations use database functions for consistency
    - No user can manually override trial dates via RLS
*/

-- Add new columns for trial and grace period tracking
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS grace_period_end timestamptz,
ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'active' CHECK (account_status IN ('active', 'suspended')),
ADD COLUMN IF NOT EXISTS last_payment_reminder timestamptz,
ADD COLUMN IF NOT EXISTS trial_days integer DEFAULT 14;

-- Ensure trial_end_date is always set correctly (14 days from creation)
UPDATE profiles
SET trial_end_date = created_at + INTERVAL '14 days'
WHERE trial_end_date IS NULL OR trial_end_date < created_at;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_trial_end_date ON profiles(trial_end_date);
CREATE INDEX IF NOT EXISTS idx_profiles_grace_period_end ON profiles(grace_period_end);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);

-- Function to calculate grace period end (48 hours after trial ends)
CREATE OR REPLACE FUNCTION calculate_grace_period_end(trial_end timestamptz)
RETURNS timestamptz
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN trial_end + INTERVAL '48 hours';
END;
$$;

-- Function to get trial status for a user
CREATE OR REPLACE FUNCTION check_trial_status(user_id uuid)
RETURNS TABLE (
  phase text,
  days_remaining numeric,
  hours_remaining numeric,
  is_expired boolean,
  should_show_countdown boolean
)
LANGUAGE plpgsql
AS $$
DECLARE
  profile_record RECORD;
  now_time timestamptz := NOW();
  time_until_trial_end interval;
  time_until_grace_end interval;
BEGIN
  SELECT * INTO profile_record
  FROM profiles
  WHERE id = user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT
      'not_found'::text,
      0::numeric,
      0::numeric,
      true,
      false;
    RETURN;
  END IF;

  -- If user has paid (has stripe_customer_id and billing_status = active)
  IF profile_record.stripe_customer_id IS NOT NULL
     AND profile_record.billing_status = 'active' THEN
    RETURN QUERY SELECT
      'paid'::text,
      0::numeric,
      0::numeric,
      false,
      false;
    RETURN;
  END IF;

  time_until_trial_end := profile_record.trial_end_date - now_time;

  -- Trial is active (more than 72 hours remaining)
  IF time_until_trial_end > INTERVAL '72 hours' THEN
    RETURN QUERY SELECT
      'trial_active'::text,
      EXTRACT(EPOCH FROM time_until_trial_end) / 86400,
      EXTRACT(EPOCH FROM time_until_trial_end) / 3600,
      false,
      false;
    RETURN;
  END IF;

  -- Trial countdown phase (72 hours or less remaining)
  IF time_until_trial_end > INTERVAL '0 hours' THEN
    RETURN QUERY SELECT
      'trial_countdown'::text,
      EXTRACT(EPOCH FROM time_until_trial_end) / 86400,
      EXTRACT(EPOCH FROM time_until_trial_end) / 3600,
      false,
      true;
    RETURN;
  END IF;

  -- Calculate grace period if trial has ended
  IF profile_record.grace_period_end IS NULL THEN
    -- Grace period hasn't been initialized yet
    time_until_grace_end := (profile_record.trial_end_date + INTERVAL '48 hours') - now_time;
  ELSE
    time_until_grace_end := profile_record.grace_period_end - now_time;
  END IF;

  -- Grace period is active (trial ended, but within 48 hours)
  IF time_until_grace_end > INTERVAL '0 hours' THEN
    RETURN QUERY SELECT
      'grace_period'::text,
      EXTRACT(EPOCH FROM time_until_grace_end) / 86400,
      EXTRACT(EPOCH FROM time_until_grace_end) / 3600,
      false,
      true;
    RETURN;
  END IF;

  -- Grace period has expired - account should be suspended
  RETURN QUERY SELECT
    'expired'::text,
    0::numeric,
    0::numeric,
    true,
    false;
  RETURN;
END;
$$;

-- Function to update expired trials (can be called by cron job or manually)
CREATE OR REPLACE FUNCTION update_expired_trials()
RETURNS TABLE (
  updated_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rows_updated integer;
BEGIN
  -- Set grace_period_end for trials that just ended
  UPDATE profiles
  SET grace_period_end = calculate_grace_period_end(trial_end_date)
  WHERE trial_end_date < NOW()
    AND grace_period_end IS NULL
    AND billing_status = 'trialing'
    AND stripe_customer_id IS NULL;

  -- Update billing status for accounts in grace period
  UPDATE profiles
  SET billing_status = 'grace_period'
  WHERE trial_end_date < NOW()
    AND grace_period_end > NOW()
    AND billing_status = 'trialing'
    AND stripe_customer_id IS NULL;

  -- Suspend accounts where grace period has expired
  UPDATE profiles
  SET
    account_status = 'suspended',
    billing_status = 'suspended'
  WHERE grace_period_end < NOW()
    AND account_status = 'active'
    AND stripe_customer_id IS NULL;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;

  RETURN QUERY SELECT rows_updated;
END;
$$;

-- Trigger to automatically set trial dates on new profile creation
CREATE OR REPLACE FUNCTION set_trial_dates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set trial_end_date to 14 days from now (or custom trial_days)
  IF NEW.trial_end_date IS NULL THEN
    NEW.trial_end_date := NOW() + (NEW.trial_days || ' days')::interval;
  END IF;

  -- Ensure billing_status is trialing for new accounts
  IF NEW.billing_status IS NULL AND NEW.stripe_customer_id IS NULL THEN
    NEW.billing_status := 'trialing';
  END IF;

  -- Ensure account_status is active for new accounts
  IF NEW.account_status IS NULL THEN
    NEW.account_status := 'active';
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists and recreate
DROP TRIGGER IF EXISTS set_trial_dates_trigger ON profiles;
CREATE TRIGGER set_trial_dates_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_trial_dates();

-- Trigger to automatically set grace_period_end when trial expires
CREATE OR REPLACE FUNCTION set_grace_period()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If trial has ended and no payment method exists, set grace period
  IF NEW.trial_end_date < NOW()
     AND NEW.stripe_customer_id IS NULL
     AND NEW.grace_period_end IS NULL
     AND OLD.grace_period_end IS NULL THEN
    NEW.grace_period_end := calculate_grace_period_end(NEW.trial_end_date);
    NEW.billing_status := 'grace_period';
  END IF;

  -- If payment method is added, clear grace period and activate
  IF NEW.stripe_customer_id IS NOT NULL
     AND OLD.stripe_customer_id IS NULL THEN
    NEW.account_status := 'active';
    NEW.billing_status := 'active';
    NEW.grace_period_end := NULL;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists and recreate
DROP TRIGGER IF EXISTS set_grace_period_trigger ON profiles;
CREATE TRIGGER set_grace_period_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_grace_period();

-- Create a comment explaining the trial system
COMMENT ON COLUMN profiles.trial_end_date IS 'Date when the 14-day free trial ends';
COMMENT ON COLUMN profiles.grace_period_end IS 'Date when the 48-hour grace period ends (set automatically when trial expires)';
COMMENT ON COLUMN profiles.account_status IS 'Account access status: active (can access dashboard) or suspended (blocked)';
COMMENT ON COLUMN profiles.trial_days IS 'Number of days for trial period (default 14, configurable per user)';
COMMENT ON COLUMN profiles.last_payment_reminder IS 'Timestamp of last payment reminder email sent';

-- Verify the migration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'grace_period_end'
  ) THEN
    RAISE EXCEPTION 'Migration failed: grace_period_end column not created';
  END IF;

  RAISE NOTICE 'SUCCESS: Trial and grace period system implemented';
  RAISE NOTICE 'Trial period: 14 days';
  RAISE NOTICE 'Grace period: 48 hours after trial ends';
  RAISE NOTICE 'Countdown shows: when 72 hours or less remain';
END $$;
