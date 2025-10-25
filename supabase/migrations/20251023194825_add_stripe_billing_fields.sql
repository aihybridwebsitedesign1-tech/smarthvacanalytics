/*
  # Add Stripe Billing Fields to Profiles
  
  1. Schema Changes
    - Add `billing_status` (text): active, trialing, past_due, canceled, etc.
    - Add `subscription_id` (text): Stripe subscription ID
    - Add `stripe_customer_id` (text): Stripe customer ID
    - Add `subscription_start` (timestamptz): When subscription started
    - Add `subscription_end` (timestamptz): When subscription ends/renews
    
  2. Plan Tier Update
    - Update plan_tier default to 'starter'
    - Ensure trial_end_date is set to 14 days from now for new signups
*/

-- Add Stripe-related columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS billing_status text DEFAULT 'trialing',
ADD COLUMN IF NOT EXISTS subscription_id text,
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS subscription_start timestamptz,
ADD COLUMN IF NOT EXISTS subscription_end timestamptz;

-- Update default plan tier if not set
ALTER TABLE profiles 
ALTER COLUMN plan_tier SET DEFAULT 'starter';

-- Create index for faster subscription lookups
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_id ON profiles(subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_billing_status ON profiles(billing_status);
