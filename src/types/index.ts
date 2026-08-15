/**
 * Candidate Portal Types
 */

export interface SkillCategory {
  id: string | number;
  name_english: string;
  name_hindi?: string;
  slug: string;
  icon_name?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface Industry {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_name?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface Department {
  id: string;
  industry_id: string;
  name: string;
  slug: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface JobRole {
  id: string;
  department_id: string;
  industry_id: string;
  name: string;
  slug: string;
  is_active?: boolean;
  is_popular?: boolean;
  sort_order?: number;
}

export interface LocationHierarchy {
  country: string;
  country_code: string; // e.g. "IN", "US", "AE"
  admin_level_1?: string; // State / Province / Region
  admin_level_1_type?: string; // "State", "Province", "Region", "Governorate"
  admin_level_2?: string; // District / City / County
  admin_level_2_type?: string; // "District", "City", "County"
  admin_level_3?: string; // Tehsil / Taluka / Block / Sub-region
  admin_level_3_type?: string; // "Tehsil", "Taluka", "Block"
  village_or_town?: string; // Village / Town / Locality
  area_other?: string; // Mohalla / Ward / Landmark / Free-text
}

export interface WorkExperienceItem {
  id: string;
  job_title: string;
  company_name: string;
  city?: string;
  country?: string;
  start_date: string; // e.g. "2021-03" or "2021"
  end_date?: string; // e.g. "2024-01" or empty if current
  is_current: boolean;
  description?: string;
}

export interface EducationItem {
  id: string;
  degree_or_diploma: string;
  institution: string;
  field_of_study?: string;
  completion_year?: string;
}

export interface LanguageItem {
  language: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

export interface JobPreferences {
  employment_types?: ('Full-Time' | 'Part-Time' | 'Contract' | 'Freelance' | 'Shift-Based')[];
  workplace_type?: 'On-Site' | 'Remote' | 'Hybrid' | 'Any';
  willing_to_relocate?: boolean;
  preferred_cities_or_countries?: string[];
  notice_period_days?: number; // e.g. 0 (Immediate), 15, 30, 60
}

export type ResumePrivacySetting = 'PRIVATE' | 'ELIGIBLE_EMPLOYERS' | 'EMPLOYER_REQUEST_REQUIRED';

export interface PrivacySettings {
  profile_visibility: 'public' | 'searchable_only' | 'private'; // public (anyone), searchable_only (registered employers), private (only direct link)
  hide_phone_from_public: boolean; // phone always masked until unlocked
  allow_employer_messages: boolean;
  resume_visibility?: ResumePrivacySetting; // default: 'PRIVATE'
}

export interface ResumeMetadata {
  id: string;
  storage_key?: string; // Not exposed in public APIs
  original_filename: string;
  content_type: string;
  file_size: number;
  uploaded_at: string;
  updated_at?: string;
  access_visibility: ResumePrivacySetting;
  status: 'active' | 'archived' | 'deleted' | 'flagged';
  is_verified?: boolean;
}

export interface ResumeDocument {
  file_name: string;
  file_size_bytes?: number;
  uploaded_at: string;
  file_data_url?: string;
  mime_type?: string;
}

export interface Candidate {
  id: string;
  user_id: string;
  phone_number: string;
  full_name: string;
  photo_url?: string | null;
  skill_category_id?: string | number | null;
  skill_category: string;

  // Hierarchical Classification (Industry -> Department -> Job Role)
  industry_id?: string | null;
  industry_name?: string | null;
  department_id?: string | null;
  department_name?: string | null;
  job_role_id?: string | null;
  job_role_name?: string | null;
  custom_profession?: string | null;

  experience_years: number; // e.g. 0 for Fresher, 1, 2, 3, 5, 10
  experience_label: string; // e.g. "Fresher", "2 Years", "5+ Years"
  
  // Worldwide Location System
  country: string;
  country_code: string;
  admin_level_1?: string | null;
  admin_level_1_type?: string | null;
  admin_level_2?: string | null;
  admin_level_2_type?: string | null;
  admin_level_3?: string | null;
  admin_level_3_type?: string | null;
  village_or_town?: string | null;
  area_other?: string | null;
  
  is_available: boolean;
  expected_salary?: string | null;
  bio?: string | null;
  
  // Phase 4 & Phase 6 Worldwide Structured Profile & Resume Enhancements
  headline?: string | null;
  gender?: string | null;
  work_experiences?: WorkExperienceItem[];
  education?: EducationItem[];
  skills?: string[];
  certifications?: string[];
  languages?: LanguageItem[];
  job_preferences?: JobPreferences;
  privacy_settings?: PrivacySettings;
  resume?: ResumeMetadata | null;
  resume_document?: ResumeDocument | null;
  has_resume?: boolean;
  resume_visibility?: ResumePrivacySetting;
  portfolio_url?: string | null;
  linkedin_or_social?: string | null;

  profile_views: number;
  profile_completion_percentage?: number;
  is_verified?: boolean;
  is_active?: boolean;
  
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface CountryCode {
  code: string; // e.g., "IN"
  name: string; // e.g., "India"
  dial_code: string; // e.g., "+91"
  flag: string; // e.g., "🇮🇳"
  admin1_label?: string; // e.g. "State / UT"
  admin2_label?: string; // e.g. "District / City"
  admin3_label?: string; // e.g. "Tehsil / Block"
}

export interface ProfileViewRecord {
  id: string;
  candidate_id: string;
  viewer_hash?: string;
  created_at: string;
}

export type PaymentStatus = 
  | 'CREATED' 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'SUCCEEDED' 
  | 'FAILED' 
  | 'CANCELLED' 
  | 'EXPIRED' 
  | 'REFUNDED' 
  | 'PARTIALLY_REFUNDED';

export type SubscriptionStatus = 
  | 'PENDING_PAYMENT' 
  | 'ACTIVE' 
  | 'PAST_DUE' 
  | 'CANCELLED' 
  | 'EXPIRED' 
  | 'SUSPENDED';

export type PaymentProviderName = 'development' | 'razorpay' | 'stripe' | 'paypal' | 'payu';

export interface SubscriptionPlan {
  id: string;
  code?: string;
  name: string;
  slug: string;
  description: string;
  price: number; // e.g. 0, 29, 79, 199
  amount?: number;
  compare_at_amount?: number;
  currency: string; // "USD" or "INR"
  billing_interval: 'monthly' | 'yearly' | 'one_time';
  billing_interval_count?: number;
  contact_limit: number; // e.g., 0, 15, 50, 9999
  contact_access_limit?: number;
  resume_access_limit?: number; // e.g. 0, 15, 50, 9999
  resume_download_enabled?: boolean;
  candidate_search_limit?: number;
  saved_candidates_limit?: number;
  team_members_limit?: number;
  priority_support?: boolean;
  advanced_filters?: boolean;
  advanced_filters_enabled: boolean;
  analytics_access?: boolean;
  featured_employer_profile?: boolean;
  phone_access_enabled: boolean;
  is_active: boolean;
  is_public?: boolean;
  features?: string[];
  sort_order: number;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentRecord {
  id: string;
  payment_reference: string;
  idempotency_key: string;
  employer_id: string;
  subscription_id: string;
  plan_id: string;
  plan_code: string;
  provider: PaymentProviderName;
  provider_payment_id?: string;
  provider_order_id?: string;
  provider_customer_id?: string;
  currency: string;
  amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: PaymentStatus;
  failure_code?: string;
  failure_message?: string;
  provider_response_safe?: Record<string, any>;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  failed_at?: string;
  cancelled_at?: string;
  refunded_at?: string;
}

export interface InvoiceRecord {
  id: string;
  invoice_number: string;
  payment_id: string;
  employer_id: string;
  subscription_id: string;
  billing_name: string;
  company_name: string;
  billing_email?: string;
  billing_phone?: string;
  billing_address?: string;
  plan_name_snapshot: string;
  plan_code_snapshot: string;
  billing_interval: string;
  currency: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'PAID' | 'VOID' | 'REFUNDED';
  issued_at: string;
  paid_at?: string;
  created_at: string;
}

export interface EmployerEntitlements {
  is_active: boolean;
  plan_id: string;
  plan_name: string;
  plan_code: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  contacts_limit: number;
  contacts_used: number;
  contacts_remaining: number;
  resumes_limit: number;
  resumes_used: number;
  resumes_remaining: number;
  resume_download_enabled: boolean;
  advanced_filters_enabled: boolean;
  phone_access_enabled: boolean;
  is_expired: boolean;
  is_suspended: boolean;
  cancel_at_period_end: boolean;
  cancelled_at?: string;
}

export interface EmployerProfile {
  id: string;
  user_id: string;
  company_name: string;
  company_logo_url?: string;
  company_website?: string;
  industry?: string;
  company_description?: string;
  country?: string;
  country_code?: string;
  state_region?: string;
  city?: string;
  company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  contact_person_name: string;
  contact_person_title?: string;
  full_name?: string;
  phone_number: string;
  email?: string;
  business_email?: string;
  is_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployerSubscription {
  id: string;
  employer_id: string;
  plan_id: string;
  plan_code?: string;
  plan?: SubscriptionPlan;
  status: 'pending' | 'active' | 'expired' | 'cancelled' | 'failed' | SubscriptionStatus;
  started_at: string;
  expires_at: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  cancelled_at?: string;
  pending_plan_id?: string;
  payment_id?: string;
  contact_unlock_limit?: number;
  contact_access_limit?: number;
  contacts_used_this_period: number;
  resume_access_limit?: number;
  resumes_used_this_period?: number;
  payment_provider?: string;
  provider?: string;
  provider_subscription_id?: string;
  provider_payment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployerContactAccess {
  id: string;
  employer_id: string;
  candidate_id: string;
  subscription_id: string;
  accessed_at: string;
  contact_type_accessed?: string;
  candidate_name_snapshot?: string;
}

export interface EmployerResumeAccess {
  id: string;
  employer_id: string;
  candidate_id: string;
  resume_id: string;
  action: 'view' | 'download';
  subscription_id?: string;
  accessed_at: string;
  candidate_name_snapshot?: string;
}

export interface SavedCandidate {
  id: string;
  employer_id: string;
  candidate_id: string;
  candidate?: Candidate;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RecentlyViewedCandidate {
  id: string;
  employer_id: string;
  candidate_id: string;
  candidate?: Candidate;
  viewed_at: string;
}

export interface AuditLogEntry {
  id: string;
  actor_type: 'employer' | 'candidate' | 'admin' | 'system';
  actor_id: string;
  actor_name: string;
  action: string;
  target_type: string;
  target_id: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export type VoiceLanguage = 'auto' | 'en-US' | 'hi-IN' | 'pa-IN';

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export * from './career';
