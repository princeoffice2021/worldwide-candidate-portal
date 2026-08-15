-- ====================================================================
-- CANDIDATE PORTAL — MASTER SUPABASE SQL MIGRATION (PHASE 1)
-- Worldwide Reverse Job Board
-- ====================================================================

-- Enable pgcrypto extension for UUID generation if needed
create extension if not exists "pgcrypto";

-- --------------------------------------------------------------------
-- 1. TABLE: candidates
-- --------------------------------------------------------------------
create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  phone_number text not null unique,
  full_name text not null,
  photo_url text,
  skill_category_id text,
  skill_category text not null,
  experience_years integer default 0,
  experience_label text default 'Fresher',
  
  -- Worldwide Location System
  country text not null default 'India',
  country_code text not null default 'IN',
  admin_level_1 text,
  admin_level_1_type text,
  admin_level_2 text,
  admin_level_2_type text,
  admin_level_3 text,
  admin_level_3_type text,
  village_or_town text,
  area_other text,
  
  is_available boolean default true,
  expected_salary text,
  bio text,
  
  profile_views integer default 0,
  is_verified boolean default false,
  is_active boolean default true,
  
  slug text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for lightning fast worldwide searches
create index if not exists idx_candidates_user_id on public.candidates(user_id);
create index if not exists idx_candidates_skill_category on public.candidates(skill_category);
create index if not exists idx_candidates_country_code on public.candidates(country_code);
create index if not exists idx_candidates_admin1 on public.candidates(admin_level_1);
create index if not exists idx_candidates_admin2 on public.candidates(admin_level_2);
create index if not exists idx_candidates_availability on public.candidates(is_available);
create index if not exists idx_candidates_slug on public.candidates(slug);

-- --------------------------------------------------------------------
-- 2. TABLE: skill_categories
-- --------------------------------------------------------------------
create table if not exists public.skill_categories (
  id bigint generated always as identity primary key,
  name_english text not null,
  name_hindi text,
  slug text not null unique,
  icon_name text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- --------------------------------------------------------------------
-- 3. TABLE: profile_views
-- --------------------------------------------------------------------
create table if not exists public.profile_views (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references public.candidates(id) on delete cascade,
  viewer_fingerprint_or_session_hash text,
  created_at timestamptz default now()
);

create index if not exists idx_profile_views_candidate_id on public.profile_views(candidate_id);

-- --------------------------------------------------------------------
-- 4. TABLE: locations_cache
-- --------------------------------------------------------------------
create table if not exists public.locations_cache (
  id uuid primary key default gen_random_uuid(),
  provider text,
  provider_id text,
  parent_id uuid,
  level integer,
  name text not null,
  type text,
  country_code text,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- --------------------------------------------------------------------
-- 5. RPC FUNCTION: increment_candidate_view
-- --------------------------------------------------------------------
create or replace function public.increment_candidate_view(candidate_uuid uuid)
returns integer
language plpgsql
security definer
as $$
declare
  new_count integer;
begin
  insert into public.profile_views (candidate_id) values (candidate_uuid);
  
  update public.candidates
  set profile_views = coalesce(profile_views, 0) + 1
  where id = candidate_uuid
  returning profile_views into new_count;
  
  return new_count;
end;
$$;

-- --------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------
alter table public.candidates enable row level security;
alter table public.skill_categories enable row level security;
alter table public.profile_views enable row level security;
alter table public.locations_cache enable row level security;

-- Candidates Table RLS
create policy "Public candidates are viewable by everyone" 
  on public.candidates for select 
  using (is_active = true);

create policy "Candidates can insert their own profile" 
  on public.candidates for insert 
  with check (auth.uid() = user_id);

create policy "Candidates can update their own profile" 
  on public.candidates for update 
  using (auth.uid() = user_id);

-- Skill Categories RLS
create policy "Skill categories are viewable by everyone" 
  on public.skill_categories for select 
  using (is_active = true);

-- Profile Views RLS
create policy "Anyone can insert a view event" 
  on public.profile_views for insert 
  with check (true);

create policy "Candidates can view their own view logs" 
  on public.profile_views for select 
  using (
    exists (
      select 1 from public.candidates c
      where c.id = profile_views.candidate_id and c.user_id = auth.uid()
    )
  );

-- Locations Cache RLS
create policy "Locations are viewable by everyone" 
  on public.locations_cache for select 
  using (true);

-- --------------------------------------------------------------------
-- 7. SUPABASE STORAGE BUCKET FOR PROFILE PHOTOS
-- --------------------------------------------------------------------
-- Run this in Supabase SQL Editor to create storage bucket:
insert into storage.buckets (id, name, public)
values ('candidate-photos', 'candidate-photos', true)
on conflict (id) do nothing;

create policy "Public Access to Candidate Photos"
  on storage.objects for select
  using ( bucket_id = 'candidate-photos' );

create policy "Candidates Upload Photos"
  on storage.objects for insert
  with check ( bucket_id = 'candidate-photos' and auth.role() = 'authenticated' );
