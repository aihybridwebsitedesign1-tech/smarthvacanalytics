/*
  # Update trigger to include technician_count from metadata
  
  1. Changes
    - Update handle_new_user() to read technician_count from metadata
    - Ensures complete profile is created in one operation
  
  2. Notes
    - Trigger has SECURITY DEFINER so it bypasses RLS
    - All data comes from signup metadata
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert a complete profile for the new user
  INSERT INTO public.profiles (
    id, 
    email, 
    company_name, 
    technician_count,
    plan_tier, 
    user_role, 
    demo_mode
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company'),
    COALESCE((NEW.raw_user_meta_data->>'technician_count')::integer, 1),
    COALESCE(NEW.raw_user_meta_data->>'plan_tier', 'starter'),
    'owner',
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
