import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface DbArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image: string;
  author_name: string;
  author_role: string;
  published_at: string;
  last_updated?: string;
  updated_at?: string;
  created_at: string;
  status: 'published' | 'draft' | 'in_review';
  meta_title: string;
  meta_description: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  industry_id?: string;
  department_id?: string;
  job_role_id?: string;
  topic_ids?: string[];
  tags: string[];
  is_featured?: boolean;
  is_indexable: boolean;
  read_time: string;
  key_takeaways?: string[];
  responsibilities?: string[];
  required_skills?: string[];
  salary_range?: string;
  interview_questions?: { question: string; tip: string }[];
  faqs?: { question: string; answer: string }[];
}

export interface DbTopic {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  seo_title?: string;
  meta_description?: string;
  is_indexable: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbCareerGuide {
  id: string;
  job_role_id: string;
  industry_id: string;
  department_id: string;
  job_role_name: string;
  slug: string;
  content_status: 'published' | 'draft' | 'in_review';
  seo_title: string;
  meta_description: string;
  canonical_url: string;
  short_introduction: string;
  overview: string;
  responsibilities: string[];
  day_to_day_duties: string[];
  technical_skills: string[];
  soft_skills: string[];
  qualifications: string[];
  education_requirements: string;
  certifications: string[];
  salary_entry: string;
  salary_mid: string;
  salary_senior: string;
  career_path: { stage: string; title: string; timeline: string; description: string }[];
  interview_questions: { question: string; tip: string }[];
  resume_tips: string[];
  faqs: { question: string; answer: string }[];
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface DbPlatformSettings {
  platform_name: string;
  platform_description: string;
  default_country: string;
  support_email: string;
  support_phone: string;
  candidate_registration_enabled: boolean;
  employer_registration_enabled: boolean;
  resume_upload_enabled: boolean;
  contact_unlock_enabled: boolean;
  resume_unlock_enabled: boolean;
  public_profiles_enabled: boolean;
  career_resources_enabled: boolean;
  checkout_enabled: boolean;
  min_profile_completion_for_search: number;
  maintenance_mode_enabled: boolean;
  maintenance_message: string;
  updated_at?: string;
  updated_by?: string;
}

export interface CentralDatabaseSchema {
  version: number;
  articles: DbArticle[];
  topics: DbTopic[];
  career_guides: DbCareerGuide[];
  candidates: any[];
  subscription_plans: any[];
  employer_profiles: any[];
  employer_subscriptions: any[];
  payments: any[];
  invoices: any[];
  saved_candidates: any[];
  recently_viewed_candidates: any[];
  contact_unlock_history: any[];
  resume_access_history: any[];
  audit_logs: any[];
  admin_users: {
    id: string;
    username: string;
    role: string;
    name: string;
    email?: string;
    status?: 'active' | 'suspended';
    created_at?: string;
    password_hash: string;
    last_login?: string;
  }[];
  platform_settings: DbPlatformSettings;
  custom_taxonomies?: {
    industries?: any[];
    departments?: any[];
    job_roles?: any[];
  };
  system_meta: {
    initialized_at: string;
    last_persisted_at: string;
    total_revisions: number;
  };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'central_cms_db.json');

// Memory cache
let dbCache: CentralDatabaseSchema | null = null;

// Initial Seeds
const DEFAULT_SUBSCRIPTION_PLANS = [
  {
    id: 'plan-free',
    code: 'FREE_MONTHLY',
    name: 'Free Employer',
    slug: 'free',
    description: 'Browse candidate profiles and test search capabilities worldwide.',
    price: 0,
    amount: 0,
    compare_at_amount: 0,
    currency: 'USD',
    billing_interval: 'monthly',
    billing_interval_count: 1,
    contact_limit: 0,
    contact_access_limit: 0,
    resume_access_limit: 0,
    resume_download_enabled: false,
    advanced_filters_enabled: false,
    phone_access_enabled: false,
    is_active: true,
    is_public: true,
    features: [
      'Unlimited Candidate Search',
      'View Full Experience & Skills',
      'Save Up to 5 Candidates with Notes',
      'Basic Location Filtering'
    ],
    sort_order: 1,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'plan-starter',
    code: 'STARTER_MONTHLY',
    name: 'Starter Employer',
    slug: 'starter',
    description: 'Ideal for small businesses and boutique agencies hiring selectively.',
    price: 29,
    amount: 29,
    compare_at_amount: 39,
    currency: 'USD',
    billing_interval: 'monthly',
    billing_interval_count: 1,
    contact_limit: 15,
    contact_access_limit: 15,
    resume_access_limit: 15,
    resume_download_enabled: true,
    advanced_filters_enabled: true,
    phone_access_enabled: true,
    is_active: true,
    is_public: true,
    features: [
      'Unlock 15 Direct Candidate Phone Numbers / Month',
      'View & Download 15 Candidate Resumes / Month',
      'Direct WhatsApp & Calling Access',
      'Advanced Multi-Criteria Filters',
      'Save Unlimited Candidates with Private Notes',
      'Export Unlocked Contacts to CSV'
    ],
    sort_order: 2,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'plan-pro',
    code: 'PRO_MONTHLY',
    name: 'Professional Employer',
    slug: 'pro',
    description: 'Best for growing companies, recruitment firms & frequent hiring needs.',
    price: 79,
    amount: 79,
    compare_at_amount: 99,
    currency: 'USD',
    billing_interval: 'monthly',
    billing_interval_count: 1,
    contact_limit: 50,
    contact_access_limit: 50,
    resume_access_limit: 50,
    resume_download_enabled: true,
    advanced_filters_enabled: true,
    phone_access_enabled: true,
    is_active: true,
    is_public: true,
    features: [
      'Unlock 50 Direct Candidate Phone Numbers / Month',
      'View & Download 50 Candidate Resumes / Month',
      'Priority Candidate Recommendations',
      'Direct WhatsApp & Instant Phone Unlocks',
      'All Advanced Location, Relocation & Salary Filters',
      'Download Full Verified Resume Documents',
      'Team Search Sharing & Activity Logs'
    ],
    sort_order: 3,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'plan-business',
    code: 'BUSINESS_MONTHLY',
    name: 'Business / Unlimited',
    slug: 'business',
    description: 'For global recruitment agencies & enterprises with high-volume hiring.',
    price: 199,
    amount: 199,
    compare_at_amount: 249,
    currency: 'USD',
    billing_interval: 'monthly',
    billing_interval_count: 1,
    contact_limit: 9999,
    contact_access_limit: 9999,
    resume_access_limit: 9999,
    resume_download_enabled: true,
    advanced_filters_enabled: true,
    phone_access_enabled: true,
    is_active: true,
    is_public: true,
    features: [
      'Unlimited Direct Candidate Phone & Contact Unlocks',
      'Unlimited Candidate Resume Views & Downloads',
      'Dedicated Talent Matching Manager',
      'Full Database Search & Bulk Export',
      'Direct WhatsApp, Email & Phone Access',
      'Custom Candidate Alerts & Webhooks',
      '24/7 Priority Support & SLA Guarantee'
    ],
    sort_order: 4,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString()
  }
];

const DEFAULT_SEED_CANDIDATES = [
  {
    id: 'cand-001',
    user_id: 'user-001',
    phone_number: '+91 98765 43210',
    full_name: 'Rajesh Kumar Verma',
    headline: 'Senior Commercial & Heavy Vehicle Fleet Driver',
    photo_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
    skill_category_id: 'r_241',
    skill_category: 'Personal & Chauffeur Driver',
    industry_id: 'ind_logistics',
    industry_name: 'Logistics, Supply Chain & Transport',
    department_id: 'dep_fleet_driving',
    department_name: 'Fleet Management & Transport Operations',
    job_role_id: 'r_241',
    job_role_name: 'Personal & Chauffeur Driver',
    custom_profession: null,
    experience_years: 5,
    experience_label: '5+ Years',
    country: 'India',
    country_code: 'IN',
    admin_level_1: 'Delhi',
    admin_level_2: 'New Delhi',
    village_or_town: 'Connaught Place',
    area_other: 'Block C',
    is_available: true,
    expected_salary: '₹25,000/month',
    bio: 'Experienced commercial and personal driver. Clean driving record, valid heavy vehicle license, GPS navigation expert, and defensive driving certified.',
    skills: ['Heavy Vehicle Driving', 'Defensive Driving', 'Route Planning', 'Vehicle Maintenance', 'VIP Chauffeur Services'],
    languages: [
      { language: 'Hindi', proficiency: 'Native' },
      { language: 'English', proficiency: 'Conversational' },
      { language: 'Punjabi', proficiency: 'Fluent' }
    ],
    job_preferences: {
      employment_types: ['Full-Time'],
      workplace_type: 'On-Site',
      willing_to_relocate: true,
      notice_period_days: 0
    },
    privacy_settings: {
      profile_visibility: 'public',
      hide_phone_from_public: true,
      allow_employer_messages: true
    },
    profile_views: 42,
    is_verified: true,
    is_active: true,
    slug: 'driver-rajesh-kumar-verma-delhi-a1b2',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cand-002',
    user_id: 'user-002',
    phone_number: '+91 91234 56789',
    full_name: 'Pooja Sharma',
    headline: 'Data Entry Specialist & Office Coordinator',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    skill_category_id: 'r_078',
    skill_category: 'Data Entry & Office Assistant',
    industry_id: 'ind_it',
    industry_name: 'IT, Software, Tech & AI Services',
    department_id: 'dep_it_ops',
    department_name: 'IT Infrastructure, Systems & Support',
    job_role_id: 'r_078',
    job_role_name: 'Data Entry & Office Assistant',
    custom_profession: null,
    experience_years: 3,
    experience_label: '3 Years',
    country: 'India',
    country_code: 'IN',
    admin_level_1: 'Punjab',
    admin_level_2: 'Mohali',
    village_or_town: 'Phase 7',
    area_other: 'Industrial Area',
    is_available: true,
    expected_salary: '₹20,000/month',
    bio: 'Detail-oriented data entry specialist. Fast typing speed (55 WPM), proficient in Excel, Google Sheets, Tally Prime, and CRM platforms.',
    skills: ['MS Excel', 'Data Entry', 'Tally Prime', 'Google Workspace', 'Inventory Logging', 'Typing 55 WPM'],
    languages: [
      { language: 'English', proficiency: 'Fluent' },
      { language: 'Hindi', proficiency: 'Native' },
      { language: 'Punjabi', proficiency: 'Native' }
    ],
    job_preferences: {
      employment_types: ['Full-Time', 'Contract'],
      workplace_type: 'Hybrid',
      willing_to_relocate: false,
      notice_period_days: 15
    },
    privacy_settings: {
      profile_visibility: 'public',
      hide_phone_from_public: true,
      allow_employer_messages: true
    },
    profile_views: 31,
    is_verified: true,
    is_active: true,
    slug: 'computer-operator-pooja-sharma-mohali-c3d4',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cand-003',
    user_id: 'user-003',
    phone_number: '+971 50 123 4567',
    full_name: 'Mohammed Al-Mansoori',
    headline: 'Certified Electrical Maintenance & HVAC Controls Technician',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    skill_category_id: 'r_002',
    skill_category: 'Electrical Maintenance Technician',
    industry_id: 'ind_construction',
    industry_name: 'Construction, Infrastructure & Real Estate',
    department_id: 'dep_building_trades',
    department_name: 'Building Trades & MEP Services',
    job_role_id: 'r_002',
    job_role_name: 'Electrical Maintenance Technician',
    custom_profession: null,
    experience_years: 7,
    experience_label: '5+ Years',
    country: 'United Arab Emirates',
    country_code: 'AE',
    admin_level_1: 'Dubai',
    admin_level_2: 'Deira',
    village_or_town: 'Al Muteena',
    area_other: 'Commercial Tower A',
    is_available: true,
    expected_salary: '5,000 AED/month',
    bio: 'Certified electrical technician with 7 years of GCC commercial and residential infrastructure maintenance experience.',
    skills: ['High Voltage Wiring', 'Circuit Troubleshooting', 'HVAC Panels', 'Preventive Maintenance', 'OSHA Safety'],
    languages: [
      { language: 'Arabic', proficiency: 'Native' },
      { language: 'English', proficiency: 'Fluent' },
      { language: 'Urdu', proficiency: 'Conversational' }
    ],
    job_preferences: {
      employment_types: ['Full-Time'],
      workplace_type: 'On-Site',
      willing_to_relocate: true,
      notice_period_days: 0
    },
    privacy_settings: {
      profile_visibility: 'public',
      hide_phone_from_public: true,
      allow_employer_messages: true
    },
    profile_views: 68,
    is_verified: true,
    is_active: true,
    slug: 'electrician-mohammed-al-mansoori-dubai-e5f6',
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cand-004',
    user_id: 'user-004',
    phone_number: '+1 415 555 0192',
    full_name: 'Elena Rostova',
    headline: 'Senior Full Stack TypeScript & Cloud Solutions Architect',
    photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    skill_category_id: 'r_072',
    skill_category: 'Full Stack Software Engineer',
    industry_id: 'ind_it',
    industry_name: 'IT, Software, Tech & AI Services',
    department_id: 'dep_software_dev',
    department_name: 'Software Engineering & App Development',
    job_role_id: 'r_072',
    job_role_name: 'Full Stack Software Engineer',
    custom_profession: null,
    experience_years: 6,
    experience_label: '5+ Years',
    country: 'United States',
    country_code: 'US',
    admin_level_1: 'California',
    admin_level_2: 'San Francisco',
    village_or_town: 'SoMa',
    area_other: 'Market Street',
    is_available: true,
    expected_salary: '$135,000/year',
    bio: 'Full stack engineer specialized in high-throughput Node.js microservices, React/Next.js architectures, GraphQL, PostgreSQL, and AWS/GCP deployments.',
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'GraphQL'],
    languages: [
      { language: 'English', proficiency: 'Native' },
      { language: 'German', proficiency: 'Conversational' }
    ],
    job_preferences: {
      employment_types: ['Full-Time', 'Contract'],
      workplace_type: 'Remote',
      willing_to_relocate: false,
      notice_period_days: 15
    },
    privacy_settings: {
      profile_visibility: 'public',
      hide_phone_from_public: true,
      allow_employer_messages: true
    },
    profile_views: 89,
    is_verified: true,
    is_active: true,
    slug: 'software-engineer-elena-rostova-san-francisco-g7h8',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cand-005',
    user_id: 'user-005',
    phone_number: '+44 20 7946 0912',
    full_name: 'Marcus Sterling',
    headline: 'Registered Critical Care & Surgical Nurse (BSN)',
    photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    skill_category_id: 'r_110',
    skill_category: 'Registered Staff Nurse',
    industry_id: 'ind_healthcare',
    industry_name: 'Healthcare, Nursing & Medical Sciences',
    department_id: 'dep_nursing',
    department_name: 'Nursing, Inpatient & Clinical Care',
    job_role_id: 'r_110',
    job_role_name: 'Registered Staff Nurse',
    custom_profession: null,
    experience_years: 4,
    experience_label: '4 Years',
    country: 'United Kingdom',
    country_code: 'GB',
    admin_level_1: 'England',
    admin_level_2: 'Greater London',
    village_or_town: 'Camden',
    area_other: 'Bloomsbury',
    is_available: true,
    expected_salary: '£38,000/year',
    bio: 'Dedicated Critical Care Nurse with experience in NHS and private hospital surgical wings. Patient advocacy, triage, ACLS certified.',
    skills: ['Critical Care', 'Triage Assessment', 'Patient Care', 'Medication Administration', 'ACLS Certified', 'Electronic Health Records'],
    languages: [
      { language: 'English', proficiency: 'Native' },
      { language: 'French', proficiency: 'Conversational' }
    ],
    job_preferences: {
      employment_types: ['Full-Time', 'Shift-Based'],
      workplace_type: 'On-Site',
      willing_to_relocate: true,
      notice_period_days: 30
    },
    privacy_settings: {
      profile_visibility: 'public',
      hide_phone_from_public: true,
      allow_employer_messages: true
    },
    profile_views: 54,
    is_verified: true,
    is_active: true,
    slug: 'nurse-marcus-sterling-london-i9j0',
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const DEFAULT_PLATFORM_SETTINGS: DbPlatformSettings = {
  platform_name: 'Worldwide Candidate Portal',
  platform_description: 'Global reverse job board connecting pre-screened talent across 35+ industries with worldwide employers.',
  default_country: 'India',
  support_email: 'support@candidateportal.com',
  support_phone: '+1 (800) 555-0199',
  candidate_registration_enabled: true,
  employer_registration_enabled: true,
  resume_upload_enabled: true,
  contact_unlock_enabled: true,
  resume_unlock_enabled: true,
  public_profiles_enabled: true,
  career_resources_enabled: true,
  checkout_enabled: true,
  min_profile_completion_for_search: 20,
  maintenance_mode_enabled: false,
  maintenance_message: 'Our platform is undergoing scheduled maintenance. Please check back shortly.',
  updated_at: new Date().toISOString()
};

// Helper to mask phone numbers safely
export function maskPhone(phone?: string | null): string {
  if (!phone) return 'Protected Number';
  const clean = phone.trim();
  if (clean.length <= 6) return 'XXXXXX';
  const prefix = clean.slice(0, 6);
  const suffix = clean.slice(-3);
  return `${prefix}*****${suffix}`;
}
const DEFAULT_TOPICS: DbTopic[] = [
  {
    id: 'top-resume',
    name: 'Resume & CV Writing',
    slug: 'resume-cv-writing',
    description: 'Expert frameworks, formatting rules, ATS strategies, and real-world bullet-point samples.',
    iconName: 'FileText',
    seo_title: 'Resume & CV Writing Guides for Global Professionals',
    meta_description: 'Actionable resume templates, ATS optimization guides, and step-by-step CV writing advice.',
    is_indexable: true,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'top-interview',
    name: 'Interview Preparation',
    slug: 'interview-preparation',
    description: 'Technical questions, behavioral response frameworks (STAR), and hiring manager expectations.',
    iconName: 'HelpCircle',
    seo_title: 'Job Interview Preparation & Technical Question Guides',
    meta_description: 'Ace technical and behavioral job interviews with structured sample questions and scoring rubrics.',
    is_indexable: true,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'top-career-growth',
    name: 'Career Progression',
    slug: 'career-progression',
    description: 'Promotions, department transitions, leadership paths, and executive roadmap planning.',
    iconName: 'TrendingUp',
    seo_title: 'Career Progression & Professional Growth Roadmaps',
    meta_description: 'Strategic roadmaps for climbing from entry-level to senior leadership across key global industries.',
    is_indexable: true,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'top-salary',
    name: 'Salary & Compensation',
    slug: 'salary-compensation',
    description: 'Global benchmark compensation bands, negotiation frameworks, and equity breakdowns.',
    iconName: 'DollarSign',
    seo_title: 'Salary Benchmarks & Compensation Guides Worldwide',
    meta_description: 'Compare regional salary ranges, perks, and negotiation tactics for top professions.',
    is_indexable: true,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'top-skills',
    name: 'Skills & Certifications',
    slug: 'skills-certifications',
    description: 'Crucial hard and soft competencies, international licenses, and certification paths.',
    iconName: 'Award',
    seo_title: 'In-Demand Skills & Industry Certifications',
    meta_description: 'Discover the most in-demand technical certifications and workplace skills employers look for.',
    is_indexable: true,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString()
  },
  {
    id: 'top-workplace',
    name: 'Workplace & Culture',
    slug: 'workplace-culture',
    description: 'Onboarding, remote work etiquette, workplace safety, and team leadership best practices.',
    iconName: 'Briefcase',
    seo_title: 'Workplace Best Practices & Modern Team Culture',
    meta_description: 'Guides on workplace safety, remote collaboration, team dynamics, and productive work cultures.',
    is_indexable: true,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString()
  }
];

const SEED_ARTICLES: DbArticle[] = [
  {
    id: 'art-001',
    slug: 'how-to-write-a-professional-staff-nurse-resume',
    title: 'How to Write a Professional Staff Nurse Resume (With Real Clinical Examples)',
    excerpt: 'Step-by-step guide to writing a high-impact Staff Nurse resume that passes hospital ATS filters, highlights patient care ratios, and proves clinical competency.',
    featured_image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
    author_name: 'Dr. Sarah Jenkins, RN, DNP',
    author_role: 'Clinical Healthcare Editorial Lead',
    published_at: '2026-02-10T08:00:00.000Z',
    last_updated: '2026-02-14T10:30:00.000Z',
    updated_at: '2026-02-14T10:30:00.000Z',
    created_at: '2026-02-10T08:00:00.000Z',
    status: 'published',
    meta_title: 'Staff Nurse Resume Guide: Formatting, Clinical Bullet Points & Templates',
    meta_description: 'Learn how to craft a standout Staff Nurse resume with clinical experience bullets, BLS/ACLS licenses, and ATS-compliant healthcare formatting.',
    canonical_url: '/career-resources/how-to-write-a-professional-staff-nurse-resume',
    og_title: 'How to Write a Professional Staff Nurse Resume',
    og_description: 'Actionable clinical resume writing guide for registered staff nurses.',
    og_image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
    industry_id: 'ind_healthcare',
    department_id: 'dep_nursing',
    job_role_id: 'r_029',
    topic_ids: ['top-resume', 'top-skills'],
    tags: ['Nursing', 'Healthcare', 'Resume Writing', 'Staff Nurse', 'Clinical Care'],
    is_featured: true,
    is_indexable: true,
    read_time: '6 min read',
    salary_range: '₹3,50,000 - ₹8,50,000 / $65,000 - $95,000',
    key_takeaways: [
      'Structure your nursing summary with your licensure (RN/GNM/BSc), years of acute care experience, and clinical specialty.',
      'Quantify your patient workload (e.g., "Managed 6-8 acute medical-surgical patients per 12-hour shift").',
      'Feature certifications (BLS, ACLS, PALS) prominently right near the top of the first page.',
      'Explicitly list your Electronic Health Record (EHR) proficiencies like Epic, Cerner, or Meditech.'
    ],
    responsibilities: [
      'Administering prescribed intravenous medications, infusions, and blood products with strict double-verification protocols.',
      'Conducting comprehensive physical assessments, vital sign trending, and rapid triage upon acute deterioration.',
      'Operating life-monitoring machinery including telemetry, infusion pumps, and non-invasive ventilators.',
      'Educating patients and family members on post-operative care, wound dressings, and home medication compliance.'
    ],
    required_skills: [
      'Intravenous (IV) Therapy & Phlebotomy',
      'Electronic Health Records (Epic / Cerner)',
      'ACLS / BLS Certified Clinical Safety',
      'Patient Triage & Vitals Monitoring',
      'Aseptic Sterile Technique & Wound Management'
    ],
    interview_questions: [
      {
        question: 'How do you prioritize your patient assignments during an unexpected emergency on the ward?',
        tip: 'Highlight the ABC (Airway, Breathing, Circulation) triage methodology and clear communication with the charge nurse and nursing assistants.'
      },
      {
        question: 'Describe a situation where a patient had an adverse reaction to a medication. What immediate actions did you take?',
        tip: 'Showcase calm clinical protocol: stopping the infusion immediately, assessing vitals, calling for doctor support, and thorough charting.'
      }
    ],
    faqs: [
      {
        question: 'What is the best format for a nursing resume?',
        answer: 'A reverse-chronological format is universally preferred by hospital hiring committees because it clearly tracks clinical rotations and recent bedside experience.'
      }
    ],
    content: `A staff nurse resume must balance compassion with clinical precision. Hospital hiring managers and Applicant Tracking Systems (ATS) scan hundreds of profiles looking for verified nursing licensure, emergency certifications, and demonstrated bedside competence.\n\n### 1. The Power of a Clinical Summary Statement\nYour opening summary should immediately establish your credentials, specialty background, and patient care capabilities. Avoid generic statements like "Hardworking nurse seeking opportunity." Instead, use structured metrics:\n\n* **Example**: *"Dedicated Registered Nurse with 5+ years of bedside experience in fast-paced 40-bed medical-surgical and step-down units. Certified in ACLS and BLS with proven expertise in Epic EHR documentation and post-operative telemetry monitoring."*\n\n### 2. Crafting Impactful Clinical Experience Bullets\nDo not simply list routine job descriptions. Quantify your patient load, clinical interventions, and safety records:\n\n* Spearheaded daily bedside care, medication administration, and IV therapy for 6-8 acute patients per shift while maintaining a 100% medication safety record.\n* Partnered with multidisciplinary care teams comprising 12+ physicians, pharmacists, and respiratory therapists to formulate individualized discharge care plans.\n* Reduced hospital-acquired infection (HAI) rates in assigned wing by 22% through strict adherence to aseptic protocols and hand hygiene auditing.\n\n### 3. Highlighting Technical proficiencies & EHR Systems\nModern hospitals require deep comfort with medical informatics. Ensure your technical skills section highlights specific medical hardware and EHR platforms (Epic, Cerner, Meditech, McKesson).\n\n### 4. Licensure & Certifications Placement\nAlways list your primary Nursing License number, state/country of registration, and expiration dates clearly on the first page alongside your BLS, ACLS, or specialty certifications.`
  },
  {
    id: 'art-002',
    slug: 'top-10-electrical-technician-interview-questions-and-answers',
    title: 'Top 10 Electrical Technician Interview Questions & Practical Answers',
    excerpt: 'Master your next commercial or industrial electrician interview with these real technical questions, troubleshooting scenarios, and safety-first explanations.',
    featured_image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&auto=format&fit=crop&q=80',
    author_name: 'Marcus Vance, Master Electrician',
    author_role: 'Industrial Engineering Consultant',
    published_at: '2026-02-05T09:00:00.000Z',
    last_updated: '2026-02-12T14:00:00.000Z',
    updated_at: '2026-02-12T14:00:00.000Z',
    created_at: '2026-02-05T09:00:00.000Z',
    status: 'published',
    meta_title: 'Top 10 Electrical Technician Interview Questions & Practical Answers',
    meta_description: 'Prepare for maintenance electrician and technician interviews with step-by-step troubleshooting walkthroughs, safety standards, and wiring questions.',
    canonical_url: '/career-resources/top-10-electrical-technician-interview-questions-and-answers',
    og_title: 'Top 10 Electrical Technician Interview Questions & Answers',
    og_description: 'Real-world technical questions and safety protocols for electrical job interviews.',
    og_image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&auto=format&fit=crop&q=80',
    industry_id: 'ind_construction',
    department_id: 'dep_building_trades',
    job_role_id: 'r_002',
    topic_ids: ['top-interview', 'top-skills'],
    tags: ['Electrical', 'Construction', 'Interview Prep', 'Technician', 'Safety'],
    is_featured: true,
    is_indexable: true,
    read_time: '7 min read',
    salary_range: '₹2,80,000 - ₹6,00,000 / $48,000 - $78,000',
    key_takeaways: [
      'Always lead with safety: Lockout/Tagout (LOTO) protocols and PPE before discussing tool work.',
      'Demonstrate structured multimeter diagnostic workflows rather than guessing issues.',
      'Explain single-phase vs three-phase power distribution and balancing electrical loads.',
      'Know your local National Electrical Code (NEC) regulations and breaker sizing standards.'
    ],
    responsibilities: [
      'Troubleshooting, repairing, and installing electrical wiring, conduit systems, and main breaker panels.',
      'Reading and interpreting complex electrical schematics, one-line diagrams, and blueprint layouts.',
      'Executing preventative maintenance on industrial motors, transformers, and automated switchboards.',
      'Enforcing strict Lockout/Tagout (LOTO) and arc flash safety protocols on job sites.'
    ],
    required_skills: [
      'Lockout/Tagout (LOTO) & OSHA / HSE Safety',
      'Multimeter & Megger Insulation Testing',
      'Conduit Bending & Panel Board Wiring',
      'Three-Phase Motor Troubleshooting',
      'Electrical Blueprint & Schematic Reading'
    ],
    interview_questions: [
      {
        question: 'What is the very first step you take before touching any de-energized electrical panel?',
        tip: 'Emphasize the zero-energy verification step: Apply LOTO, use a calibrated multimeter to test live-dead-live verification before touching.'
      },
      {
        question: 'How do you troubleshoot an electric motor that repeatedly trips its thermal overload breaker?',
        tip: 'Explain checking motor current draw with a clamp meter, testing winding insulation resistance with a megohmmeter, and verifying mechanical bearing load.'
      }
    ],
    faqs: [
      {
        question: 'What safety gear is mandatory for an electrical interview assessment?',
        answer: 'Expect questions regarding Category-rated multimeter usage, arc-rated gloves, safety glasses, and insulated hand tools tested to 1000V standards.'
      }
    ],
    content: `When interviewing for an electrical technician role, technical knowledge alone is not enough—hiring managers want to verify that you prioritize safety, understand electrical code compliance, and can methodically diagnose faults without creating downtime.\n\n### 1. The Core Philosophy: Safety and LOTO First\nNever answer a technical troubleshooting question without first mentioning your safety precautions. Interviewers frequently use scenario questions to test if you cut corners.\n\n### 2. Common Technical Questions Asked by Employers\n* **Question**: *How do you perform a live-dead-live voltage test?*\n  * **Answer Formula**: Test the multimeter on a known live source, verify zero voltage on the de-energized target equipment, and immediately re-test the multimeter on the live source to prove the meter did not fail open.\n* **Question**: *What causes high harmonic distortion in industrial power systems, and how do you mitigate it?*\n  * **Answer Formula**: Variable frequency drives (VFDs) and non-linear switching power supplies generate harmonic currents. Mitigation involves passive harmonic filters, isolation transformers, and active line conditioners.\n\n### 3. Communicating with Non-Technical Stakeholders\nMaintenance technicians regularly interact with plant managers and facility owners. Frame your answers around minimizing operational downtime while ensuring zero compliance risk.`
  },
  {
    id: 'art-003',
    slug: 'software-engineer-career-growth-from-junior-to-staff',
    title: 'Software Engineer Career Progression: The Roadmap from Junior to Staff Engineer',
    excerpt: 'Detailed compensation bands, technical scope expectations, and leadership milestones across every engineering tier from entry-level to Staff+.',
    featured_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
    author_name: 'Alex Rivera',
    author_role: 'Principal Systems Architect',
    published_at: '2026-01-28T10:00:00.000Z',
    last_updated: '2026-02-10T12:00:00.000Z',
    updated_at: '2026-02-10T12:00:00.000Z',
    created_at: '2026-01-28T10:00:00.000Z',
    status: 'published',
    meta_title: 'Software Engineer Career Path: Junior, Mid, Senior, and Staff Guide',
    meta_description: 'Understand the distinct engineering levels, expectations, architectural ownership, and salary growth from Junior to Staff Software Engineer.',
    canonical_url: '/career-resources/software-engineer-career-growth-from-junior-to-staff',
    og_title: 'Software Engineer Career Progression: Junior to Staff',
    og_description: 'Strategic engineering career ladder breakdown with actionable promotion benchmarks.',
    og_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
    industry_id: 'ind_it',
    department_id: 'dep_software_dev',
    job_role_id: 'r_073',
    topic_ids: ['top-career-growth', 'top-salary'],
    tags: ['Software Engineering', 'Tech Careers', 'Career Ladder', 'Staff Engineer', 'Architecture'],
    is_featured: true,
    is_indexable: true,
    read_time: '8 min read',
    salary_range: '₹6,00,000 - ₹45,00,000+ / $90,000 - $280,000+',
    key_takeaways: [
      'Junior engineers focus on execution and learning; Senior engineers own system reliability and team mentorship.',
      'Staff engineers shift focus from individual coding to cross-team architectural alignment and business impact.',
      'Technical writing (RFCs, design docs, incident postmortems) becomes the primary multiplier at higher tiers.',
      'Promotion requires demonstrating sustained performance at the target level before the formal title change.'
    ],
    responsibilities: [
      'Designing scalable, fault-tolerant backend microservices and responsive web applications.',
      'Authoring comprehensive Architecture Decision Records (ADRs) and Request for Comments (RFCs).',
      'Conducting rigorous code reviews, mentoring junior engineers, and establishing testing benchmarks.',
      'Collaborating with product managers and infrastructure teams on quarterly technical roadmaps.'
    ],
    required_skills: [
      'Distributed Systems & Cloud Architecture (AWS/GCP)',
      'TypeScript / Python / Go / Rust / Java',
      'System Design & Microservices Decomposition',
      'CI/CD Pipelines & Automated Testing',
      'Technical RFC Authoring & Engineering Mentorship'
    ],
    interview_questions: [
      {
        question: 'How do you decide between building a monolithic application vs a microservice architecture?',
        tip: 'Discuss team size, domain boundary maturity, deployment velocity, operational complexity, and network latency tradeoffs.'
      }
    ],
    faqs: [
      {
        question: 'What is the main difference between Senior and Staff engineers?',
        answer: 'Senior engineers maximize the output of a single project or squad. Staff engineers influence multiple teams, resolve cross-domain ambiguities, and set long-term technical direction.'
      }
    ],
    content: `Navigating the software engineering career ladder requires transforming from an individual task executor into an organizational force multiplier.\n\n### The Engineering Tiers Demystified\n\n#### 1. Junior Software Engineer (0–2 Years)\n* **Primary Focus**: High execution velocity on well-scoped tickets, mastering codebase conventions, and absorbing feedback during code reviews.\n* **Growth Lever**: Ask structured questions, write thorough unit tests, and independently debug stack traces before escalating.\n\n#### 2. Mid-Level Software Engineer (2–5 Years)\n* **Primary Focus**: Autonomous ownership of end-to-end features, identifying edge cases, and minimizing regression risks.\n* **Growth Lever**: Begin drafting technical design proposals for non-trivial feature sets.\n\n#### 3. Senior Software Engineer (5–8+ Years)\n* **Primary Focus**: Owning system architecture, mentoring junior engineers, driving code review standards, and proactively reducing technical debt.\n* **Growth Lever**: Drive blameless postmortems and establish observability standards.\n\n#### 4. Staff Software Engineer (8+ Years)\n* **Primary Focus**: Setting technical strategy across multiple engineering squads, driving cross-organizational RFCs, and aligning technical roadmaps with business revenue goals.`
  }
];

// Helper: Ensure Data Directory Exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Database Initializer & Loader
export function getCentralDb(): CentralDatabaseSchema {
  if (dbCache) {
    return dbCache;
  }

  ensureDataDir();

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed: CentralDatabaseSchema = JSON.parse(raw);
      
      // Merge initial seeds if missing
      let modified = false;
      if (!parsed.topics || parsed.topics.length === 0) {
        parsed.topics = DEFAULT_TOPICS;
        modified = true;
      }
      if (!parsed.articles || parsed.articles.length === 0) {
        parsed.articles = SEED_ARTICLES;
        modified = true;
      }
      if (!parsed.career_guides) {
        parsed.career_guides = [];
        modified = true;
      }
      if (!parsed.candidates || parsed.candidates.length === 0) {
        parsed.candidates = DEFAULT_SEED_CANDIDATES;
        modified = true;
      }
      if (!parsed.subscription_plans || parsed.subscription_plans.length === 0) {
        parsed.subscription_plans = DEFAULT_SUBSCRIPTION_PLANS;
        modified = true;
      }
      if (!parsed.employer_profiles) {
        parsed.employer_profiles = [];
        modified = true;
      }
      if (!parsed.employer_subscriptions) {
        parsed.employer_subscriptions = [];
        modified = true;
      }
      if (!parsed.payments) {
        parsed.payments = [];
        modified = true;
      }
      if (!parsed.invoices) {
        parsed.invoices = [];
        modified = true;
      }
      if (!parsed.saved_candidates) {
        parsed.saved_candidates = [];
        modified = true;
      }
      if (!parsed.recently_viewed_candidates) {
        parsed.recently_viewed_candidates = [];
        modified = true;
      }
      if (!parsed.contact_unlock_history) {
        parsed.contact_unlock_history = [];
        modified = true;
      }
      if (!parsed.resume_access_history) {
        parsed.resume_access_history = [];
        modified = true;
      }
      if (!parsed.audit_logs) {
        parsed.audit_logs = [];
        modified = true;
      }
      if (!parsed.admin_users) {
        parsed.admin_users = [
          {
            id: 'adm_001',
            username: 'admin',
            role: 'super_admin',
            name: 'Platform Administrator',
            password_hash: '3804beecdd45f3c9a63319089ef062776c5b966cf12d46e39265f29910d9319e'
          }
        ];
        modified = true;
      }
      if (!parsed.platform_settings) {
        parsed.platform_settings = { ...DEFAULT_PLATFORM_SETTINGS };
        modified = true;
      }
      if (!parsed.custom_taxonomies) {
        parsed.custom_taxonomies = {
          industries: [],
          departments: [],
          job_roles: []
        };
        modified = true;
      }

      dbCache = parsed;
      if (modified) {
        persistDbToDisk();
      }
      return dbCache;
    } catch (err) {
      console.error('Error reading central database file, re-initializing with seed data:', err);
    }
  }

  // First-time database initialization
  const initialDb: CentralDatabaseSchema = {
    version: 1,
    articles: SEED_ARTICLES,
    topics: DEFAULT_TOPICS,
    career_guides: [],
    candidates: DEFAULT_SEED_CANDIDATES,
    subscription_plans: DEFAULT_SUBSCRIPTION_PLANS,
    employer_profiles: [],
    employer_subscriptions: [],
    payments: [],
    invoices: [],
    saved_candidates: [],
    recently_viewed_candidates: [],
    contact_unlock_history: [],
    resume_access_history: [],
    audit_logs: [],
    admin_users: [
      {
        id: 'adm_001',
        username: 'admin',
        role: 'super_admin',
        name: 'Platform Administrator',
        password_hash: '3804beecdd45f3c9a63319089ef062776c5b966cf12d46e39265f29910d9319e'
      }
    ],
    platform_settings: { ...DEFAULT_PLATFORM_SETTINGS },
    custom_taxonomies: {
      industries: [],
      departments: [],
      job_roles: []
    },
    system_meta: {
      initialized_at: new Date().toISOString(),
      last_persisted_at: new Date().toISOString(),
      total_revisions: 1
    }
  };

  dbCache = initialDb;
  persistDbToDisk();
  return dbCache;
}

// Atomic persistence to disk
export function persistDbToDisk(): boolean {
  if (!dbCache) return false;
  ensureDataDir();

  try {
    dbCache.system_meta.last_persisted_at = new Date().toISOString();
    dbCache.system_meta.total_revisions = (dbCache.system_meta.total_revisions || 0) + 1;

    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(dbCache, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Failed to atomically persist central database:', err);
    return false;
  }
}

// ==========================================
// ARTICLES QUERY & MUTATION INTERFACES
// ==========================================

export interface ArticleFilterOptions {
  industry_id?: string;
  department_id?: string;
  job_role_id?: string;
  topic_id?: string;
  status?: string; // only admin can pass non-published
  search?: string;
  limit?: number;
  offset?: number;
  featured_only?: boolean;
}

export const articleRepository = {
  getPublished(filters: ArticleFilterOptions = {}): { articles: DbArticle[]; total: number } {
    const db = getCentralDb();
    let list = db.articles.filter(a => a.status === 'published');

    if (filters.industry_id) {
      list = list.filter(a => a.industry_id === filters.industry_id);
    }
    if (filters.department_id) {
      list = list.filter(a => a.department_id === filters.department_id);
    }
    if (filters.job_role_id) {
      list = list.filter(a => a.job_role_id === filters.job_role_id || a.tags.some(t => t.toLowerCase() === filters.job_role_id?.toLowerCase()));
    }
    if (filters.topic_id) {
      list = list.filter(a => a.topic_ids?.includes(filters.topic_id!) || a.tags.some(t => t.toLowerCase().includes(filters.topic_id!.toLowerCase())));
    }
    if (filters.featured_only) {
      list = list.filter(a => Boolean(a.is_featured));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(a => 
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort descending by published_at
    list.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    const total = list.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    const paginated = list.slice(offset, offset + limit);

    return { articles: paginated, total };
  },

  getAllForAdmin(statusFilter?: string): DbArticle[] {
    const db = getCentralDb();
    let list = [...db.articles];
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter(a => a.status === statusFilter);
    }
    list.sort((a, b) => new Date(b.updated_at || b.published_at).getTime() - new Date(a.updated_at || a.published_at).getTime());
    return list;
  },

  getBySlug(slug: string, includeUnpublished = false): DbArticle | null {
    const db = getCentralDb();
    const cleanSlug = slug.toLowerCase().trim();
    const found = db.articles.find(a => a.slug.toLowerCase() === cleanSlug);
    if (!found) return null;
    if (!includeUnpublished && found.status !== 'published') return null;
    return found;
  },

  getById(id: string): DbArticle | null {
    const db = getCentralDb();
    return db.articles.find(a => a.id === id) || null;
  },

  getRelated(industryId?: string, departmentId?: string, jobRoleId?: string, currentArticleId?: string, limit = 3): DbArticle[] {
    const db = getCentralDb();
    const published = db.articles.filter(a => a.status === 'published' && a.id !== currentArticleId);

    // Scoring: Exact Job Role = 100, Department = 50, Industry = 10
    const scored = published.map(art => {
      let score = 0;
      if (jobRoleId && (art.job_role_id === jobRoleId || art.tags?.some(t => t.toLowerCase() === jobRoleId.toLowerCase()))) {
        score += 100;
      }
      if (departmentId && art.department_id === departmentId) {
        score += 50;
      }
      if (industryId && art.industry_id === industryId) {
        score += 10;
      }
      return { article: art, score };
    }).filter(item => item.score > 0);

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(item => item.article);
  },

  create(data: Omit<DbArticle, 'id' | 'created_at' | 'updated_at'>): { success: boolean; article?: DbArticle; error?: string } {
    const db = getCentralDb();

    // Check slug uniqueness
    const slugExists = db.articles.some(a => a.slug.toLowerCase() === data.slug.toLowerCase());
    if (slugExists) {
      return { success: false, error: `An article with slug "${data.slug}" already exists. Please choose a unique slug.` };
    }

    const now = new Date().toISOString();
    const newArticle: DbArticle = {
      ...data,
      id: `art_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      created_at: now,
      updated_at: now,
      last_updated: now,
      canonical_url: data.canonical_url || `/career-resources/${data.slug}`,
      is_indexable: data.status === 'published'
    };

    db.articles.unshift(newArticle);
    persistDbToDisk();
    return { success: true, article: newArticle };
  },

  update(id: string, updates: Partial<DbArticle>): { success: boolean; article?: DbArticle; error?: string } {
    const db = getCentralDb();
    const index = db.articles.findIndex(a => a.id === id);
    if (index === -1) {
      return { success: false, error: 'Article not found.' };
    }

    // If slug is changing, verify uniqueness
    if (updates.slug && updates.slug.toLowerCase() !== db.articles[index].slug.toLowerCase()) {
      const slugExists = db.articles.some(a => a.id !== id && a.slug.toLowerCase() === updates.slug!.toLowerCase());
      if (slugExists) {
        return { success: false, error: `The slug "${updates.slug}" is already in use by another article.` };
      }
    }

    const now = new Date().toISOString();
    const existing = db.articles[index];
    const updated: DbArticle = {
      ...existing,
      ...updates,
      updated_at: now,
      last_updated: now,
      canonical_url: updates.canonical_url || (updates.slug ? `/career-resources/${updates.slug}` : existing.canonical_url),
      is_indexable: (updates.status || existing.status) === 'published'
    };

    db.articles[index] = updated;
    persistDbToDisk();
    return { success: true, article: updated };
  },

  delete(id: string): { success: boolean; error?: string } {
    const db = getCentralDb();
    const index = db.articles.findIndex(a => a.id === id);
    if (index === -1) {
      return { success: false, error: 'Article not found.' };
    }

    db.articles.splice(index, 1);
    persistDbToDisk();
    return { success: true };
  }
};

// ==========================================
// TOPICS QUERY & MUTATION INTERFACES
// ==========================================

export const topicRepository = {
  getAll(): DbTopic[] {
    const db = getCentralDb();
    return [...db.topics];
  },

  getBySlug(slug: string): DbTopic | null {
    const db = getCentralDb();
    return db.topics.find(t => t.slug.toLowerCase() === slug.toLowerCase()) || null;
  },

  create(topicData: Omit<DbTopic, 'id' | 'created_at' | 'updated_at'>): { success: boolean; topic?: DbTopic; error?: string } {
    const db = getCentralDb();
    const exists = db.topics.some(t => t.slug.toLowerCase() === topicData.slug.toLowerCase());
    if (exists) {
      return { success: false, error: `Topic with slug "${topicData.slug}" already exists.` };
    }

    const now = new Date().toISOString();
    const newTopic: DbTopic = {
      ...topicData,
      id: `top_${Date.now()}`,
      created_at: now,
      updated_at: now
    };

    db.topics.push(newTopic);
    persistDbToDisk();
    return { success: true, topic: newTopic };
  }
};

// ==========================================
// CAREER GUIDES QUERY & MUTATION INTERFACES
// ==========================================

export const careerGuideRepository = {
  getAll(): DbCareerGuide[] {
    const db = getCentralDb();
    return [...db.career_guides];
  },

  getBySlug(slug: string): DbCareerGuide | null {
    const db = getCentralDb();
    return db.career_guides.find(cg => cg.slug.toLowerCase() === slug.toLowerCase()) || null;
  },

  save(guide: DbCareerGuide): { success: boolean; guide: DbCareerGuide } {
    const db = getCentralDb();
    const index = db.career_guides.findIndex(cg => cg.slug === guide.slug || cg.job_role_id === guide.job_role_id);
    const now = new Date().toISOString();
    
    const prepared: DbCareerGuide = {
      ...guide,
      updated_at: now,
      last_updated: now
    };

    if (index >= 0) {
      db.career_guides[index] = prepared;
    } else {
      db.career_guides.push(prepared);
    }

    persistDbToDisk();
    return { success: true, guide: prepared };
  }
};

// ==========================================
// CANDIDATES QUERY & MUTATION INTERFACES
// ==========================================

export interface AdvancedCandidateFilterOptions {
  industry_id?: string;
  department_id?: string;
  job_role_id?: string;
  search?: string;
  location?: string;
  country?: string;
  admin_level_1?: string;
  admin_level_2?: string;
  is_available?: boolean;
  min_experience_years?: number;
  max_experience_years?: number;
  workplace_type?: 'On-Site' | 'Remote' | 'Hybrid' | 'Any';
  willing_to_relocate?: boolean;
  skills?: string[];
  languages?: string[];
  min_completion_percentage?: number;
  sort_by?: 'relevance' | 'experience_desc' | 'experience_asc' | 'recent' | 'completion';
  limit?: number;
  offset?: number;
}

// Calculate candidate profile completion percentage deterministically
export function calculateProfileCompleteness(c: any): number {
  let score = 0;
  if (c.full_name) score += 10;
  if (c.phone_number) score += 10;
  if (c.headline || c.bio) score += 10;
  if (c.photo_url) score += 10;
  if (c.job_role_id || c.job_role_name || c.custom_profession) score += 15;
  if (c.industry_id || c.department_id) score += 10;
  if (c.country && (c.admin_level_1 || c.village_or_town)) score += 10;
  if (c.experience_years !== undefined && c.experience_years !== null) score += 10;
  if (c.skills && c.skills.length > 0) score += 10;
  if (c.languages && c.languages.length > 0) score += 5;
  if ((c.resume && c.resume.status === 'active' && c.resume.storage_key) || c.has_resume) score += 10;
  return Math.min(score, 100);
}

// Helper to sanitize candidate object for public/employer API responses
export function sanitizeCandidateForResponse(rawCandidate: any, employerId?: string, isAdmin?: boolean): any {
  if (!rawCandidate) return null;
  const db = getCentralDb();
  const c = { ...rawCandidate };

  const isContactUnlocked = isAdmin || (employerId && db.contact_unlock_history?.some(u => u.employer_id === employerId && u.candidate_id === c.id));
  const isResumeUnlocked = isAdmin || (employerId && db.resume_access_history?.some(r => r.employer_id === employerId && r.candidate_id === c.id));

  // 1. Phone number privacy masking
  if (!isContactUnlocked && c.privacy_settings?.hide_phone_from_public !== false) {
    c.phone_number = maskPhone(c.phone_number);
    c.is_phone_unlocked = false;
  } else {
    c.is_phone_unlocked = true;
  }

  // 2. Resume status & safe metadata (NEVER leak storage_key or file path)
  const hasResume = Boolean(c.resume && c.resume.status === 'active' && c.resume.storage_key);
  c.has_resume = hasResume;
  c.resume_visibility = c.resume?.access_visibility || c.privacy_settings?.resume_visibility || 'PRIVATE';
  c.is_resume_unlocked = Boolean(isResumeUnlocked);

  if (c.resume && c.resume.status === 'active') {
    c.resume = {
      id: c.resume.id,
      original_filename: c.resume.original_filename,
      file_size: c.resume.file_size,
      content_type: c.resume.content_type,
      uploaded_at: c.resume.uploaded_at,
      access_visibility: c.resume.access_visibility || 'PRIVATE',
      status: c.resume.status
    };
  } else {
    c.resume = null;
  }

  c.completion_score = calculateProfileCompleteness(rawCandidate);
  return c;
}

export const candidateRepository = {
  getAll(filters: AdvancedCandidateFilterOptions = {}, employerId?: string, isAdmin?: boolean): { candidates: any[]; total: number } {
    const db = getCentralDb();
    let list = [...(db.candidates || [])];

    // Determine unlocked candidate IDs for this employer
    const unlockedIds = new Set<string>();
    if (employerId && db.contact_unlock_history) {
      db.contact_unlock_history
        .filter(u => u.employer_id === employerId)
        .forEach(u => unlockedIds.add(u.candidate_id));
    }

    // 1. Filter out inactive and strictly private profiles from public/employer search
    list = list.filter(c => {
      if (c.is_active === false) return false;
      if (c.privacy_settings?.profile_visibility === 'private') return false;
      return true;
    });

    // 2. Filter by Availability
    if (filters.is_available) {
      list = list.filter(c => c.is_available === true);
    }

    // 3. Filter by Category / Hierarchy
    if (filters.industry_id) {
      list = list.filter(c => c.industry_id === filters.industry_id);
    }

    if (filters.department_id) {
      list = list.filter(c => c.department_id === filters.department_id);
    }

    if (filters.job_role_id) {
      list = list.filter(c => c.job_role_id === filters.job_role_id || c.skill_category_id === filters.job_role_id);
    }

    // 4. Experience Years range
    if (filters.min_experience_years !== undefined) {
      list = list.filter(c => (c.experience_years ?? 0) >= (filters.min_experience_years || 0));
    }
    if (filters.max_experience_years !== undefined) {
      list = list.filter(c => (c.experience_years ?? 0) <= (filters.max_experience_years || 99));
    }

    // 5. Workplace Type
    if (filters.workplace_type && filters.workplace_type !== 'Any') {
      list = list.filter(c => {
        const prefType = c.job_preferences?.workplace_type || 'Any';
        if (prefType === 'Any') return true;
        return prefType.toLowerCase() === filters.workplace_type?.toLowerCase();
      });
    }

    // 6. Willing to Relocate
    if (filters.willing_to_relocate === true) {
      list = list.filter(c => c.job_preferences?.willing_to_relocate === true);
    }

    // 7. Location (Country / State / Town)
    if (filters.country) {
      const cQ = filters.country.toLowerCase().trim();
      list = list.filter(c => c.country?.toLowerCase().includes(cQ) || c.country_code?.toLowerCase() === cQ);
    }

    if (filters.location) {
      const locQ = filters.location.toLowerCase().trim();
      list = list.filter(c => {
        return (
          c.country?.toLowerCase().includes(locQ) ||
          c.admin_level_1?.toLowerCase().includes(locQ) ||
          c.admin_level_2?.toLowerCase().includes(locQ) ||
          c.village_or_town?.toLowerCase().includes(locQ) ||
          c.area_other?.toLowerCase().includes(locQ)
        );
      });
    }

    // 8. Specific Skills
    if (filters.skills && filters.skills.length > 0) {
      const lowerSkills = filters.skills.map(s => s.toLowerCase().trim());
      list = list.filter(c => {
        const candSkills = (c.skills || []).map((s: string) => s.toLowerCase());
        return lowerSkills.some(reqSkill => candSkills.some((cs: string) => cs.includes(reqSkill) || reqSkill.includes(cs)));
      });
    }

    // 9. Languages
    if (filters.languages && filters.languages.length > 0) {
      const lowerLangs = filters.languages.map(l => l.toLowerCase().trim());
      list = list.filter(c => {
        const candLangs = (c.languages || []).map((l: any) => (typeof l === 'string' ? l : l.language || '').toLowerCase());
        return lowerLangs.some(reqLang => candLangs.some((cl: string) => cl.includes(reqLang)));
      });
    }

    // 10. General Search Query
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(c => {
        const nameMatch = c.full_name?.toLowerCase().includes(q);
        const roleMatch = c.job_role_name?.toLowerCase().includes(q) || c.skill_category?.toLowerCase().includes(q) || c.custom_profession?.toLowerCase().includes(q);
        const headlineMatch = c.headline?.toLowerCase().includes(q);
        const bioMatch = c.bio?.toLowerCase().includes(q);
        const indMatch = c.industry_name?.toLowerCase().includes(q);
        const depMatch = c.department_name?.toLowerCase().includes(q);
        const skillsMatch = c.skills?.some((s: string) => s.toLowerCase().includes(q));
        const expMatch = c.work_experiences?.some((w: any) => w.title?.toLowerCase().includes(q) || w.company?.toLowerCase().includes(q));
        return nameMatch || roleMatch || headlineMatch || bioMatch || indMatch || depMatch || skillsMatch || expMatch;
      });
    }

    // 11. Deterministic Multi-Factor Ranking & Scoring
    const scoredList = list.map(c => {
      let matchScore = 0;
      const q = (filters.search || '').toLowerCase().trim();

      // 1. Exact or Partial Job Role Match (+1000)
      if (filters.job_role_id && (c.job_role_id === filters.job_role_id || c.skill_category_id === filters.job_role_id)) {
        matchScore += 1000;
      } else if (q && (c.job_role_name?.toLowerCase().includes(q) || c.skill_category?.toLowerCase().includes(q))) {
        matchScore += 800;
      }

      // 2. Department Match (+500)
      if (filters.department_id && c.department_id === filters.department_id) {
        matchScore += 500;
      } else if (q && c.department_name?.toLowerCase().includes(q)) {
        matchScore += 300;
      }

      // 3. Skill Match (+300)
      if (filters.skills && filters.skills.length > 0) {
        const matchedSkillsCount = (c.skills || []).filter((s: string) => 
          filters.skills!.some(fs => s.toLowerCase().includes(fs.toLowerCase()))
        ).length;
        matchScore += matchedSkillsCount * 150;
      } else if (q && c.skills?.some((s: string) => s.toLowerCase().includes(q))) {
        matchScore += 250;
      }

      // 4. Industry Match (+200)
      if (filters.industry_id && c.industry_id === filters.industry_id) {
        matchScore += 200;
      } else if (q && c.industry_name?.toLowerCase().includes(q)) {
        matchScore += 150;
      }

      // 5. Location Match (+150)
      if (filters.location && (c.country?.toLowerCase().includes(filters.location.toLowerCase()) || c.admin_level_1?.toLowerCase().includes(filters.location.toLowerCase()))) {
        matchScore += 150;
      }

      // 6. Experience Match (+100)
      if (c.experience_years && c.experience_years > 0) {
        matchScore += Math.min(c.experience_years * 20, 100);
      }

      // 7. Availability (+80)
      if (c.is_available) {
        matchScore += 80;
      }

      // 8. Profile Completion (1 to 100)
      const completeness = calculateProfileCompleteness(c);
      matchScore += completeness;

      return {
        candidate: c,
        matchScore,
        completeness
      };
    });

    // 12. Minimum Completion Filter
    let filteredScored = scoredList;
    if (filters.min_completion_percentage) {
      filteredScored = filteredScored.filter(item => item.completeness >= (filters.min_completion_percentage || 0));
    }

    // 13. Sorting
    const sortBy = filters.sort_by || 'relevance';
    filteredScored.sort((a, b) => {
      if (sortBy === 'relevance') {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        return new Date(b.candidate.updated_at || b.candidate.created_at).getTime() - new Date(a.candidate.updated_at || a.candidate.created_at).getTime();
      }
      if (sortBy === 'experience_desc') {
        return (b.candidate.experience_years || 0) - (a.candidate.experience_years || 0);
      }
      if (sortBy === 'experience_asc') {
        return (a.candidate.experience_years || 0) - (b.candidate.experience_years || 0);
      }
      if (sortBy === 'completion') {
        return b.completeness - a.completeness;
      }
      // 'recent'
      return new Date(b.candidate.updated_at || b.candidate.created_at).getTime() - new Date(a.candidate.updated_at || a.candidate.created_at).getTime();
    });

    const total = filteredScored.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    const paginated = filteredScored.slice(offset, offset + limit);

    // 14. Data Transfer Object (DTO) & Privacy Sanitization
    const sanitized = paginated.map(item => {
      const sanitizedCandidate = sanitizeCandidateForResponse(item.candidate, employerId, isAdmin);
      sanitizedCandidate.match_score = item.matchScore;
      sanitizedCandidate.completion_score = item.completeness;
      return sanitizedCandidate;
    });

    return { candidates: sanitized, total };
  },

  getBySlug(slug: string, employerId?: string, isAdmin?: boolean): any | null {
    const db = getCentralDb();
    const clean = slug.toLowerCase().trim();
    const found = db.candidates?.find(c => c.slug?.toLowerCase() === clean || c.id === slug) || null;
    if (!found) return null;

    return sanitizeCandidateForResponse(found, employerId, isAdmin);
  },

  getById(id: string, employerId?: string, isAdmin?: boolean): any | null {
    const db = getCentralDb();
    const found = db.candidates?.find(c => c.id === id) || null;
    if (!found) return null;

    return sanitizeCandidateForResponse(found, employerId, isAdmin);
  },

  getRawById(id: string): any | null {
    const db = getCentralDb();
    return db.candidates?.find(c => c.id === id) || null;
  },

  getByUserId(userId: string, sanitize = true): any | null {
    const db = getCentralDb();
    const found = db.candidates?.find(c => c.user_id === userId) || null;
    if (!found) return null;
    if (!sanitize) return found;
    return sanitizeCandidateForResponse(found, undefined, true);
  },

  updateResume(candidateId: string, resumeData: any): { success: boolean; candidate: any } {
    const db = getCentralDb();
    if (!db.candidates) db.candidates = [];
    const candidate = db.candidates.find(c => c.id === candidateId || c.user_id === candidateId);
    if (!candidate) return { success: false, candidate: null };

    const now = new Date().toISOString();
    candidate.resume = {
      ...resumeData,
      status: 'active',
      updated_at: now
    };
    candidate.has_resume = true;
    candidate.resume_visibility = resumeData.access_visibility || candidate.resume_visibility || 'PRIVATE';
    if (!candidate.privacy_settings) candidate.privacy_settings = {};
    candidate.privacy_settings.resume_visibility = candidate.resume_visibility;
    candidate.updated_at = now;

    persistDbToDisk();
    return { success: true, candidate: sanitizeCandidateForResponse(candidate, undefined, true) };
  },

  deleteResume(candidateId: string): { success: boolean; candidate: any; previousStorageKey?: string } {
    const db = getCentralDb();
    if (!db.candidates) db.candidates = [];
    const candidate = db.candidates.find(c => c.id === candidateId || c.user_id === candidateId);
    if (!candidate) return { success: false, candidate: null };

    const previousStorageKey = candidate.resume?.storage_key;
    const now = new Date().toISOString();
    candidate.resume = null;
    candidate.has_resume = false;
    candidate.updated_at = now;

    persistDbToDisk();
    return { success: true, candidate: sanitizeCandidateForResponse(candidate, undefined, true), previousStorageKey };
  },

  updateResumePrivacy(candidateId: string, visibility: string): { success: boolean; candidate: any } {
    const db = getCentralDb();
    if (!db.candidates) db.candidates = [];
    const candidate = db.candidates.find(c => c.id === candidateId || c.user_id === candidateId);
    if (!candidate) return { success: false, candidate: null };

    const now = new Date().toISOString();
    if (candidate.resume) {
      candidate.resume.access_visibility = visibility;
      candidate.resume.updated_at = now;
    }
    if (!candidate.privacy_settings) candidate.privacy_settings = {};
    candidate.privacy_settings.resume_visibility = visibility;
    candidate.resume_visibility = visibility;
    candidate.updated_at = now;

    persistDbToDisk();
    return { success: true, candidate: sanitizeCandidateForResponse(candidate, undefined, true) };
  },

  save(candidate: any): { success: boolean; candidate: any } {
    const db = getCentralDb();
    if (!db.candidates) db.candidates = [];

    const index = db.candidates.findIndex(c => c.id === candidate.id || (c.user_id && candidate.user_id && c.user_id === candidate.user_id));
    const now = new Date().toISOString();

    const prepared = {
      ...candidate,
      has_resume: Boolean((candidate.resume && candidate.resume.status === 'active' && candidate.resume.storage_key) || candidate.has_resume),
      resume_visibility: candidate.resume?.access_visibility || candidate.privacy_settings?.resume_visibility || candidate.resume_visibility || 'PRIVATE',
      updated_at: now
    };

    if (index >= 0) {
      db.candidates[index] = prepared;
    } else {
      prepared.created_at = prepared.created_at || now;
      db.candidates.unshift(prepared);
    }

    persistDbToDisk();
    return { success: true, candidate: prepared };
  },

  incrementView(candidateId: string): number {
    const db = getCentralDb();
    if (!db.candidates) return 0;
    const found = db.candidates.find(c => c.id === candidateId);
    if (found) {
      found.profile_views = (found.profile_views || 0) + 1;
      persistDbToDisk();
      return found.profile_views;
    }
    return 0;
  },

  getAdminList(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    industry_id?: string;
    department_id?: string;
    job_role_id?: string;
    has_resume?: string;
    country?: string;
    sort_by?: string;
  } = {}): { candidates: any[]; total: number; page: number; limit: number } {
    const db = getCentralDb();
    let list = [...(db.candidates || [])];

    // Status filter
    if (params.status && params.status !== 'all') {
      if (params.status === 'active') {
        list = list.filter(c => c.is_active !== false && c.status !== 'suspended' && c.status !== 'soft_deleted');
      } else if (params.status === 'suspended') {
        list = list.filter(c => c.status === 'suspended');
      } else if (params.status === 'hidden') {
        list = list.filter(c => c.privacy_settings?.profile_visibility === 'private' || c.status === 'hidden');
      } else if (params.status === 'soft_deleted') {
        list = list.filter(c => c.status === 'soft_deleted');
      }
    }

    // Taxonomy filters
    if (params.industry_id && params.industry_id !== 'all') {
      list = list.filter(c => c.industry_id === params.industry_id);
    }
    if (params.department_id && params.department_id !== 'all') {
      list = list.filter(c => c.department_id === params.department_id);
    }
    if (params.job_role_id && params.job_role_id !== 'all') {
      list = list.filter(c => c.job_role_id === params.job_role_id || c.skill_category_id === params.job_role_id);
    }

    // Country filter
    if (params.country && params.country !== 'all') {
      list = list.filter(c => c.country?.toLowerCase() === params.country?.toLowerCase());
    }

    // Resume filter
    if (params.has_resume && params.has_resume !== 'all') {
      const wantResume = params.has_resume === 'true';
      list = list.filter(c => Boolean((c.resume && c.resume.status === 'active' && c.resume.storage_key) || c.has_resume) === wantResume);
    }

    // Search query
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(c => {
        const nameMatch = c.full_name?.toLowerCase().includes(q);
        const phoneMatch = c.phone_number?.replace(/\D/g, '').includes(q.replace(/\D/g, ''));
        const roleMatch = c.job_role_name?.toLowerCase().includes(q) || c.skill_category?.toLowerCase().includes(q);
        const headlineMatch = c.headline?.toLowerCase().includes(q);
        const idMatch = c.id?.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q);
        return nameMatch || phoneMatch || roleMatch || headlineMatch || idMatch;
      });
    }

    // Sorting
    const sortBy = params.sort_by || 'recent';
    list.sort((a, b) => {
      if (sortBy === 'name') return (a.full_name || '').localeCompare(b.full_name || '');
      if (sortBy === 'views') return (b.profile_views || 0) - (a.profile_views || 0);
      if (sortBy === 'completion') {
        const compA = a.completion_score || calculateProfileCompleteness(a);
        const compB = b.completion_score || calculateProfileCompleteness(b);
        return compB - compA;
      }
      return new Date(b.created_at || b.updated_at).getTime() - new Date(a.created_at || a.updated_at).getTime();
    });

    const total = list.length;
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(200, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit);

    // Map enriched candidate DTO for admin
    const enriched = paginated.map(c => {
      const contactUnlocksCount = (db.contact_unlock_history || []).filter(u => u.candidate_id === c.id).length;
      const resumeUnlocksCount = (db.resume_access_history || []).filter(r => r.candidate_id === c.id).length;
      const completion = c.completion_score || calculateProfileCompleteness(c);
      const hasResume = Boolean((c.resume && c.resume.status === 'active' && c.resume.storage_key) || c.has_resume);

      return {
        ...c,
        completion_score: completion,
        has_resume: hasResume,
        contact_unlocks_count: contactUnlocksCount,
        resume_unlocks_count: resumeUnlocksCount,
        status: c.status || (c.is_active !== false ? 'active' : 'suspended')
      };
    });

    return { candidates: enriched, total, page, limit };
  },

  getAdminCandidateDetail(id: string): any | null {
    const db = getCentralDb();
    const candidate = db.candidates?.find(c => c.id === id || c.slug === id);
    if (!candidate) return null;

    const contactUnlocks = (db.contact_unlock_history || []).filter(u => u.candidate_id === candidate.id).map(u => {
      const employer = db.employer_profiles?.find(e => e.id === u.employer_id);
      return {
        ...u,
        employer_name: employer?.company_name || employer?.contact_person_name || 'Employer Account'
      };
    });

    const resumeUnlocks = (db.resume_access_history || []).filter(r => r.candidate_id === candidate.id).map(r => {
      const employer = db.employer_profiles?.find(e => e.id === r.employer_id);
      return {
        ...r,
        employer_name: employer?.company_name || employer?.contact_person_name || 'Employer Account'
      };
    });

    const auditHistory = (db.audit_logs || []).filter(a => a.target_id === candidate.id || a.metadata?.candidate_id === candidate.id);

    return {
      candidate: {
        ...candidate,
        completion_score: calculateProfileCompleteness(candidate),
        status: candidate.status || (candidate.is_active !== false ? 'active' : 'suspended')
      },
      contact_unlocks: contactUnlocks,
      resume_unlocks: resumeUnlocks,
      audit_history: auditHistory
    };
  },

  updateCandidateByAdmin(id: string, updates: any, adminUser?: any, reason?: string): { success: boolean; candidate?: any; error?: string } {
    const db = getCentralDb();
    const candidate = db.candidates?.find(c => c.id === id);
    if (!candidate) {
      return { success: false, error: 'Candidate not found.' };
    }

    const now = new Date().toISOString();
    Object.assign(candidate, updates, {
      updated_at: now,
      completion_score: calculateProfileCompleteness({ ...candidate, ...updates })
    });

    persistDbToDisk();

    auditLogRepository.record({
      actor_type: 'admin',
      actor_id: adminUser?.id || 'adm_001',
      actor_name: adminUser?.name || 'Administrator',
      action: 'ADMIN_UPDATE_CANDIDATE',
      target_type: 'candidate',
      target_id: candidate.id,
      metadata: {
        candidate_name: candidate.full_name,
        reason: reason || 'Admin updated candidate profile',
        updated_fields: Object.keys(updates)
      }
    });

    return { success: true, candidate };
  },

  setCandidateStatusByAdmin(id: string, status: 'active' | 'suspended' | 'hidden' | 'soft_deleted', reason?: string, adminUser?: any): { success: boolean; candidate?: any; error?: string } {
    const db = getCentralDb();
    const candidate = db.candidates?.find(c => c.id === id);
    if (!candidate) {
      return { success: false, error: 'Candidate not found.' };
    }

    const now = new Date().toISOString();
    candidate.status = status;

    if (status === 'active') {
      candidate.is_active = true;
      if (candidate.privacy_settings) candidate.privacy_settings.profile_visibility = 'public';
    } else if (status === 'suspended') {
      candidate.is_active = false;
    } else if (status === 'hidden') {
      if (!candidate.privacy_settings) candidate.privacy_settings = {};
      candidate.privacy_settings.profile_visibility = 'private';
    } else if (status === 'soft_deleted') {
      candidate.is_active = false;
      candidate.deleted_at = now;
    }

    candidate.updated_at = now;
    persistDbToDisk();

    auditLogRepository.record({
      actor_type: 'admin',
      actor_id: adminUser?.id || 'adm_001',
      actor_name: adminUser?.name || 'Administrator',
      action: `ADMIN_SET_CANDIDATE_STATUS_${status.toUpperCase()}`,
      target_type: 'candidate',
      target_id: candidate.id,
      metadata: {
        candidate_name: candidate.full_name,
        new_status: status,
        reason: reason || `Admin set status to ${status}`
      }
    });

    return { success: true, candidate };
  }
};

// ==========================================
// SUBSCRIPTION PLANS REPOSITORY
// ==========================================

export const subscriptionPlanRepository = {
  getAll(): any[] {
    const db = getCentralDb();
    return [...(db.subscription_plans || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  },

  getActive(): any[] {
    const db = getCentralDb();
    return [...(db.subscription_plans || [])]
      .filter(p => p.is_active !== false)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  },

  getById(id: string): any | null {
    const db = getCentralDb();
    return db.subscription_plans?.find(p => p.id === id || p.slug === id) || null;
  },

  save(plan: any): { success: boolean; plan: any } {
    const db = getCentralDb();
    if (!db.subscription_plans) db.subscription_plans = [];

    const index = db.subscription_plans.findIndex(p => p.id === plan.id || p.slug === plan.slug);
    if (index >= 0) {
      db.subscription_plans[index] = { ...db.subscription_plans[index], ...plan };
    } else {
      db.subscription_plans.push(plan);
    }

    persistDbToDisk();
    return { success: true, plan };
  },

  createPlan(data: any, adminUser?: any): { success: boolean; plan?: any; error?: string } {
    const db = getCentralDb();
    if (!db.subscription_plans) db.subscription_plans = [];

    const slug = (data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();
    if (db.subscription_plans.some(p => p.slug === slug || p.id === data.id)) {
      return { success: false, error: 'A subscription plan with this ID or slug already exists.' };
    }

    const now = new Date().toISOString();
    const newPlan = {
      id: data.id || `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      code: data.code || slug.toUpperCase().replace(/-/g, '_'),
      name: data.name.trim(),
      slug: slug,
      description: data.description?.trim() || '',
      price: Number(data.price) || 0,
      currency: data.currency || 'USD',
      billing_interval: data.billing_interval || 'monthly',
      contact_limit: Number(data.contact_limit) || 0,
      contact_access_limit: Number(data.contact_limit) || 0,
      resume_access_limit: Number(data.resume_access_limit) || 0,
      resume_download_enabled: data.resume_download_enabled !== false,
      phone_access_enabled: data.phone_access_enabled !== false,
      advanced_filters_enabled: data.advanced_filters_enabled !== false,
      features: Array.isArray(data.features) ? data.features : [],
      is_active: data.is_active !== false,
      is_public: data.is_public !== false,
      sort_order: Number(data.sort_order) || db.subscription_plans.length + 1,
      created_at: now,
      updated_at: now
    };

    db.subscription_plans.push(newPlan);
    persistDbToDisk();

    auditLogRepository.record({
      actor_type: 'admin',
      actor_id: adminUser?.id || 'adm_001',
      actor_name: adminUser?.name || 'Administrator',
      action: 'ADMIN_CREATE_PLAN',
      target_type: 'subscription_plan',
      target_id: newPlan.id,
      metadata: { plan_name: newPlan.name, price: newPlan.price, interval: newPlan.billing_interval }
    });

    return { success: true, plan: newPlan };
  },

  updatePlan(id: string, updates: any, adminUser?: any): { success: boolean; plan?: any; error?: string } {
    const db = getCentralDb();
    const plan = db.subscription_plans?.find(p => p.id === id);
    if (!plan) {
      return { success: false, error: 'Subscription plan not found.' };
    }

    const now = new Date().toISOString();
    Object.assign(plan, updates, { updated_at: now });
    persistDbToDisk();

    auditLogRepository.record({
      actor_type: 'admin',
      actor_id: adminUser?.id || 'adm_001',
      actor_name: adminUser?.name || 'Administrator',
      action: 'ADMIN_UPDATE_PLAN',
      target_type: 'subscription_plan',
      target_id: plan.id,
      metadata: { plan_name: plan.name, price: plan.price, is_active: plan.is_active }
    });

    return { success: true, plan };
  },

  togglePlanStatus(id: string, isActive: boolean, adminUser?: any): { success: boolean; plan?: any; error?: string } {
    const db = getCentralDb();
    const plan = db.subscription_plans?.find(p => p.id === id);
    if (!plan) {
      return { success: false, error: 'Subscription plan not found.' };
    }

    const now = new Date().toISOString();
    plan.is_active = isActive;
    plan.updated_at = now;
    persistDbToDisk();

    auditLogRepository.record({
      actor_type: 'admin',
      actor_id: adminUser?.id || 'adm_001',
      actor_name: adminUser?.name || 'Administrator',
      action: isActive ? 'ADMIN_ACTIVATE_PLAN' : 'ADMIN_ARCHIVE_PLAN',
      target_type: 'subscription_plan',
      target_id: plan.id,
      metadata: { plan_name: plan.name, is_active: isActive }
    });

    return { success: true, plan };
  },

  delete(id: string): boolean {
    const db = getCentralDb();
    if (!db.subscription_plans) return false;
    const prevLen = db.subscription_plans.length;
    db.subscription_plans = db.subscription_plans.filter(p => p.id !== id);
    if (db.subscription_plans.length !== prevLen) {
      persistDbToDisk();
      return true;
    }
    return false;
  }
};

// ==========================================
// EMPLOYER PROFILE REPOSITORY
// ==========================================

export const employerRepository = {
  getById(id: string): any | null {
    const db = getCentralDb();
    return db.employer_profiles?.find(e => e.id === id || e.user_id === id) || null;
  },

  getByEmailOrPhone(identifier: string): any | null {
    const db = getCentralDb();
    const clean = identifier.toLowerCase().trim();
    return db.employer_profiles?.find(e => 
      (e.email && e.email.toLowerCase() === clean) ||
      (e.business_email && e.business_email.toLowerCase() === clean) ||
      (e.phone_number && e.phone_number.replace(/\D/g, '') === clean.replace(/\D/g, ''))
    ) || null;
  },

  save(profile: any): { success: boolean; employer: any } {
    const db = getCentralDb();
    if (!db.employer_profiles) db.employer_profiles = [];

    const now = new Date().toISOString();
    const index = db.employer_profiles.findIndex(e => e.id === profile.id || (e.user_id && e.user_id === profile.user_id));

    const prepared = {
      ...profile,
      updated_at: now
    };

    if (index >= 0) {
      db.employer_profiles[index] = prepared;
    } else {
      prepared.created_at = prepared.created_at || now;
      db.employer_profiles.push(prepared);
    }

    persistDbToDisk();
    return { success: true, employer: prepared };
  },

  getAllForAdmin(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    plan_id?: string;
    sort_by?: string;
  } = {}): { employers: any[]; total: number; page: number; limit: number } {
    const db = getCentralDb();
    let list = [...(db.employer_profiles || [])];

    // Status filter
    if (params.status && params.status !== 'all') {
      if (params.status === 'active') {
        list = list.filter(e => e.status !== 'suspended' && e.status !== 'soft_deleted');
      } else if (params.status === 'suspended') {
        list = list.filter(e => e.status === 'suspended');
      } else if (params.status === 'soft_deleted') {
        list = list.filter(e => e.status === 'soft_deleted');
      }
    }

    // Plan filter
    if (params.plan_id && params.plan_id !== 'all') {
      list = list.filter(e => {
        const sub = db.employer_subscriptions?.find(s => s.employer_id === e.id && (s.status === 'ACTIVE' || s.status === 'active'));
        return sub?.plan_id === params.plan_id || sub?.plan_code === params.plan_id;
      });
    }

    // Search query
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(e => {
        const comp = e.company_name?.toLowerCase().includes(q);
        const name = (e.contact_person_name || e.contact_person || e.full_name)?.toLowerCase().includes(q);
        const email = (e.email || e.business_email)?.toLowerCase().includes(q);
        const phone = e.phone_number?.replace(/\D/g, '').includes(q.replace(/\D/g, ''));
        const id = e.id?.toLowerCase().includes(q);
        return comp || name || email || phone || id;
      });
    }

    // Sorting
    const sortBy = params.sort_by || 'recent';
    list.sort((a, b) => {
      if (sortBy === 'company') return (a.company_name || '').localeCompare(b.company_name || '');
      if (sortBy === 'name') return (a.contact_person_name || a.contact_person || '').localeCompare(b.contact_person_name || b.contact_person || '');
      return new Date(b.created_at || b.updated_at).getTime() - new Date(a.created_at || a.updated_at).getTime();
    });

    const total = list.length;
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(200, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit);

    // Enrich each employer
    const enriched = paginated.map(e => {
      const sub = employerSubscriptionRepository.getByEmployerId(e.id);
      const contactUnlocksCount = (db.contact_unlock_history || []).filter(u => u.employer_id === e.id).length;
      const resumeUnlocksCount = (db.resume_access_history || []).filter(r => r.employer_id === e.id).length;
      const recentViewsCount = (db.recently_viewed_candidates || []).filter(r => r.employer_id === e.id).length;

      return {
        ...e,
        subscription: sub,
        plan_name: sub?.plan?.name || 'Free Tier',
        plan_code: sub?.plan_code || 'FREE_MONTHLY',
        subscription_status: sub?.status || 'ACTIVE',
        contacts_used: sub?.contacts_used_this_period || 0,
        contact_limit: sub?.contact_unlock_limit ?? sub?.plan?.contact_limit ?? 0,
        resumes_used: sub?.resumes_used_this_period || 0,
        resume_limit: sub?.resume_access_limit ?? sub?.plan?.resume_access_limit ?? 0,
        total_contact_unlocks: contactUnlocksCount,
        total_resume_unlocks: resumeUnlocksCount,
        recently_viewed_count: recentViewsCount,
        status: e.status || 'active'
      };
    });

    return { employers: enriched, total, page, limit };
  },

  getEmployerActivity(id: string): any | null {
    const db = getCentralDb();
    const employer = db.employer_profiles?.find(e => e.id === id);
    if (!employer) return null;

    const sub = employerSubscriptionRepository.getByEmployerId(employer.id);
    const contactUnlocks = (db.contact_unlock_history || []).filter(u => u.employer_id === employer.id).map(u => {
      const candidate = db.candidates?.find(c => c.id === u.candidate_id);
      return {
        ...u,
        candidate_name: candidate?.full_name || u.candidate_name_snapshot || 'Candidate'
      };
    });

    const resumeUnlocks = (db.resume_access_history || []).filter(r => r.employer_id === employer.id).map(r => {
      const candidate = db.candidates?.find(c => c.id === r.candidate_id);
      return {
        ...r,
        candidate_name: candidate?.full_name || r.candidate_name_snapshot || 'Candidate'
      };
    });

    const payments = (db.payments || []).filter(p => p.employer_id === employer.id);
    const invoices = (db.invoices || []).filter(i => i.employer_id === employer.id);
    const auditLogs = (db.audit_logs || []).filter(a => a.actor_id === employer.id || a.target_id === employer.id || a.metadata?.employer_id === employer.id);

    return {
      employer: {
        ...employer,
        subscription: sub,
        status: employer.status || 'active'
      },
      contact_unlocks: contactUnlocks,
      resume_unlocks: resumeUnlocks,
      payments,
      invoices,
      audit_history: auditLogs
    };
  },

  updateEmployerByAdmin(id: string, updates: any, adminUser?: any, reason?: string): { success: boolean; employer?: any; error?: string } {
    const db = getCentralDb();
    const employer = db.employer_profiles?.find(e => e.id === id);
    if (!employer) {
      return { success: false, error: 'Employer not found.' };
    }

    const now = new Date().toISOString();
    Object.assign(employer, updates, { updated_at: now });
    persistDbToDisk();

    auditLogRepository.record({
      actor_type: 'admin',
      actor_id: adminUser?.id || 'adm_001',
      actor_name: adminUser?.name || 'Administrator',
      action: 'ADMIN_UPDATE_EMPLOYER',
      target_type: 'employer',
      target_id: employer.id,
      metadata: {
        company_name: employer.company_name,
        reason: reason || 'Admin updated employer profile',
        updated_fields: Object.keys(updates)
      }
    });

    return { success: true, employer };
  },

  setEmployerStatusByAdmin(id: string, status: 'active' | 'suspended' | 'soft_deleted', reason?: string, adminUser?: any): { success: boolean; employer?: any; error?: string } {
    const db = getCentralDb();
    const employer = db.employer_profiles?.find(e => e.id === id);
    if (!employer) {
      return { success: false, error: 'Employer not found.' };
    }

    const now = new Date().toISOString();
    employer.status = status;
    employer.updated_at = now;
    persistDbToDisk();

    auditLogRepository.record({
      actor_type: 'admin',
      actor_id: adminUser?.id || 'adm_001',
      actor_name: adminUser?.name || 'Administrator',
      action: `ADMIN_SET_EMPLOYER_STATUS_${status.toUpperCase()}`,
      target_type: 'employer',
      target_id: employer.id,
      metadata: {
        company_name: employer.company_name,
        new_status: status,
        reason: reason || `Admin set status to ${status}`
      }
    });

    return { success: true, employer };
  }
};

// ==========================================
// EMPLOYER SUBSCRIPTION REPOSITORY
// ==========================================

export const employerSubscriptionRepository = {
  getByEmployerId(employerId: string): any | null {
    const db = getCentralDb();
    if (!db.employer_subscriptions) db.employer_subscriptions = [];
    
    // Find latest active, pending, or suspended subscription
    const sub = db.employer_subscriptions.find(
      s => s.employer_id === employerId && 
      (s.status === 'active' || s.status === 'ACTIVE' || s.status === 'pending' || s.status === 'PENDING_PAYMENT' || s.status === 'SUSPENDED')
    ) || null;

    if (!sub) {
      // Return default free tier representation
      const freePlan = db.subscription_plans?.find(p => p.id === 'plan-free' || p.code === 'FREE_MONTHLY') || DEFAULT_SUBSCRIPTION_PLANS[0];
      return {
        id: `sub_free_${employerId}`,
        employer_id: employerId,
        plan_id: freePlan.id,
        plan_code: freePlan.code || 'FREE_MONTHLY',
        plan: freePlan,
        status: 'ACTIVE',
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 86400000 * 365).toISOString(),
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 86400000 * 365).toISOString(),
        contact_unlock_limit: freePlan.contact_limit || 0,
        contact_access_limit: freePlan.contact_limit || 0,
        contacts_used_this_period: 0,
        resume_access_limit: freePlan.resume_access_limit || 0,
        resumes_used_this_period: 0,
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    // Attach plan metadata
    if (!sub.plan && sub.plan_id) {
      sub.plan = db.subscription_plans?.find(p => p.id === sub.plan_id || p.code === sub.plan_code);
    }
    return sub;
  },

  getAll(limit: number = 100): any[] {
    const db = getCentralDb();
    const list = [...(db.employer_subscriptions || [])];
    return list.map(sub => {
      const employer = db.employer_profiles?.find(e => e.id === sub.employer_id);
      const plan = db.subscription_plans?.find(p => p.id === sub.plan_id);
      return {
        ...sub,
        employer_name: employer?.contact_person_name || employer?.full_name || 'Employer',
        company_name: employer?.company_name || 'Company',
        plan_name: plan?.name || sub.plan?.name || 'Standard Plan'
      };
    }).slice(0, limit);
  },

  save(sub: any): { success: boolean; subscription: any } {
    const db = getCentralDb();
    if (!db.employer_subscriptions) db.employer_subscriptions = [];

    const now = new Date().toISOString();
    const index = db.employer_subscriptions.findIndex(s => s.id === sub.id || s.employer_id === sub.employer_id);

    const prepared = {
      ...sub,
      updated_at: now
    };

    if (index >= 0) {
      db.employer_subscriptions[index] = prepared;
    } else {
      prepared.created_at = prepared.created_at || now;
      db.employer_subscriptions.push(prepared);
    }

    persistDbToDisk();
    return { success: true, subscription: prepared };
  },

  subscribe(employerId: string, planId: string): { success: boolean; subscription: any; message: string } {
    const db = getCentralDb();
    const plan = db.subscription_plans?.find(p => p.id === planId || p.slug === planId || p.code === planId);
    if (!plan) {
      return { success: false, subscription: null, message: 'Plan not found.' };
    }

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 86400000 * 30).toISOString(); // 30 days

    const newSub = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      employer_id: employerId,
      plan_id: plan.id,
      plan_code: plan.code || 'CUSTOM_PLAN',
      plan: plan,
      status: 'ACTIVE',
      started_at: now,
      expires_at: expiresAt,
      current_period_start: now,
      current_period_end: expiresAt,
      contact_unlock_limit: plan.contact_limit ?? plan.contact_access_limit ?? 0,
      contact_access_limit: plan.contact_limit ?? plan.contact_access_limit ?? 0,
      contacts_used_this_period: 0,
      resume_access_limit: plan.resume_access_limit ?? 0,
      resumes_used_this_period: 0,
      cancel_at_period_end: false,
      payment_provider: 'development',
      provider_subscription_id: `sub_ref_${Date.now()}`,
      created_at: now,
      updated_at: now
    };

