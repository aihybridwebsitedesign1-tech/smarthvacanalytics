/*
  # Fix Recommendations Table RLS Policies

  1. Changes
    - Add INSERT policy for recommendations table
    - Add DELETE policy for recommendations table
    - Ensure users can manage their own recommendations
    
  2. Security
    - Users can only insert recommendations with their own user_id
    - Users can only read, update, and delete their own recommendations
    - All policies check auth.uid() = user_id for security
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view own recommendations" ON recommendations;
DROP POLICY IF EXISTS "Users can update own recommendations" ON recommendations;

-- Create comprehensive policies for all operations
CREATE POLICY "Users can read own recommendations"
  ON recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
  ON recommendations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON recommendations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recommendations"
  ON recommendations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);