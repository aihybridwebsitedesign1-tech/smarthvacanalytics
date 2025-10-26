/*
  # Fix profile creation to bypass RLS during trigger
  
  1. Changes
    - Update the handle_new_user() function to use SECURITY DEFINER with proper grants
    - This allows the trigger to insert into profiles table bypassing RLS
    - Add explicit grant to service role for inserting profiles
  
  2. Security
    - Function runs with elevated privileges (SECURITY DEFINER)
    - Only triggered by auth.users INSERT (safe context)
    - Still maintains RLS for all other profile operations
*/

-- Drop and recreate the function with proper security context
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert a new profile for the new user
  -- This runs with SECURITY DEFINER so it bypasses RLS
  INSERT INTO public.profiles (id, email, company_name, plan_tier, user_role, demo_mode)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company'),
    COALESCE(NEW.raw_user_meta_data->>'plan_tier', 'starter'),
    'owner',
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;
