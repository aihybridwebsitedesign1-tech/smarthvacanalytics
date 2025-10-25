-- Simulate Trial End for testv7@gmail.com
-- This script simulates what happens when a Stripe trial ends

-- First, let's see the current state
SELECT
  id,
  email,
  company_name,
  plan_tier,
  billing_status,
  subscription_id,
  stripe_customer_id,
  subscription_start,
  subscription_end
FROM profiles
WHERE email = 'testv7@gmail.com';

-- Update the profile to simulate an active subscription (trial ended)
UPDATE profiles
SET
  billing_status = 'active',
  subscription_id = 'sub_test_simulation_' || id,
  stripe_customer_id = 'cus_test_simulation_' || id,
  subscription_start = NOW(),
  subscription_end = NOW() + INTERVAL '30 days'
WHERE email = 'testv7@gmail.com';

-- Verify the update
SELECT
  id,
  email,
  company_name,
  plan_tier,
  billing_status,
  subscription_id,
  stripe_customer_id,
  subscription_start,
  subscription_end
FROM profiles
WHERE email = 'testv7@gmail.com';
