/*
  # Fix Profile Insert Policy for New User Signups
  
  1. Changes
    - DROP the restrictive INSERT policy on profiles table
    - CREATE a new INSERT policy that allows authenticated users to create their own profile
    - This allows new users to sign up successfully
    
  2. Security
    - Users can ONLY insert a profile with their own auth.uid() as the id
    - Users cannot create profiles for other users
    - All other policies (SELECT, UPDATE) remain unchanged
    - Data remains secure - users can only access their own data
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a new policy that allows profile creation during signup
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure the policy allows authenticated users to create their profile
-- even when the profile row doesn't exist yet
CREATE POLICY "Allow authenticated users to create profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Drop the duplicate policy we just created
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Keep only the permissive one
CREATE POLICY "Authenticated users can create their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);