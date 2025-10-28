/*
  ============================================================================
  SMART HVAC ANALYTICS - COMPLETE PRODUCTION DATABASE SETUP
  ============================================================================

  This is a SINGLE SQL file that creates your entire production database.

  INSTRUCTIONS:
  1. Create a new project at https://supabase.com/dashboard
  2. Go to SQL Editor in your new Supabase project
  3. Copy and paste this ENTIRE file
  4. Click "RUN" - it will take about 10-15 seconds
  5. Done! Your database is ready.

  This migration includes:
  - All tables with proper relationships
  - Row Level Security (RLS) policies
  - Indexes for performance
  - Stripe billing integration
  - Auto-activation triggers for paid plans
  - Default plan data

  ============================================================================
*/

-- ============================================================================
-- 1. CORE TABLES
-- ============================================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  company_name text NOT NULL,
  technician_count integer DEFAULT 0,
  plan_tier text DEFAULT 'starter',
  trial_end_date timestamptz DEFAULT (now() + interval '14 days'),
  theme_preference text DEFAULT 'light',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_role text DEFAULT 'owner',
  owned_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  trial_start timestamptz DEFAULT now(),
  trial_expired boolean DEFAULT false,
  demo_mode boolean DEFAULT false,
  billing_status text DEFAULT 'trialing',
  subscription_id text,
  stripe_customer_id text,
  subscription_start timestamptz,
  subscription_end timestamptz
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  price_monthly integer NOT NULL,
  max_technicians integer,
  analytics_days_limit text[] DEFAULT ARRAY['7d', '30d'],
  can_export_reports boolean DEFAULT false,
  support_level text DEFAULT 'email',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans are viewable by everyone"
  ON plans FOR SELECT
  TO authenticated
  USING (true);

-- Technicians table
CREATE TABLE IF NOT EXISTS technicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own technicians"
  ON technicians FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own technicians"
  ON technicians FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own technicians"
  ON technicians FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own technicians"
  ON technicians FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  technician_id uuid REFERENCES technicians(id) ON DELETE SET NULL,
  title text NOT NULL,
  client_name text NOT NULL,
  client_address text,
  job_date date NOT NULL,
  hours_spent numeric DEFAULT 0,
  revenue numeric DEFAULT 0,
  cost numeric DEFAULT 0,
  status text DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  job_type text DEFAULT 'repair',
  callback_required boolean DEFAULT false,
  scheduled_date date,
  completed_date date,
  gross_margin_percent numeric DEFAULT 0
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Analytics snapshots table
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL,
  total_revenue numeric DEFAULT 0,
  total_jobs integer DEFAULT 0,
  avg_hours_per_job numeric DEFAULT 0,
  gross_margin numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  avg_job_revenue numeric DEFAULT 0,
  first_time_fix_rate numeric DEFAULT 0,
  avg_response_time numeric DEFAULT 0,
  revenue_per_technician numeric DEFAULT 0,
  jobs_per_tech_per_week numeric DEFAULT 0,
  maintenance_completion_rate numeric DEFAULT 0,
  UNIQUE(user_id, snapshot_date)
);

ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
  ON analytics_snapshots FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON analytics_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text DEFAULT 'efficiency',
  priority text DEFAULT 'medium',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

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

-- Email leads table
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

ALTER TABLE email_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit email leads"
  ON email_leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all leads"
  ON email_leads
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update lead status"
  ON email_leads
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Consultation requests table
CREATE TABLE IF NOT EXISTS consultation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  message text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consultation requests"
  ON consultation_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert consultation requests"
  ON consultation_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 2. STRIPE BILLING TABLES
-- ============================================================================

-- Stripe subscription status enum
DO $$ BEGIN
  CREATE TYPE stripe_subscription_status AS ENUM (
    'not_started',
    'incomplete',
    'incomplete_expired',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'paused'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Stripe order status enum
DO $$ BEGIN
  CREATE TYPE stripe_order_status AS ENUM (
    'pending',
    'completed',
    'canceled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Stripe customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id) not null unique,
  customer_id text not null unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone default null
);

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own customer data"
    ON stripe_customers
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Stripe subscriptions table
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id bigint primary key generated always as identity,
  customer_id text unique not null,
  subscription_id text default null,
  price_id text default null,
  current_period_start bigint default null,
  current_period_end bigint default null,
  cancel_at_period_end boolean default false,
  payment_method_brand text default null,
  payment_method_last4 text default null,
  status stripe_subscription_status not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone default null
);

ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription data"
    ON stripe_subscriptions
    FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT customer_id
            FROM stripe_customers
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );

