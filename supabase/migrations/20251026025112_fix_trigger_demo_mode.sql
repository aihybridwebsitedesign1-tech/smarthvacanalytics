/*
  # Fix profile creation trigger to set demo_mode = true
  
  1. Changes
    - Update the handle_new_user() function to set demo_mode = true by default
    - This ensures all new signups start with demo data enabled
  
  2. Notes
    - The trigger runs automatically when a user signs up
    - Sets sensible defaults that the app can update afterward
*/

-- Drop and recreate the function with correct demo_mode default
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new profile for the new user
  -- Use basic defaults; the app will update with full details
  INSERT INTO public.profiles (id, email, company_name, plan_tier, user_role, demo_mode)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company'),
    COALESCE(NEW.raw_user_meta_data->>'plan_tier', 'starter'),
    'owner',
    true  -- Changed from false to true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