    if (!db.employer_subscriptions) db.employer_subscriptions = [];
    const existingIdx = db.employer_subscriptions.findIndex(s => s.employer_id === employerId);
    if (existingIdx >= 0) {
      db.employer_subscriptions[existingIdx] = newSub;
    } else {
      db.employer_subscriptions.push(newSub);
    }

    persistDbToDisk();
    return { success: true, subscription: newSub, message: `Subscribed to ${plan.name} successfully!` };
  },

  adminUpdateSubscription(employerId: string, updates: {
    plan_id?: string;
    status?: string;
    extend_days?: number;
    contact_limit_override?: number;
    resume_limit_override?: number;
    cancel_at_period_end?: boolean;
    reason?: string;
  }, adminUser?: any): { success: boolean; subscription?: any; error?: string } {
    const db = getCentralDb();
    let sub = this.getByEmployerId(employerId);
    const now = new Date().toISOString();

    if (updates.plan_id) {
      const plan = db.subscription_plans?.find(p => p.id === updates.plan_id || p.code === updates.plan_id || p.slug === updates.plan_id);
      if (plan) {
        sub.plan_id = plan.id;
        sub.plan_code = plan.code || 'CUSTOM';
        sub.plan = plan;
        sub.contact_unlock_limit = updates.contact_limit_override !== undefined ? updates.contact_limit_override : (plan.contact_limit ?? 0);
        sub.contact_access_limit = sub.contact_unlock_limit;
        sub.resume_access_limit = updates.resume_limit_override !== undefined ? updates.resume_limit_override : (plan.resume_access_limit ?? 0);
      }
    }

    if (updates.status) {
      sub.status = updates.status;
    }

    if (updates.contact_limit_override !== undefined) {
      sub.contact_unlock_limit = Number(updates.contact_limit_override);
      sub.contact_access_limit = sub.contact_unlock_limit;
    }

    if (updates.resume_limit_override !== undefined) {
      sub.resume_access_limit = Number(updates.resume_limit_override);
    }

    if (updates.cancel_at_period_end !== undefined) {
      sub.cancel_at_period_end = updates.cancel_at_period_end;
    }

    if (updates.extend_days && updates.extend_days > 0) {
      const currentEnd = sub.current_period_end ? new Date(sub.current_period_end).getTime() : Date.now();
      const newEnd = new Date(Math.max(Date.now(), currentEnd) + updates.extend_days * 86400000).toISOString();
      sub.current_period_end = newEnd;
      sub.expires_at = newEnd;
    }

    sub.updated_at = now;
    this.save(sub);

    auditLogRepository.record({
      actor_type: 'admin',
      actor_id: adminUser?.id || 'adm_001',
      actor_name: adminUser?.name || 'Administrator',
      action: 'ADMIN_UPDATE_SUBSCRIPTION',
      target_type: 'employer_subscription',
      target_id: sub.id,
      metadata: {
        employer_id: employerId,
        plan_id: sub.plan_id,
        status: sub.status,
        reason: updates.reason || 'Admin modified employer subscription'
      }
    });

    return { success: true, subscription: sub };
  },

  adminResetDevQuotas(employerId: string, adminUser?: any): { success: boolean; subscription?: any; error?: string } {
    const sub = this.getByEmployerId(employerId);
    if (!sub) return { success: false, error: 'Subscription not found.' };

    const now = new Date().toISOString();
    sub.contacts_used_this_period = 0;
    sub.resumes_used_this_period = 0;
    sub.updated_at = now;
    this.save(sub);

    auditLogRepository.record({
      actor_type: 'admin',
      actor_id: adminUser?.id || 'adm_001',
      actor_name: adminUser?.name || 'Administrator',
      action: 'ADMIN_RESET_QUOTAS',
      target_type: 'employer_subscription',
      target_id: sub.id,
      metadata: { employer_id: employerId }
    });

    return { success: true, subscription: sub };
  }
};