-- Stripe orders table
CREATE TABLE IF NOT EXISTS stripe_orders (
    id bigint primary key generated always as identity,
    checkout_session_id text not null,
    payment_intent_id text not null,
    customer_id text not null,
    amount_subtotal bigint not null,
    amount_total bigint not null,
    currency text not null,
    payment_status text not null,
    status stripe_order_status not null default 'pending',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone default null
);

ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order data"
    ON stripe_orders
    FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT customer_id
            FROM stripe_customers
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_email_leads_email ON email_leads(email);
CREATE INDEX IF NOT EXISTS idx_email_leads_created_at ON email_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_leads_source_page ON email_leads(source_page);
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_profiles_owned_by ON profiles(owned_by);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_id ON profiles(subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_billing_status ON profiles(billing_status);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON consultation_requests(status);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_created_at ON consultation_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id_status ON jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_job_date ON jobs(job_date);
CREATE INDEX IF NOT EXISTS idx_jobs_technician_id ON jobs(technician_id);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_user_date ON analytics_snapshots(user_id, snapshot_date);

-- ============================================================================
-- 4. TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to relevant tables
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_technicians_updated_at ON technicians;
CREATE TRIGGER update_technicians_updated_at
  BEFORE UPDATE ON technicians
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-activation trigger for paid plans
CREATE OR REPLACE FUNCTION auto_activate_paid_plan()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.plan_tier IN ('growth', 'pro')) AND (NEW.billing_status = 'trialing') THEN
    NEW.billing_status := 'active';

    IF NEW.subscription_start IS NULL THEN
      NEW.subscription_start := NOW();
    END IF;

    IF NEW.subscription_end IS NULL THEN
      NEW.subscription_end := NOW() + INTERVAL '30 days';
    END IF;

    IF NEW.stripe_customer_id IS NULL THEN
      NEW.stripe_customer_id := 'cus_auto_' || gen_random_uuid();
    END IF;

    IF NEW.subscription_id IS NULL THEN
      NEW.subscription_id := 'sub_auto_' || gen_random_uuid();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_activate_paid_plan ON profiles;
CREATE TRIGGER trigger_auto_activate_paid_plan
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_activate_paid_plan();

-- Auto-activation trigger for plan upgrades
CREATE OR REPLACE FUNCTION auto_activate_plan_upgrade()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.plan_tier = 'starter') AND
     (NEW.plan_tier IN ('growth', 'pro')) AND
     (NEW.billing_status = 'trialing') THEN

    NEW.billing_status := 'active';

    IF NEW.subscription_start IS NULL THEN
      NEW.subscription_start := NOW();
    END IF;

    IF NEW.subscription_end IS NULL THEN
      NEW.subscription_end := NOW() + INTERVAL '30 days';
    END IF;

    IF NEW.stripe_customer_id IS NULL THEN
      NEW.stripe_customer_id := 'cus_auto_' || gen_random_uuid();
    END IF;

    IF NEW.subscription_id IS NULL THEN
      NEW.subscription_id := 'sub_auto_' || gen_random_uuid();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_activate_plan_upgrade ON profiles;
CREATE TRIGGER trigger_auto_activate_plan_upgrade
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_activate_plan_upgrade();

-- ============================================================================
-- 5. VIEWS
-- ============================================================================

-- View for user subscriptions
CREATE OR REPLACE VIEW stripe_user_subscriptions AS
SELECT
    c.customer_id,
    s.subscription_id,
    s.status as subscription_status,
    s.price_id,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.payment_method_brand,
    s.payment_method_last4
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND s.deleted_at IS NULL;

GRANT SELECT ON stripe_user_subscriptions TO authenticated;

-- View for user orders
CREATE OR REPLACE VIEW stripe_user_orders AS
SELECT
    c.customer_id,
    o.id as order_id,
    o.checkout_session_id,
    o.payment_intent_id,
    o.amount_subtotal,
    o.amount_total,
    o.currency,
    o.payment_status,
    o.status as order_status,
    o.created_at as order_date
FROM stripe_customers c
LEFT JOIN stripe_orders o ON c.customer_id = o.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND o.deleted_at IS NULL;

GRANT SELECT ON stripe_user_orders TO authenticated;

-- ============================================================================
-- 6. DEFAULT DATA
-- ============================================================================

-- Insert default plans
INSERT INTO plans (name, slug, price_monthly, max_technicians, analytics_days_limit, can_export_reports, support_level)
VALUES
  ('Starter', 'starter', 4900, 3, ARRAY['7d', '30d'], false, 'email'),
  ('Growth', 'growth', 9900, 10, ARRAY['7d', '30d', '3m', '6m', '1y'], true, 'priority'),
  ('Pro', 'pro', 19900, NULL, ARRAY['7d', '30d', '3m', '6m', '1y'], true, 'dedicated')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Your database is now ready for production use.
-- Next steps:
-- 1. Get your Supabase credentials from Project Settings > API
-- 2. Add them to your Vercel environment variables
-- 3. Configure your Stripe webhook
-- ============================================================================
