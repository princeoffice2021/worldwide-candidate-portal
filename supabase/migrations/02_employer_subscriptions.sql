-- Migration: Employer Accounts and Subscriptions System
-- Enables subscription-based access to candidate phone numbers & contact info

-- 1. Create Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_period TEXT NOT NULL DEFAULT 'monthly', -- 'monthly' or 'yearly'
  unlock_limit INT NOT NULL, -- e.g. 5, 30, 100, -1 (unlimited)
  features JSONB DEFAULT '[]'::jsonb,
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Plans
INSERT INTO subscription_plans (id, name, price, currency, billing_period, unlock_limit, features, is_popular)
VALUES
  ('plan_free', 'Free Trial', 0, 'USD', 'monthly', 3, '["Browse candidate directory", "3 phone unlocks / month", "Basic email support"]'::jsonb, FALSE),
  ('plan_basic', 'Basic Employer', 29, 'USD', 'monthly', 30, '["30 phone unlocks / month", "Direct Phone & WhatsApp links", "Save favorite candidates", "Standard support"]'::jsonb, FALSE),
  ('plan_pro', 'Pro Recruiter', 79, 'USD', 'monthly', 100, '["100 phone unlocks / month", "Direct Phone & WhatsApp links", "Priority candidate search", "Custom talent alerts", "Priority support"]'::jsonb, TRUE),
  ('plan_unlimited', 'Business Unlimited', 199, 'USD', 'monthly', -1, '["Unlimited candidate unlocks", "Direct Phone & WhatsApp links", "Multi-user recruiter team access", "Dedicated account manager", "24/7 VIP support"]'::jsonb, FALSE)
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  unlock_limit = EXCLUDED.unlock_limit,
  features = EXCLUDED.features;

-- 2. Create Employer Profiles Table
CREATE TABLE IF NOT EXISTS employer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT NOT NULL,
  industry TEXT,
  country TEXT DEFAULT 'Worldwide',
  city TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Employer Subscriptions Table
CREATE TABLE IF NOT EXISTS employer_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  unlocks_used INT NOT NULL DEFAULT 0,
  unlocks_limit INT NOT NULL DEFAULT 3,
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Employer Contact Access Log (Tracking Unlocks)
CREATE TABLE IF NOT EXISTS employer_contact_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_employer_candidate_unlock UNIQUE(employer_id, candidate_id)
);

-- Indexing for fast search and access checks
CREATE INDEX IF NOT EXISTS idx_employer_contact_access_lookup ON employer_contact_access(employer_id, candidate_id);
CREATE INDEX IF NOT EXISTS idx_employer_subscriptions_employer ON employer_subscriptions(employer_id);

-- RLS Policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_contact_access ENABLE ROW LEVEL SECURITY;

-- Public can view subscription plans
CREATE POLICY "Public read subscription plans" ON subscription_plans FOR SELECT USING (true);