// ==========================================
// PAYMENT TRANSACTIONS REPOSITORY
// ==========================================

export const paymentRepository = {
  create(payment: any): { success: boolean; payment: any } {
    const db = getCentralDb();
    if (!db.payments) db.payments = [];

    const now = new Date().toISOString();
    const prepared = {
      id: payment.id || `pay_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      payment_reference: payment.payment_reference || `PAY-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      idempotency_key: payment.idempotency_key || `idem_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      status: payment.status || 'CREATED',
      created_at: payment.created_at || now,
      updated_at: now,
      ...payment
    };

    db.payments.unshift(prepared);
    persistDbToDisk();
    return { success: true, payment: prepared };
  },

  getById(id: string): any | null {
    const db = getCentralDb();
    return (db.payments || []).find(p => p.id === id || p.provider_payment_id === id || p.provider_order_id === id) || null;
  },

  getByReference(ref: string): any | null {
    const db = getCentralDb();
    return (db.payments || []).find(p => p.payment_reference === ref) || null;
  },

  getByIdempotencyKey(key: string): any | null {
    const db = getCentralDb();
    return (db.payments || []).find(p => p.idempotency_key === key) || null;
  },

  getByEmployerId(employerId: string): any[] {
    const db = getCentralDb();
    return (db.payments || [])
      .filter(p => p.employer_id === employerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  update(id: string, updates: Partial<any>): { success: boolean; payment?: any } {
    const db = getCentralDb();
    if (!db.payments) db.payments = [];

    const index = db.payments.findIndex(p => p.id === id || p.provider_payment_id === id || p.provider_order_id === id);
    if (index === -1) return { success: false };

    const now = new Date().toISOString();
    const updated = {
      ...db.payments[index],
      ...updates,
      updated_at: now
    };

    db.payments[index] = updated;
    persistDbToDisk();
    return { success: true, payment: updated };
  },

  getAll(limit: number = 100): any[] {
    const db = getCentralDb();
    const list = [...(db.payments || [])];
    return list.slice(0, limit);
  }
};

// ==========================================
// INVOICES & RECEIPTS REPOSITORY
// ==========================================

export const invoiceRepository = {
  create(invoice: any): { success: boolean; invoice: any } {
    const db = getCentralDb();
    if (!db.invoices) db.invoices = [];

    const now = new Date().toISOString();
    const yearMonth = `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const invoiceNum = invoice.invoice_number || `INV-${yearMonth}-${String((db.invoices.length || 0) + 1001).padStart(5, '0')}`;

    const prepared = {
      id: invoice.id || `inv_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      invoice_number: invoiceNum,
      issued_at: invoice.issued_at || now,
      created_at: invoice.created_at || now,
      status: invoice.status || 'PAID',
      ...invoice
    };

    db.invoices.unshift(prepared);
    persistDbToDisk();
    return { success: true, invoice: prepared };
  },

  getById(id: string): any | null {
    const db = getCentralDb();
    return (db.invoices || []).find(inv => inv.id === id || inv.invoice_number === id) || null;
  },

  getByPaymentId(paymentId: string): any | null {
    const db = getCentralDb();
    return (db.invoices || []).find(inv => inv.payment_id === paymentId) || null;
  },

  getByEmployerId(employerId: string): any[] {
    const db = getCentralDb();
    return (db.invoices || [])
      .filter(inv => inv.employer_id === employerId)
      .sort((a, b) => new Date(b.issued_at || b.created_at).getTime() - new Date(a.issued_at || a.created_at).getTime());
  },

  getAll(limit: number = 100): any[] {
    const db = getCentralDb();
    return [...(db.invoices || [])].slice(0, limit);
  }
};

// ==========================================
// SAVED CANDIDATES REPOSITORY
// ==========================================

export const savedCandidateRepository = {
  getByEmployer(employerId: string): any[] {
    const db = getCentralDb();
    const list = (db.saved_candidates || []).filter(s => s.employer_id === employerId);
    
    // Attach candidate objects
    return list.map(item => {
      const candidate = db.candidates?.find(c => c.id === item.candidate_id);
      return {
        ...item,
        candidate: candidate || null
      };
    }).sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());
  },

  isSaved(employerId: string, candidateId: string): boolean {
    const db = getCentralDb();
    return (db.saved_candidates || []).some(s => s.employer_id === employerId && s.candidate_id === candidateId);
  },

  save(employerId: string, candidateId: string, notes: string = ''): { success: boolean; saved: any } {
    const db = getCentralDb();
    if (!db.saved_candidates) db.saved_candidates = [];

    const now = new Date().toISOString();
    const existing = db.saved_candidates.find(s => s.employer_id === employerId && s.candidate_id === candidateId);

    if (existing) {
      existing.notes = notes;
      existing.updated_at = now;
      persistDbToDisk();
      return { success: true, saved: existing };
    }

    const newRecord = {
      id: `save_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      employer_id: employerId,
      candidate_id: candidateId,
      notes: notes,
      created_at: now,
      updated_at: now
    };

    db.saved_candidates.unshift(newRecord);
    persistDbToDisk();
    return { success: true, saved: newRecord };
  },

  updateNotes(employerId: string, candidateId: string, notes: string): { success: boolean } {
    const db = getCentralDb();
    if (!db.saved_candidates) return { success: false };
    const found = db.saved_candidates.find(s => s.employer_id === employerId && s.candidate_id === candidateId);
    if (found) {
      found.notes = notes;
      found.updated_at = new Date().toISOString();
      persistDbToDisk();
      return { success: true };
    }
    return { success: false };
  },

  remove(employerId: string, candidateId: string): boolean {
    const db = getCentralDb();
    if (!db.saved_candidates) return false;
    const initialLen = db.saved_candidates.length;
    db.saved_candidates = db.saved_candidates.filter(s => !(s.employer_id === employerId && s.candidate_id === candidateId));
    if (db.saved_candidates.length !== initialLen) {
      persistDbToDisk();
      return true;
    }
    return false;
  }
};

// ==========================================
// RECENTLY VIEWED CANDIDATES REPOSITORY
// ==========================================

export const recentlyViewedRepository = {
  getByEmployer(employerId: string, limit: number = 20): any[] {
    const db = getCentralDb();
    const list = (db.recently_viewed_candidates || []).filter(r => r.employer_id === employerId);
    
    // Sort recent first
    list.sort((a, b) => new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime());
    const sliced = list.slice(0, limit);

    return sliced.map(item => {
      const candidate = db.candidates?.find(c => c.id === item.candidate_id);
      return {
        ...item,
        candidate: candidate || null
      };
    });
  },

  record(employerId: string, candidateId: string): void {
    const db = getCentralDb();
    if (!db.recently_viewed_candidates) db.recently_viewed_candidates = [];

    const now = new Date().toISOString();
    // Remove if already in list to bump to top
    db.recently_viewed_candidates = db.recently_viewed_candidates.filter(
      r => !(r.employer_id === employerId && r.candidate_id === candidateId)
    );

    db.recently_viewed_candidates.unshift({
      id: `rv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      employer_id: employerId,
      candidate_id: candidateId,
      viewed_at: now
    });

    // Cap at 100 items per employer
    persistDbToDisk();
  }
};

// ==========================================
// CONTACT UNLOCK & ENTITLEMENT REPOSITORY
// ==========================================

export const contactUnlockRepository = {
  isUnlocked(employerId: string, candidateId: string): boolean {
    const db = getCentralDb();
    return (db.contact_unlock_history || []).some(u => u.employer_id === employerId && u.candidate_id === candidateId);
  },

  getUnlocksByEmployer(employerId: string): any[] {
    const db = getCentralDb();
    const list = (db.contact_unlock_history || []).filter(u => u.employer_id === employerId);
    return list.map(item => {
      const candidate = db.candidates?.find(c => c.id === item.candidate_id);
      return {
        ...item,
        candidate: candidate || null
      };
    }).sort((a, b) => new Date(b.unlocked_at || b.accessed_at).getTime() - new Date(a.unlocked_at || a.accessed_at).getTime());
  },

  unlock(
    employerId: string, 
    candidateId: string
  ): { success: boolean; message: string; candidate?: any; remainingAllowance?: number } {
    const db = getCentralDb();
    if (!db.contact_unlock_history) db.contact_unlock_history = [];

    // 1. Check if candidate exists
    const candidate = db.candidates?.find(c => c.id === candidateId);
    if (!candidate) {
      return { success: false, message: 'Candidate profile not found.' };
    }

    // 2. Check if already unlocked
    const alreadyUnlocked = db.contact_unlock_history.find(u => u.employer_id === employerId && u.candidate_id === candidateId);
    if (alreadyUnlocked) {
      return {
        success: true,
        message: 'Candidate contact details are already unlocked for your account.',
        candidate: candidate
      };
    }

    // 3. Check active employer subscription & entitlement
    const sub = employerSubscriptionRepository.getByEmployerId(employerId);
    const plan = sub?.plan || db.subscription_plans?.find(p => p.id === sub?.plan_id) || DEFAULT_SUBSCRIPTION_PLANS[0];
    const limit = plan.contact_limit ?? 0;
    const used = sub.contacts_used_this_period || 0;

    if (limit <= 0) {
      return {
        success: false,
        message: 'Your current Free plan does not include direct contact unlocks. Please upgrade to a Starter, Pro or Unlimited plan to view phone numbers.'
      };
    }

    if (used >= limit) {
      return {
        success: false,
        message: `You have reached your plan limit of ${limit} contact unlocks this billing period. Please upgrade your subscription to unlock more candidates.`
      };
    }

    // 4. Record the unlock
    const now = new Date().toISOString();
    const newUnlock = {
      id: `unlock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      employer_id: employerId,
      candidate_id: candidateId,
      subscription_id: sub.id,
      unlocked_at: now,
      accessed_at: now,
      candidate_name_snapshot: candidate.full_name,
      contact_type_accessed: 'phone_and_whatsapp'
    };

    db.contact_unlock_history.unshift(newUnlock);

    // 5. Increment usage on subscription
    sub.contacts_used_this_period = used + 1;
    employerSubscriptionRepository.save(sub);

    // 6. Log audit event
    auditLogRepository.record({
      actor_type: 'employer',
      actor_id: employerId,
      actor_name: 'Employer Account',
      action: 'UNLOCK_CANDIDATE_CONTACT',
      target_type: 'candidate',
      target_id: candidateId,
      metadata: {
        candidate_name: candidate.full_name,
        plan_id: plan.id,
        contacts_used: sub.contacts_used_this_period,
        contacts_limit: limit
      }
    });

    persistDbToDisk();

    return {
      success: true,
      message: `Contact unlocked successfully! (${limit - sub.contacts_used_this_period} unlocks remaining in your plan)`,
      candidate: candidate,
      remainingAllowance: limit - sub.contacts_used_this_period
    };
  },

  getAllContactUnlocksForAdmin(params: {
    page?: number;
    limit?: number;
    search?: string;
    employer_id?: string;
    candidate_id?: string;
  } = {}): { unlocks: any[]; total: number; page: number; limit: number } {
    const db = getCentralDb();
    let list = [...(db.contact_unlock_history || [])];

    if (params.employer_id && params.employer_id !== 'all') {
      list = list.filter(u => u.employer_id === params.employer_id);
    }
    if (params.candidate_id && params.candidate_id !== 'all') {
      list = list.filter(u => u.candidate_id === params.candidate_id);
    }
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(u => {
        const cName = u.candidate_name_snapshot?.toLowerCase().includes(q);
        const empId = u.employer_id?.toLowerCase().includes(q);
        const candId = u.candidate_id?.toLowerCase().includes(q);
        return cName || empId || candId;
      });
    }

    list.sort((a, b) => new Date(b.unlocked_at || b.accessed_at).getTime() - new Date(a.unlocked_at || a.accessed_at).getTime());

    const total = list.length;
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(200, Math.max(1, params.limit || 50));
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit);

    const enriched = paginated.map(u => {
      const employer = db.employer_profiles?.find(e => e.id === u.employer_id);
      const candidate = db.candidates?.find(c => c.id === u.candidate_id);
      return {
        ...u,
        employer_name: employer?.company_name || employer?.contact_person_name || 'Employer Account',
        employer_phone: employer?.phone_number,
        candidate_name: candidate?.full_name || u.candidate_name_snapshot || 'Candidate',
        candidate_role: candidate?.job_role_name || candidate?.skill_category,
        candidate_country: candidate?.country
      };
    });

    return { unlocks: enriched, total, page, limit };
  }
};

