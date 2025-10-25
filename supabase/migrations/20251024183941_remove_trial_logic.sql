/*
  # Remove Trial Logic and Update Billing

  This migration removes the trial period functionality and ensures 
  users must have active Stripe subscriptions to use the platform.

  ## Changes
  
  1. Update profiles table
    - Set billing_status to 'inactive' for users without stripe_customer_id
    - Remove trial_start and trial_expired columns (optional for cleanup)
  
  2. Security
    - Users must have active billing status to access features
    - No trial period - payment required upfront
*/

-- Update billing status for users without payment method
UPDATE profiles 
SET billing_status = 'inactive' 
WHERE stripe_customer_id IS NULL 
  AND billing_status != 'inactive';

-- Optional: Remove trial-related columns if you want to clean up the schema
-- Uncomment these lines if you want to permanently remove trial tracking columns
-- ALTER TABLE profiles DROP COLUMN IF EXISTS trial_start;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS trial_expired;
