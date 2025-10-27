/*
  # Restore RLS Policies for Profiles Table

  1. Problem
    - RLS was re-enabled but policies were never recreated
    - This blocks all profile access with "violates row-level security policy" error

  2. Solution
    - Recreate the essential RLS policies
    - Allow users to read and update their own profiles
    - Allow inserts during signup (for trigger)

  3. Security
    - Users can only access their own profile data
    - Trigger can create profiles using SECURITY DEFINER
    - All operations check auth.uid()
*/

-- Drop any existing policies (safety check)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create policy for SELECT (users can read their own profile)
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create policy for UPDATE (users can update their own profile)
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create policy for INSERT (users can create their own profile during signup)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Verify RLS is enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'profiles' 
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS is not enabled on profiles table!';
  END IF;
  
  RAISE NOTICE 'SUCCESS: RLS policies restored on profiles table';
END $$;
