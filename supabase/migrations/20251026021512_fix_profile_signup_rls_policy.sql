/*
  # Fix Profile Insert Policy for New User Signups
  
  ## Problem
  When users sign up, the profile insert fails with "new row violates row-level security policy"
  because the RLS policy checks auth.uid() = id, but the session might not be fully established
  immediately after auth.signUp().
  
  ## Solution
  Drop the existing INSERT policy and create a new one that allows authenticated users
  to insert a profile row where the id matches their auth.uid().
  
  ## Security
  - Users can ONLY insert profiles with their own auth.uid() as the id
  - Cannot create profiles for other users
  - All data remains secure and isolated per user
  - Other policies (SELECT, UPDATE) remain unchanged
*/

-- Drop all existing INSERT policies on profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to create profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can create their own profile" ON profiles;

-- Create a single, clear INSERT policy
-- This allows authenticated users to create a profile with their own user ID
CREATE POLICY "Enable insert for authenticated users creating own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);