// ==========================================
// RESUME ACCESS & AUDIT REPOSITORY
// ==========================================

export const resumeAccessRepository = {
  hasAccess(employerId: string, candidateId: string): boolean {
    const db = getCentralDb();
    return (db.resume_access_history || []).some(
      r => r.employer_id === employerId && r.candidate_id === candidateId
    );
  },

  getAccessHistoryByEmployer(employerId: string): any[] {
    const db = getCentralDb();
    const list = (db.resume_access_history || []).filter(r => r.employer_id === employerId);
    return list.map(item => {
      const candidate = db.candidates?.find(c => c.id === item.candidate_id);
      return {
        ...item,
        candidate: candidate ? sanitizeCandidateForResponse(candidate, employerId) : null
      };
    }).sort((a, b) => new Date(b.accessed_at).getTime() - new Date(a.accessed_at).getTime());
  },

  getAdminResumeList(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    visibility?: string;
  } = {}): { resumes: any[]; total: number; page: number; limit: number } {
    const db = getCentralDb();
    const candidates = db.candidates || [];

    // Find all candidates with resume records
    let list: any[] = [];
    candidates.forEach(c => {
      if (c.resume && c.resume.storage_key) {
        const unlocksCount = (db.resume_access_history || []).filter(r => r.candidate_id === c.id).length;
        list.push({
          resume_id: c.resume.id,
          candidate_id: c.id,
          candidate_name: c.full_name,
          candidate_slug: c.slug,
          candidate_role: c.job_role_name || c.skill_category,
          candidate_country: c.country,
          original_filename: c.resume.original_filename,
          file_size: c.resume.file_size,
          content_type: c.resume.content_type,
          uploaded_at: c.resume.uploaded_at,
          access_visibility: c.resume.access_visibility || c.privacy_settings?.resume_visibility || 'PRIVATE',
          status: c.resume.status || 'active',
          is_verified: Boolean(c.resume.is_verified),
          total_unlocks_count: unlocksCount
        });
      }
    });

    if (params.status && params.status !== 'all') {
      list = list.filter(r => r.status === params.status);
    }
    if (params.visibility && params.visibility !== 'all') {
      list = list.filter(r => r.access_visibility === params.visibility);
    }
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(r => 
        r.candidate_name?.toLowerCase().includes(q) ||
        r.original_filename?.toLowerCase().includes(q) ||
        r.candidate_role?.toLowerCase().includes(q) ||
        r.candidate_id?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());

    const total = list.length;
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(200, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit);

    return { resumes: paginated, total, page, limit };
  },

  moderateResume(candidateId: string, status: 'active' | 'flagged' | 'archived' | 'deleted', reason?: string, adminUser?: any): { success: boolean; candidate?: any; error?: string } {
    const db = getCentralDb();
    const candidate = db.candidates?.find(c => c.id === candidateId);
    if (!candidate || !candidate.resume) {
      return { success: false, error: 'Candidate or candidate resume document not found.' };
    }

    const now = new Date().toISOString();
    candidate.resume.status = status;
    candidate.resume.moderated_at = now;
    candidate.resume.moderated_by = adminUser?.name || 'Administrator';
    candidate.resume.moderation_reason = reason;

    if (status === 'deleted' || status === 'archived') {
      candidate.has_resume = false;
    } else {
      candidate.has_resume = true;
    }

    candidate.updated_at = now;
    persistDbToDisk();

    auditLogRepository.record({
      actor_type: 'admin',
      actor_id: adminUser?.id || 'adm_001',
      actor_name: adminUser?.name || 'Administrator',
      action: `ADMIN_MODERATE_RESUME_${status.toUpperCase()}`,
      target_type: 'candidate_resume',
      target_id: candidate.resume.id,
      metadata: {
        candidate_id: candidateId,
        candidate_name: candidate.full_name,
        new_status: status,
        reason: reason || `Admin marked resume as ${status}`
      }
    });

    return { success: true, candidate: sanitizeCandidateForResponse(candidate, undefined, true) };
  },

  getAllResumeUnlocksForAdmin(params: {
    page?: number;
    limit?: number;
    search?: string;
    employer_id?: string;
    candidate_id?: string;
    action?: string;
  } = {}): { unlocks: any[]; total: number; page: number; limit: number } {
    const db = getCentralDb();
    let list = [...(db.resume_access_history || [])];

    if (params.employer_id && params.employer_id !== 'all') {
      list = list.filter(r => r.employer_id === params.employer_id);
    }
    if (params.candidate_id && params.candidate_id !== 'all') {
      list = list.filter(r => r.candidate_id === params.candidate_id);
    }
    if (params.action && params.action !== 'all') {
      list = list.filter(r => r.action === params.action);
    }
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(r => {
        const cName = r.candidate_name_snapshot?.toLowerCase().includes(q);
        const fName = r.file_name_snapshot?.toLowerCase().includes(q);
        const empId = r.employer_id?.toLowerCase().includes(q);
        const candId = r.candidate_id?.toLowerCase().includes(q);
        return cName || fName || empId || candId;
      });
    }

    list.sort((a, b) => new Date(b.accessed_at).getTime() - new Date(a.accessed_at).getTime());

    const total = list.length;
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(200, Math.max(1, params.limit || 50));
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit);

    const enriched = paginated.map(r => {
      const employer = db.employer_profiles?.find(e => e.id === r.employer_id);
      const candidate = db.candidates?.find(c => c.id === r.candidate_id);
      return {
        ...r,
        employer_name: employer?.company_name || employer?.contact_person_name || 'Employer Account',
        employer_phone: employer?.phone_number,
        candidate_name: candidate?.full_name || r.candidate_name_snapshot || 'Candidate',
        candidate_role: candidate?.job_role_name || candidate?.skill_category,
        file_name: r.file_name_snapshot || candidate?.resume?.original_filename || 'Resume.pdf'
      };
    });

    return { unlocks: enriched, total, page, limit };
  },

  authorizeAndRecordAccess(
    employerId: string,
    candidateId: string,
    action: 'view' | 'download' = 'view'
  ): { 
    allowed: boolean; 
    status: number; 
    message: string; 
    resume?: any; 
    candidate?: any; 
    remainingAllowance?: number;
    alreadyUnlocked?: boolean;
  } {
    const db = getCentralDb();
    if (!db.resume_access_history) db.resume_access_history = [];

    // 1. Verify candidate exists
    const candidate = db.candidates?.find(c => c.id === candidateId);
    if (!candidate) {
      return { allowed: false, status: 404, message: 'Candidate profile not found.' };
    }

    // 2. Check if candidate has an active resume
    const resume = candidate.resume;
    if (!resume || resume.status !== 'active' || !resume.storage_key) {
      return { allowed: false, status: 404, message: 'No active verified resume document attached to this candidate profile.' };
    }

    // 3. CANDIDATE PRIVACY OVERRIDES SUBSCRIPTION
    const visibility = resume.access_visibility || candidate.privacy_settings?.resume_visibility || 'PRIVATE';

    if (visibility === 'PRIVATE') {
      return {
        allowed: false,
        status: 403,
        message: 'This candidate has set their resume privacy to Private. Direct access is restricted.'
      };
    }

    if (visibility === 'EMPLOYER_REQUEST_REQUIRED') {
      return {
        allowed: false,
        status: 403,
        message: 'This candidate requires explicit direct permission request before their resume can be accessed.'
      };
    }

    // visibility is 'ELIGIBLE_EMPLOYERS'
    // 4. Check if employer already has access (idempotent / no duplicate quota deduction)
    const existing = db.resume_access_history.find(
      r => r.employer_id === employerId && r.candidate_id === candidateId
    );

    if (existing) {
      existing.accessed_at = new Date().toISOString();
      if (action) existing.last_action = action;
      persistDbToDisk();

      return {
        allowed: true,
        status: 200,
        message: 'Resume access already granted.',
        resume,
        candidate,
        alreadyUnlocked: true
      };
    }

    // 5. Check employer subscription entitlement
    const sub = employerSubscriptionRepository.getByEmployerId(employerId);
    const plan = sub?.plan || db.subscription_plans?.find(p => p.id === sub?.plan_id) || DEFAULT_SUBSCRIPTION_PLANS[0];
    
    const resumeLimit = plan.resume_access_limit ?? plan.contact_limit ?? 0;
    const resumesUsed = sub.resumes_used_this_period ?? 0;

    if (resumeLimit <= 0) {
      return {
        allowed: false,
        status: 403,
        message: 'Your current Free employer plan does not include resume viewing or downloads. Please upgrade to Starter, Pro, or Unlimited to access candidate resumes.'
      };
    }

    if (resumesUsed >= resumeLimit) {
      return {
        allowed: false,
        status: 403,
        message: `You have reached your plan limit of ${resumeLimit} resume unlocks for this billing period. Please upgrade your subscription.`
      };
    }

    // 6. Record access history
    const now = new Date().toISOString();
    const newAccess = {
      id: `res_acc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      employer_id: employerId,
      candidate_id: candidateId,
      resume_id: resume.id,
      action: action,
      subscription_id: sub.id,
      accessed_at: now,
      candidate_name_snapshot: candidate.full_name,
      file_name_snapshot: resume.original_filename
    };

    db.resume_access_history.unshift(newAccess);

    // 7. Increment subscription usage
    sub.resumes_used_this_period = resumesUsed + 1;
    employerSubscriptionRepository.save(sub);

    // 8. Log audit event
    auditLogRepository.record({
      actor_type: 'employer',
      actor_id: employerId,
      actor_name: 'Employer Account',
      action: action === 'download' ? 'DOWNLOAD_CANDIDATE_RESUME' : 'VIEW_CANDIDATE_RESUME',
      target_type: 'candidate_resume',
      target_id: resume.id,
      metadata: {
        candidate_id: candidateId,
        candidate_name: candidate.full_name,
        resume_filename: resume.original_filename,
        plan_id: plan.id,
        resumes_used: sub.resumes_used_this_period,
        resume_limit: resumeLimit
      }
    });

    persistDbToDisk();

    return {
      allowed: true,
      status: 200,
      message: `Resume unlocked successfully! (${resumeLimit - sub.resumes_used_this_period} resume unlocks remaining in your plan)`,
      resume,
      candidate,
      remainingAllowance: resumeLimit - sub.resumes_used_this_period,
      alreadyUnlocked: false
    };
  }
};

// ==========================================
// AUDIT LOGS REPOSITORY
// ==========================================

export const auditLogRepository = {
  record(entry: {
    actor_type: 'employer' | 'candidate' | 'admin' | 'system';
    actor_id: string;
    actor_name: string;
    action: string;
    target_type: string;
    target_id: string;
    metadata?: any;
  }): void {
    const db = getCentralDb();
    if (!db.audit_logs) db.audit_logs = [];

    const now = new Date().toISOString();
    db.audit_logs.unshift({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...entry,
      timestamp: now
    });

    // Cap audit logs at 1000 items
    if (db.audit_logs.length > 1000) {
      db.audit_logs = db.audit_logs.slice(0, 1000);
    }

    persistDbToDisk();
  },

  getAll(limit: number = 100): any[] {
    const db = getCentralDb();
    return (db.audit_logs || []).slice(0, limit);
  },

  queryLogsForAdmin(params: {
    page?: number;
    limit?: number;
    search?: string;
    actor_type?: string;
    actor_id?: string;
    target_type?: string;
    target_id?: string;
    action?: string;
    start_date?: string;
    end_date?: string;
    from_date?: string;
    to_date?: string;
  } = {}): { logs: any[]; total: number; page: number; limit: number } {
    const db = getCentralDb();
    let list = [...(db.audit_logs || [])];

    if (params.actor_type && params.actor_type !== 'all') {
      list = list.filter(l => l.actor_type === params.actor_type);
    }
    if (params.actor_id && params.actor_id !== 'all') {
      list = list.filter(l => l.actor_id === params.actor_id);
    }
    if (params.target_type && params.target_type !== 'all') {
      list = list.filter(l => l.target_type === params.target_type);
    }
    if (params.target_id && params.target_id !== 'all') {
      list = list.filter(l => l.target_id === params.target_id);
    }
    if (params.action && params.action !== 'all') {
      list = list.filter(l => l.action?.toLowerCase().includes(params.action!.toLowerCase()));
    }
    const startDate = params.start_date || params.from_date;
    if (startDate) {
      const start = new Date(startDate).getTime();
      list = list.filter(l => new Date(l.timestamp).getTime() >= start);
    }
    const endDate = params.end_date || params.to_date;
    if (endDate) {
      const end = new Date(endDate).getTime() + 86400000;
      list = list.filter(l => new Date(l.timestamp).getTime() <= end);
    }
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(l => 
        l.actor_name?.toLowerCase().includes(q) ||
        l.action?.toLowerCase().includes(q) ||
        l.target_type?.toLowerCase().includes(q) ||
        l.target_id?.toLowerCase().includes(q) ||
        JSON.stringify(l.metadata || {}).toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const total = list.length;
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(200, Math.max(1, params.limit || 50));
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit);

    return { logs: paginated, total, page, limit };
  }
};

// ==========================================
// PLATFORM SETTINGS REPOSITORY
// ==========================================

export const platformSettingsRepository = {
  get(): DbPlatformSettings {
    const db = getCentralDb();
    if (!db.platform_settings) {
      db.platform_settings = { ...DEFAULT_PLATFORM_SETTINGS };
      persistDbToDisk();
    }
    return db.platform_settings;
  },

  getSettings(): DbPlatformSettings {
    return this.get();
  },

  update(updates: Partial<DbPlatformSettings>, adminUser?: any): { success: boolean; settings: DbPlatformSettings } {
    const db = getCentralDb();
    const current = db.platform_settings || { ...DEFAULT_PLATFORM_SETTINGS };
    const now = new Date().toISOString();

    const previousMaintenance = current.maintenance_mode_enabled;
    const newMaintenance = updates.maintenance_mode_enabled !== undefined ? updates.maintenance_mode_enabled : previousMaintenance;

    const merged: DbPlatformSettings = {
      ...current,
      ...updates,
      updated_at: now,
      updated_by: adminUser?.name || adminUser?.username || 'Administrator'
    };

    db.platform_settings = merged;
    persistDbToDisk();

    // Record audit event
    auditLogRepository.record({
      actor_type: 'admin',
      actor_id: adminUser?.id || 'adm_001',
      actor_name: adminUser?.name || 'Administrator',
      action: previousMaintenance !== newMaintenance 
        ? (newMaintenance ? 'MAINTENANCE_MODE_ENABLED' : 'MAINTENANCE_MODE_DISABLED') 
        : 'UPDATE_PLATFORM_SETTINGS',
      target_type: 'platform_settings',
      target_id: 'global',
      metadata: {
        maintenance_mode: merged.maintenance_mode_enabled,
        candidate_reg: merged.candidate_registration_enabled,
        employer_reg: merged.employer_registration_enabled,
        resume_upload: merged.resume_upload_enabled
      }
    });

    return { success: true, settings: merged };
  },

  updateSettings(updates: Partial<DbPlatformSettings>, adminUser?: any): { success: boolean; settings: DbPlatformSettings } {
    return this.update(updates, adminUser);
  }
};

// ==========================================
// ADMIN USER REPOSITORY
// ==========================================

export const adminUserRepository = {
  getAll(): any[] {
    const db = getCentralDb();
    return (db.admin_users || []).map(u => ({
      id: u.id,
      username: u.username,
      role: u.role || 'admin',
      name: u.name,
      email: u.email || `${u.username}@candidateportal.com`,
      status: u.status || 'active',
      created_at: u.created_at || db.system_meta.initialized_at,
      last_login: u.last_login
    }));
  },

  getById(id: string): any | null {
    const db = getCentralDb();
    const user = db.admin_users?.find(u => u.id === id || u.username === id);
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      role: user.role || 'admin',
      name: user.name,
      email: user.email,
      status: user.status || 'active',
      created_at: user.created_at,
      last_login: user.last_login
    };
  },

  create(data: { username: string; name: string; role: string; password_hash: string; email?: string }, actorAdmin?: any): { success: boolean; user?: any; error?: string } {
    const db = getCentralDb();
    if (!db.admin_users) db.admin_users = [];

    const cleanUsername = data.username.toLowerCase().trim();
    if (db.admin_users.some(u => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: 'An administrator with this username already exists.' };
    }

    const now = new Date().toISOString();
    const newUser = {
      id: `adm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      username: cleanUsername,
      name: data.name.trim(),
      role: data.role || 'admin',
      email: data.email?.trim() || `${cleanUsername}@candidateportal.com`,
      status: 'active' as const,
      password_hash: data.password_hash,
      created_at: now
    };

    db.admin_users.push(newUser);
    persistDbToDisk();

    auditLogRepository.record({
      actor_type: 'admin',
      actor_id: actorAdmin?.id || 'adm_001',
      actor_name: actorAdmin?.name || 'Super Administrator',
      action: 'CREATE_ADMIN_USER',
      target_type: 'admin_user',
      target_id: newUser.id,
      metadata: { username: newUser.username, role: newUser.role }
    });

    return {
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        name: newUser.name,
        email: newUser.email,
        status: newUser.status,
        created_at: newUser.created_at
      }
    };
  },

  update(id: string, updates: { name?: string; role?: string; email?: string; status?: 'active' | 'suspended'; password_hash?: string }, actorAdmin?: any): { success: boolean; user?: any; error?: string } {
    const db = getCentralDb();
    const user = db.admin_users?.find(u => u.id === id);
    if (!user) {
      return { success: false, error: 'Administrator user not found.' };
    }

    if (updates.name) user.name = updates.name.trim();
    if (updates.role) user.role = updates.role;
    if (updates.email) user.email = updates.email.trim();
    if (updates.status) user.status = updates.status;
    if (updates.password_hash) user.password_hash = updates.password_hash;

    persistDbToDisk();

    auditLogRepository.record({
      actor_type: 'admin',
      actor_id: actorAdmin?.id || 'adm_001',
      actor_name: actorAdmin?.name || 'Administrator',
      action: 'UPDATE_ADMIN_USER',
      target_type: 'admin_user',
      target_id: user.id,
      metadata: { username: user.username, role: user.role, status: user.status }
    });

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        status: user.status,
        created_at: user.created_at,
        last_login: user.last_login
      }
    };
  },

  setStatus(id: string, status: 'active' | 'suspended', actorAdmin?: any): { success: boolean; user?: any; error?: string } {
    return this.update(id, { status }, actorAdmin);
  },

  delete(id: string, actorAdmin?: any): { success: boolean; error?: string } {
    const db = getCentralDb();
    if (id === 'adm_001') {
      return { success: false, error: 'Cannot delete the primary root system administrator.' };
    }

    const index = db.admin_users?.findIndex(u => u.id === id);
    if (index === undefined || index === -1) {
      return { success: false, error: 'Administrator user not found.' };
    }

    const deleted = db.admin_users.splice(index, 1)[0];
    persistDbToDisk();

    auditLogRepository.record({
      actor_type: 'admin',
      actor_id: actorAdmin?.id || 'adm_001',
      actor_name: actorAdmin?.name || 'Administrator',
      action: 'DELETE_ADMIN_USER',
      target_type: 'admin_user',
      target_id: deleted.id,
      metadata: { username: deleted.username, role: deleted.role }
    });

    return { success: true };
  }
};

