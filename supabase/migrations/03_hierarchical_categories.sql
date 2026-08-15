-- ====================================================================
-- CANDIDATE PORTAL — SUPABASE SQL MIGRATION (PHASE 3)
-- Hierarchical Industry -> Department -> Job Role Classification
-- ====================================================================

-- Add hierarchical taxonomy columns to candidates table safely
ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS industry_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS industry_name TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS department_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS department_name TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS job_role_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS job_role_name TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS custom_profession TEXT DEFAULT NULL;

-- Create performance indexes for employer search filtering
CREATE INDEX IF NOT EXISTS idx_candidates_industry_id ON public.candidates(industry_id);
CREATE INDEX IF NOT EXISTS idx_candidates_department_id ON public.candidates(department_id);
CREATE INDEX IF NOT EXISTS idx_candidates_job_role_id ON public.candidates(job_role_id);
