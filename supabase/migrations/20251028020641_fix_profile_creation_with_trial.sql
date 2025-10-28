/*
  # Fix Profile Creation to Include Trial Dates

  1. Changes
    - Update handle_new_user() function to explicitly set trial_end_date and billing_status
    - Ensure new profiles are created with proper trial configuration
    - Set trial_days, billing_status='trialing', and account_status='active'

  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - Only creates profiles, doesn't modify existing data
*/

-- Drop and recreate the handle_new_user function with trial date logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert a complete profile for the new user with trial dates
  -- This function runs with SECURITY DEFINER so it bypasses RLS
  INSERT INTO public.profiles (
    id, 
    email, 
    company_name, 
    technician_count,
    plan_tier, 
    user_role, 
    demo_mode,
    trial_days,
    trial_end_date,
    billing_status,
    account_status
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company'),
    COALESCE((NEW.raw_user_meta_data->>'technician_count')::integer, 1),
    COALESCE(NEW.raw_user_meta_data->>'plan_tier', 'starter'),
    'owner',
    true,
    14,
    NOW() + INTERVAL '14 days',
    'trialing',
    'active'
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth.users insert
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;