// ==========================================
// TAXONOMY & HIERARCHY REPOSITORY
// ==========================================

export const taxonomyRepository = {
  getStats(): any {
    const db = getCentralDb();
    const guides = db.career_guides || [];
    const articles = db.articles || [];

    const totalIndustries = 35;
    const totalDepartments = 120;
    const totalJobRoles = 1050;

    const publishedGuides = guides.filter(g => g.content_status === 'published').length;
    const draftGuides = guides.filter(g => (g.content_status as string) === 'draft' || (g.content_status as string) === 'partial').length;
    const publishedArticles = articles.filter(a => a.status === 'published').length;

    const roleIdsWithGuides = new Set(guides.filter(g => g.content_status === 'published').map(g => g.job_role_id));
    const industriesWithGuides = new Set(guides.map(g => g.industry_id));
    const departmentsWithGuides = new Set(guides.map(g => g.department_id));

    return {
      total_industries: totalIndustries,
      total_departments: totalDepartments,
      total_job_roles: totalJobRoles,
      published_career_guides: publishedGuides,
      draft_career_guides: draftGuides,
      published_articles: publishedArticles,
      job_roles_with_guides: roleIdsWithGuides.size,
      job_roles_without_guides: Math.max(0, totalJobRoles - roleIdsWithGuides.size),
      industries_with_content: industriesWithGuides.size,
      departments_with_content: departmentsWithGuides.size,
      seo_coverage_percentage: Math.min(100, Math.round(((roleIdsWithGuides.size + publishedArticles) / (totalJobRoles + 50)) * 100))
    };
  },

  getTaxonomyTree(): any {
    return this.getStats();
  }
};

