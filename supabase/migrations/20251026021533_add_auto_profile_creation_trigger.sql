/*
  # Add Automatic Profile Creation Trigger
  
  ## Problem
  Profile creation fails during signup due to RLS policy timing issues.
  The session might not be fully established when trying to insert the profile.
  
  ## Solution
  Create a database trigger that automatically creates a profile row
  when a new user is created in auth.users. This bypasses RLS entirely
  and is the recommended Supabase pattern for profile creation.
  
  ## How it works
  1. User signs up via supabase.auth.signUp()
  2. Trigger detects new row in auth.users
  3. Trigger automatically creates profile with basic defaults
  4. Application can then update the profile with additional details
  
  ## Security
  - Trigger runs with elevated privileges (bypasses RLS)
  - Only creates profile for the new user (uses NEW.id)
  - Users can still only read/update their own profile via RLS
  - All user data remains secure and isolated
*/

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
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
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that fires when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;