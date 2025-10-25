-- ============================================
-- SMARTHVACANALYTICS - BILLING TEST SQL HELPERS
-- ============================================
-- Use these queries to test the post-trial billing flow
-- Test Account: testv8@gmail.com
-- ============================================

-- ============================================
-- 1. CHECK CURRENT STATE
-- ============================================
-- Run this to see the current state of your test account
SELECT
  email,
  company_name,
  plan_tier,
  billing_status,
  stripe_customer_id,
  subscription_id,
  created_at,
  subscription_start,
  subscription_end,
  EXTRACT(DAY FROM (NOW() - created_at)) as days_since_signup,
  CASE
    WHEN stripe_customer_id IS NOT NULL THEN '🟢 Active Paid'
    WHEN EXTRACT(DAY FROM (NOW() - created_at)) < 14 THEN '🟡 Trial Active (' || (14 - EXTRACT(DAY FROM (NOW() - created_at)))::int || ' days left)'
    WHEN EXTRACT(DAY FROM (NOW() - created_at)) BETWEEN 14 AND 18 THEN '🟠 Grace Period (' || (19 - EXTRACT(DAY FROM (NOW() - created_at)))::int || ' days left)'
    ELSE '🔴 Expired'
  END as current_state
FROM profiles
WHERE email = 'testv8@gmail.com';


-- ============================================
-- 2. SIMULATE TRIAL END (ENTER GRACE PERIOD)
-- ============================================
-- This backdates the account to 16 days ago
-- Trial ended on Day 14 (2 days ago)
-- Grace period: 5 days (3 days remaining)
-- Account will deactivate on Day 19

UPDATE profiles
SET
  created_at = NOW() - INTERVAL '16 days',
  billing_status = 'active'
WHERE email = 'testv8@gmail.com'
RETURNING
  email,
  created_at as backdated_to,
  billing_status,
  stripe_customer_id,
  EXTRACT(DAY FROM (NOW() - created_at)) as days_old,
  (19 - EXTRACT(DAY FROM (NOW() - created_at)))::int as grace_days_remaining;


-- ============================================
-- 3. SIMULATE GRACE PERIOD EXPIRING (Day 19)
-- ============================================
-- This backdates to 19 days ago (grace period just expired)
UPDATE profiles
SET
  created_at = NOW() - INTERVAL '19 days',
  billing_status = 'active'
WHERE email = 'testv8@gmail.com'
RETURNING
  email,
  created_at,
  billing_status,
  stripe_customer_id,
  'Grace period expired - urgent setup required' as status;


-- ============================================
-- 4. SIMULATE SUCCESSFUL PAYMENT
-- ============================================
-- This simulates what happens after Stripe checkout completes
UPDATE profiles
SET
  billing_status = 'active',
  stripe_customer_id = 'cus_test_simulation_v8',
  subscription_id = 'sub_test_simulation_v8',
  subscription_start = NOW(),
  subscription_end = NOW() + INTERVAL '30 days'
WHERE email = 'testv8@gmail.com'
RETURNING
  email,
  billing_status,
  stripe_customer_id,
  subscription_id,
  subscription_start,
  subscription_end,
  EXTRACT(DAY FROM (subscription_end - NOW()))::int as days_until_renewal;


-- ============================================
-- 5. RESET TO FRESH TRIAL STATE
-- ============================================
-- Use this to reset the test account for retesting
UPDATE profiles
SET
  billing_status = 'trialing',
  stripe_customer_id = NULL,
  subscription_id = NULL,
  subscription_start = NULL,
  subscription_end = NULL,
  created_at = NOW()
WHERE email = 'testv8@gmail.com'
RETURNING
  email,
  billing_status,
  created_at,
  'Account reset to fresh trial' as status;


-- ============================================
-- 6. VIEW ALL TEST ACCOUNTS
-- ============================================
-- Shows all test accounts for comparison
SELECT
  email,
  company_name,
  billing_status,
  stripe_customer_id IS NOT NULL as has_payment,
  EXTRACT(DAY FROM (NOW() - created_at))::int as age_days,
  created_at,
  CASE
    WHEN stripe_customer_id IS NOT NULL THEN 'Paid'
    WHEN EXTRACT(DAY FROM (NOW() - created_at)) < 14 THEN 'Trial'
    WHEN EXTRACT(DAY FROM (NOW() - created_at)) < 19 THEN 'Grace'
    ELSE 'Expired'
  END as state
FROM profiles
WHERE email LIKE 'testv%@gmail.com'
ORDER BY created_at DESC;


-- ============================================
-- 7. DELETE TEST ACCOUNT
-- ============================================
-- WARNING: This will permanently delete the test account
-- Uncomment the lines below to execute

-- DELETE FROM profiles WHERE email = 'testv8@gmail.com';
-- If you have access to auth.users:
-- DELETE FROM auth.users WHERE email = 'testv8@gmail.com';