// ==========================================
// MASTER ADMIN STATISTICS REPOSITORY
// ==========================================

export const masterStatsRepository = {
  getMasterStats(): any {
    const db = getCentralDb();
    const candidates = db.candidates || [];
    const employers = db.employer_profiles || [];
    const subscriptions = db.employer_subscriptions || [];
    const payments = db.payments || [];
    const invoices = db.invoices || [];
    const articles = db.articles || [];
    const guides = db.career_guides || [];
    const audits = db.audit_logs || [];
    const resumeAccess = db.resume_access_history || [];
    const contactUnlocks = db.contact_unlock_history || [];

    const now = Date.now();
    const oneDayAgo = now - 86400000;
    const oneWeekAgo = now - 86400000 * 7;
    const oneMonthAgo = now - 86400000 * 30;

    // Candidates breakdown
    const activeCandidates = candidates.filter(c => c.is_active !== false && c.status !== 'suspended' && c.status !== 'soft_deleted');
    const suspendedCandidates = candidates.filter(c => c.status === 'suspended');
    const softDeletedCandidates = candidates.filter(c => c.status === 'soft_deleted');
    const hiddenCandidates = candidates.filter(c => c.privacy_settings?.profile_visibility === 'private' || c.status === 'hidden');

    const newCandidatesToday = candidates.filter(c => new Date(c.created_at).getTime() >= oneDayAgo).length;
    const newCandidatesWeek = candidates.filter(c => new Date(c.created_at).getTime() >= oneWeekAgo).length;
    const newCandidatesMonth = candidates.filter(c => new Date(c.created_at).getTime() >= oneMonthAgo).length;

    const completedCandidates = candidates.filter(c => (c.completion_score || calculateProfileCompleteness(c)) >= 80).length;
    const incompleteCandidates = candidates.length - completedCandidates;

    const withResume = candidates.filter(c => Boolean((c.resume && c.resume.status === 'active' && c.resume.storage_key) || c.has_resume)).length;
    const withoutResume = candidates.length - withResume;

    const publicProfiles = candidates.filter(c => c.privacy_settings?.profile_visibility !== 'private').length;
    const restrictedProfiles = candidates.length - publicProfiles;

    // Employers breakdown
    const activeEmployers = employers.filter(e => e.status !== 'suspended' && e.status !== 'soft_deleted');
    const suspendedEmployers = employers.filter(e => e.status === 'suspended');
    const newEmployersToday = employers.filter(e => new Date(e.created_at).getTime() >= oneDayAgo).length;
    const newEmployersMonth = employers.filter(e => new Date(e.created_at).getTime() >= oneMonthAgo).length;

    const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE' || s.status === 'active');
    const expiredSubs = subscriptions.filter(s => s.status === 'EXPIRED');
    const cancelledSubs = subscriptions.filter(s => s.status === 'CANCELLED');

    const employersWithActiveSub = new Set(activeSubs.map(s => s.employer_id)).size;
    const employersWithoutActiveSub = Math.max(0, employers.length - employersWithActiveSub);

    // Billing breakdown
    const succeededPayments = payments.filter(p => p.status === 'SUCCEEDED');
    const failedPayments = payments.filter(p => p.status === 'FAILED');
    const totalRevenue = succeededPayments.reduce((sum, p) => sum + (Number(p.total_amount) || 0), 0);

    const monthlySubscribers = activeSubs.filter(s => (s.plan?.billing_interval || 'monthly') === 'monthly').length;
    const yearlySubscribers = activeSubs.filter(s => (s.plan?.billing_interval || '') === 'yearly').length;

    const expiringSoon = activeSubs.filter(s => {
      if (!s.current_period_end) return false;
      const end = new Date(s.current_period_end).getTime();
      return end > now && end < (now + 86400000 * 7);
    }).length;

    const paidInvoices = invoices.filter(i => i.status === 'PAID').length;
    const pendingInvoices = invoices.filter(i => i.status === 'PENDING').length;

    // Content breakdown
    const publishedArticles = articles.filter(a => a.status === 'published').length;
    const draftArticles = articles.filter(a => a.status === 'draft').length;
    const inReviewArticles = articles.filter(a => a.status === 'in_review').length;

    const publishedGuides = guides.filter(g => g.content_status === 'published').length;
    const draftGuides = guides.filter(g => (g.content_status as string) === 'draft' || (g.content_status as string) === 'partial').length;

    // Security metrics
    const adminLogins = audits.filter(a => a.action === 'ADMIN_LOGIN' && new Date(a.timestamp).getTime() >= oneMonthAgo).length;
    const resumeUploads = audits.filter(a => a.action === 'UPLOAD_RESUME').length;
    const resumeDownloads = audits.filter(a => a.action === 'DOWNLOAD_CANDIDATE_RESUME').length;
    const suspensionsCount = audits.filter(a => a.action?.includes('SUSPEND')).length;

    return {
      candidates: {
        total: candidates.length,
        active: activeCandidates.length,
        suspended: suspendedCandidates.length,
        hidden: hiddenCandidates.length,
        soft_deleted: softDeletedCandidates.length,
        new_today: newCandidatesToday,
        new_week: newCandidatesWeek,
        new_month: newCandidatesMonth,
        completed_profiles: completedCandidates,
        incomplete_profiles: incompleteCandidates,
        with_resume: withResume,
        without_resume: withoutResume,
        public_profiles: publicProfiles,
        restricted_profiles: restrictedProfiles,
        recent_candidates: candidates.slice(0, 8).map(c => ({
          id: c.id,
          full_name: c.full_name,
          phone_number: c.phone_number,
          job_role_name: c.job_role_name || c.skill_category,
          country: c.country,
          has_resume: Boolean((c.resume && c.resume.status === 'active' && c.resume.storage_key) || c.has_resume),
          created_at: c.created_at,
          status: c.status || (c.is_active !== false ? 'active' : 'inactive')
        }))
      },
      employers: {
        total: employers.length,
        active: activeEmployers.length,
        suspended: suspendedEmployers.length,
        new_today: newEmployersToday,
        new_month: newEmployersMonth,
        with_active_sub: employersWithActiveSub,
        without_active_sub: employersWithoutActiveSub,
        trial_or_dev_mode: activeSubs.filter(s => s.is_trial || (s.plan && s.plan.price === 0)).length,
        expired_subs: expiredSubs.length,
        cancelled_subs: cancelledSubs.length,
        recent_employers: employers.slice(0, 8).map(e => ({
          id: e.id,
          company_name: e.company_name,
          contact_person: e.contact_person,
          phone_number: e.phone_number,
          country: e.country,
          created_at: e.created_at,
          status: e.status || 'active'
        }))
      },
      billing: {
        total_revenue: totalRevenue,
        total_payments_count: payments.length,
        succeeded_payments_count: succeededPayments.length,
        failed_payments_count: failedPayments.length,
        active_subscriptions_count: activeSubs.length,
        monthly_subscribers: monthlySubscribers,
        yearly_subscribers: yearlySubscribers,
        expiring_soon_count: expiringSoon,
        expired_subscriptions_count: expiredSubs.length,
        cancelled_subscriptions_count: cancelledSubs.length,
        total_invoices_count: invoices.length,
        paid_invoices_count: paidInvoices,
        pending_invoices_count: pendingInvoices,
        current_provider: process.env.PAYMENT_PROVIDER || 'development',
        is_simulated_mode: (process.env.PAYMENT_PROVIDER || 'development') === 'development'
      },
      content: {
        total_career_guides: guides.length,
        published_career_guides: publishedGuides,
        draft_career_guides: draftGuides,
        in_review_career_guides: guides.filter(g => (g.content_status as string) === 'partial').length,
        total_articles: articles.length,
        published_articles: publishedArticles,
        draft_articles: draftArticles,
        in_review_articles: inReviewArticles,
        recently_published_count: publishedArticles + publishedGuides,
        needing_review_count: inReviewArticles + draftGuides
      },
      hierarchy: {
        total_industries: 35,
        total_departments: 120,
        total_job_roles: 1050,
        industries_with_content: new Set(guides.map(g => g.industry_id)).size,
        departments_with_content: new Set(guides.map(g => g.department_id)).size,
        job_roles_with_guides: new Set(guides.filter(g => g.content_status === 'published').map(g => g.job_role_id)).size,
        job_roles_without_guides: Math.max(0, 1050 - new Set(guides.filter(g => g.content_status === 'published').map(g => g.job_role_id)).size)
      },
      security: {
        recent_audits: audits.slice(0, 10),
        recent_admin_logins: adminLogins,
        resume_uploads_count: resumeUploads,
        resume_downloads_count: resumeDownloads,
        resume_unlocks_count: resumeAccess.length,
        contact_unlocks_count: contactUnlocks.length,
        failed_authorizations_count: audits.filter(a => a.action?.includes('DENIED') || a.action?.includes('FAILED')).length,
        recent_suspensions_count: suspensionsCount
      }
    };
  }
};

