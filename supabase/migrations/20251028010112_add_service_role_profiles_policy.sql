/*
  # Add Service Role Policy for Profiles

  1. Purpose
    - Allow service role to access all profiles (bypasses RLS by default)
    - Ensures API routes with service role key can perform operations
    - Fixes "Profile not found" errors in API routes

  2. Changes
    - Add explicit policy for service role to access all profiles
    - This is a safety measure as service role should bypass RLS anyway

  3. Security
    - Service role key is only available server-side
    - Regular users still restricted by existing RLS policies
*/

-- Drop existing service role policies if they exist
DROP POLICY IF EXISTS "Service role can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can update all profiles" ON profiles;

-- Create policy for service role to access all profiles (SELECT)
CREATE POLICY "Service role can read all profiles"
  ON profiles
  FOR SELECT
  TO service_role
  USING (true);

-- Create policy for service role to update all profiles
CREATE POLICY "Service role can update all profiles"
  ON profiles
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions to service role
GRANT SELECT, UPDATE ON profiles TO service_role;