-- ============================================
-- 8. CHECK BILLING STATUS CALCULATION
-- ============================================
-- This shows exactly how the billing status is calculated
SELECT
  email,
  created_at,
  created_at + INTERVAL '14 days' as trial_end_date,
  created_at + INTERVAL '19 days' as grace_end_date,
  NOW() as current_time,
  NOW() > (created_at + INTERVAL '14 days') as trial_has_ended,
  NOW() < (created_at + INTERVAL '19 days') as within_grace_period,
  EXTRACT(DAY FROM ((created_at + INTERVAL '19 days') - NOW()))::int as grace_days_remaining,
  stripe_customer_id IS NULL as needs_payment,
  billing_status,
  CASE
    WHEN stripe_customer_id IS NOT NULL THEN
      '✅ No action needed - paid subscription active'
    WHEN NOW() < (created_at + INTERVAL '14 days') THEN
      '🟢 Trial active - ' || (14 - EXTRACT(DAY FROM (NOW() - created_at)))::int || ' days remaining'
    WHEN NOW() < (created_at + INTERVAL '19 days') THEN
      '⚠️  Grace period - ' || EXTRACT(DAY FROM ((created_at + INTERVAL '19 days') - NOW()))::int || ' days to add payment'
    ELSE
      '🔴 Grace period expired - urgent action required'
  END as user_message
FROM profiles
WHERE email = 'testv8@gmail.com';


-- ============================================
-- 9. SIMULATE DIFFERENT DAYS FOR TESTING
-- ============================================

-- Day 1 (Fresh trial)
-- UPDATE profiles SET created_at = NOW() WHERE email = 'testv8@gmail.com';

-- Day 7 (Mid-trial)
-- UPDATE profiles SET created_at = NOW() - INTERVAL '7 days' WHERE email = 'testv8@gmail.com';

-- Day 14 (Trial just ended)
-- UPDATE profiles SET created_at = NOW() - INTERVAL '14 days', billing_status = 'active' WHERE email = 'testv8@gmail.com';

-- Day 16 (Grace period: 3 days left)
-- UPDATE profiles SET created_at = NOW() - INTERVAL '16 days', billing_status = 'active' WHERE email = 'testv8@gmail.com';

-- Day 18 (Grace period: 1 day left)
-- UPDATE profiles SET created_at = NOW() - INTERVAL '18 days', billing_status = 'active' WHERE email = 'testv8@gmail.com';

-- Day 19 (Grace period expired)
-- UPDATE profiles SET created_at = NOW() - INTERVAL '19 days', billing_status = 'active' WHERE email = 'testv8@gmail.com';

-- Day 20+ (Long expired)
-- UPDATE profiles SET created_at = NOW() - INTERVAL '25 days', billing_status = 'active' WHERE email = 'testv8@gmail.com';


-- ============================================
-- 10. VERIFY WEBHOOK PROCESSED CORRECTLY
-- ============================================
-- After completing a real Stripe checkout, verify the webhook updated the database
SELECT
  email,
  billing_status,
  stripe_customer_id,
  subscription_id,
  subscription_start,
  subscription_end,
  CASE
    WHEN stripe_customer_id IS NULL THEN '❌ Webhook did not update customer_id'
    WHEN subscription_id IS NULL THEN '❌ Webhook did not update subscription_id'
    WHEN billing_status != 'active' THEN '⚠️  Billing status not set to active'
    WHEN subscription_end IS NULL THEN '⚠️  Subscription end date not set'
    ELSE '✅ Webhook processed successfully'
  END as webhook_status,
  EXTRACT(DAY FROM (subscription_end - NOW()))::int as days_until_renewal
FROM profiles
WHERE email = 'testv8@gmail.com';


-- ============================================
-- QUICK TEST SEQUENCE
-- ============================================
-- Copy and paste these in order for a quick test:

-- 1. Check initial state
-- SELECT email, billing_status, stripe_customer_id, EXTRACT(DAY FROM (NOW() - created_at))::int as age FROM profiles WHERE email = 'testv8@gmail.com';

-- 2. End trial (enter grace period)
-- UPDATE profiles SET created_at = NOW() - INTERVAL '16 days', billing_status = 'active' WHERE email = 'testv8@gmail.com' RETURNING email, billing_status, stripe_customer_id;

-- 3. Check expected UI state
-- SELECT CASE WHEN stripe_customer_id IS NULL AND billing_status = 'active' AND EXTRACT(DAY FROM (NOW() - created_at)) > 14 THEN '✅ Should show orange alert banner' ELSE '❌ Alert should not appear' END as expected_ui FROM profiles WHERE email = 'testv8@gmail.com';

-- 4. Simulate payment
-- UPDATE profiles SET stripe_customer_id = 'cus_test_v8', subscription_id = 'sub_test_v8', subscription_start = NOW(), subscription_end = NOW() + INTERVAL '30 days' WHERE email = 'testv8@gmail.com' RETURNING email, stripe_customer_id;

-- 5. Check expected UI state after payment
-- SELECT CASE WHEN stripe_customer_id IS NOT NULL THEN '✅ Alert should be hidden, Manage Billing button visible' ELSE '❌ Still needs setup' END as expected_ui FROM profiles WHERE email = 'testv8@gmail.com';

-- 6. Reset for next test
-- UPDATE profiles SET billing_status = 'trialing', stripe_customer_id = NULL, subscription_id = NULL, subscription_start = NULL, subscription_end = NULL, created_at = NOW() WHERE email = 'testv8@gmail.com';
