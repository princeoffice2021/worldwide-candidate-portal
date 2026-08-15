# Candidate Portal — Master Phase 1 Documentation

**Tagline:** Find Skilled People. Anywhere.  
**Sister Portal:** [sriganganagarjobs.in](https://sriganganagarjobs.in)

---

## 🚀 Overview

Candidate Portal is a **worldwide reverse job board** designed for global use from day one. Candidates create and maintain their professional profiles, while employers search and discover talent by skill, experience, availability, and location without requiring forced login for basic browsing.

---

## 🎨 Branding & Visual Style

- **Primary Color:** `#075E54` (Trustworthy, WhatsApp-familiar dark teal)
- **Design Philosophy:** Mobile-first, fast, accessible, large touch targets, high contrast.
- **Languages Supported:** Full Unicode (Hindi, English, Punjabi, Arabic, Spanish, French, etc.)

---

## 📦 Phase 1 Deliverables & Features

1. **Screen 1 — Landing Page (`/`):**
   - Dual CTAs ("Create My Profile" for candidates, "Find Candidates" for employers)
   - How It Works, Popular Skill Categories, Benefits for Candidates & Employers
   - "Available Now" status explanation & Phone privacy assurance
   - FAQ accordion & Sister portal link (`sriganganagarjobs.in`)

2. **Screen 2 — Candidate Phone Login (`/login`):**
   - Country code selector supporting worldwide dial codes (+91, +1, +971, +966, +44, +61, +977, +92, +880, etc.)
   - Mobile phone number verification via OTP
   - Session persistence and auto-redirect to dashboard/setup

3. **Screen 3 — Candidate Profile Setup (`/candidate/setup`):**
   - Basic Info: Full Name, Profile Photo upload (with preview & size validation), Skill Category selector
   - Experience in Years (Fresher, 1 Yr, 2 Yrs, 3 Yrs, 5+ Yrs, 10+ Yrs)
   - **Worldwide Location Hierarchy:** Country -> State/Province -> District/City -> Sub-region -> Village/Town manual input -> Additional Details landmark text
   - Availability Toggle ("Available Now" vs "Not Currently Available")
   - Expected Salary & Bio/About Me with character count
   - **Voice Input (Web Speech API):** Microphone button on all text input fields with language selector (Hindi, English, Punjabi, Auto)

4. **Screen 4 — Candidate Dashboard (`/candidate/dashboard`):**
   - Dynamic Profile Completion bar
   - Profile Photo Avatar, Name, Skill badge, Location badge
   - "My Profile Views" counter card
   - Availability status toggle button
   - Edit Profile button & Public profile preview link

5. **Screen 5 — Profile Edit (`/candidate/edit`):**
   - Real-time profile updates, saving states, RLS ownership protection.

6. **Public Profile View (`/candidates/[slug]`):**
   - SEO-friendly URL slug
   - Masked phone number protection (`+91 98*** **210`)
   - Profile view incrementer & Employer inquiry form

7. **Find Candidates View (`/find-candidates`):**
   - Filter by skill category, keyword location, and "Available Now" status.

---

## 🛠️ Environment Setup

Create `.env` based on `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

*Note: The application includes a preview local database engine so all flows work smoothly out-of-the-box even before Supabase keys are provided!*

---

## 🗄️ Database Setup (Supabase SQL)

Run the SQL migration in `/supabase/migrations/01_initial_schema.sql` inside your Supabase SQL Editor:

- Tables created: `candidates`, `skill_categories`, `profile_views`, `locations_cache`
- RLS policies enabled for candidate data protection
- RPC function created: `increment_candidate_view(candidate_uuid)`
- Storage bucket configured: `candidate-photos`
