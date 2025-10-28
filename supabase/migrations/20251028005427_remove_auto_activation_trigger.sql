/*
  # Remove Auto-Activation Trigger

  1. Purpose
    - Remove the auto-activation trigger that bypasses the 14-day free trial
    - All users should start with a proper 14-day trial regardless of plan tier
    - Payment method and subscription activation should only happen after trial when user adds billing

  2. Changes
    - Drop auto_activate_paid_plan trigger and function
    - Drop auto_activate_plan_upgrade trigger and function
    - Ensure all new signups start with billing_status='trialing'

  3. Impact
    - All new users will now properly experience the 14-day free trial
    - No fake Stripe IDs will be generated during signup
    - Users must add payment method after trial ends or when they choose to
*/

-- Drop the triggers
DROP TRIGGER IF EXISTS trigger_auto_activate_paid_plan ON profiles;
DROP TRIGGER IF EXISTS trigger_auto_activate_plan_upgrade ON profiles;

-- Drop the functions
DROP FUNCTION IF EXISTS auto_activate_paid_plan();
DROP FUNCTION IF EXISTS auto_activate_plan_upgrade();
