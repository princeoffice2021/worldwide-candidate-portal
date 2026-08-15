-- ===================================================
-- MIGRATION: 04_blog_articles.sql
-- SEO Blog & Career Resources System
-- ===================================================

CREATE TABLE IF NOT EXISTS public.blog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  industry_id TEXT,
  department_id TEXT,
  job_role_id TEXT,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  read_time TEXT DEFAULT '5 min read',
  key_takeaways TEXT[] DEFAULT '{}',
  responsibilities TEXT[] DEFAULT '{}',
  required_skills TEXT[] DEFAULT '{}',
  salary_range TEXT,
  interview_questions JSONB DEFAULT '[]'::jsonb
);

-- Enable RLS
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

-- Public read access for published blog articles
CREATE POLICY "Public read published blog articles"
  ON public.blog_articles
  FOR SELECT
  USING (status = 'published');

-- Indexing for fast search and filtering by industry and slug
CREATE INDEX IF NOT EXISTS idx_blog_articles_slug ON public.blog_articles (slug);
CREATE INDEX IF NOT EXISTS idx_blog_articles_industry ON public.blog_articles (industry_id);
CREATE INDEX IF NOT EXISTS idx_blog_articles_status ON public.blog_articles (status);
