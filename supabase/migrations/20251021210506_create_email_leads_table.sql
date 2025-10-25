/*
  # Create email_leads table for lead magnet capture

  1. New Tables
    - `email_leads`
      - `id` (uuid, primary key) - Unique identifier for each lead
      - `email` (text, unique, not null) - Email address of the lead
      - `source_page` (text, not null) - Page where the lead was captured (e.g., 'how-it-works')
      - `created_at` (timestamptz, default now()) - Timestamp when lead was captured
      - `status` (text, default 'active') - Status of the lead (active, unsubscribed)
      - `lead_magnet` (text) - Optional field for which lead magnet they requested

  2. Security
    - Enable RLS on `email_leads` table
    - Add policy for anonymous users to insert their own email
    - Add policy for authenticated admin users to view all leads (for future admin panel)

  3. Indexes
    - Add index on email for faster lookups
    - Add index on created_at for sorting and analytics
*/

-- Create email_leads table
CREATE TABLE IF NOT EXISTS email_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  source_page text NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'active',
  lead_magnet text,
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_status CHECK (status IN ('active', 'unsubscribed'))
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_leads_email ON email_leads(email);
CREATE INDEX IF NOT EXISTS idx_email_leads_created_at ON email_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_leads_source_page ON email_leads(source_page);

-- Enable Row Level Security
ALTER TABLE email_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert their email (for lead capture forms)
CREATE POLICY "Anyone can submit email leads"
  ON email_leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Authenticated users can view all leads (for future admin dashboard)
CREATE POLICY "Authenticated users can view all leads"
  ON email_leads
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can update lead status (for unsubscribe management)
CREATE POLICY "Authenticated users can update lead status"
  ON email_leads
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);