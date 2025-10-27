/*
  # Re-enable RLS on Profiles Table

  1. Security Changes
    - Re-enable Row Level Security on profiles table
    - RLS was previously disabled which caused signup failures
    - This ensures all profile access goes through proper security policies

  2. Notes
    - The trigger `create_profile_on_signup` uses `security definer` so it will bypass RLS
    - All other access must go through the existing RLS policies
*/

-- Re-enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;