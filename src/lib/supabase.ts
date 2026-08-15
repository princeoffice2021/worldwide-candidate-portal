import { createClient } from '@supabase/supabase-js';
import { Candidate, EmployerProfile, EmployerSubscription, SubscriptionPlan, EmployerContactAccess } from '../types';

// Read env variables safely
const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || metaEnv.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || metaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

/**
 * Default Subscription Plans Config
 * Can be stored & modified dynamically in database/admin panel
 */
export const DEFAULT_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-free',
    name: 'Free Employer',
    slug: 'free',
    description: 'Browse candidate profiles and test search capabilities.',
    price: 0,
    currency: 'USD',
    billing_interval: 'monthly',
    contact_limit: 0,
    advanced_filters_enabled: false,
    phone_access_enabled: false,
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'plan-basic',
    name: 'Basic Employer',
    slug: 'basic',
    description: 'Ideal for small businesses hiring occasionally.',
    price: 29,
    currency: 'USD',
    billing_interval: 'monthly',
    contact_limit: 15,
    advanced_filters_enabled: true,
    phone_access_enabled: true,
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'plan-pro',
    name: 'Pro Employer',
    slug: 'pro',
    description: 'Perfect for growing companies & frequent hiring needs.',
    price: 79,
    currency: 'USD',
    billing_interval: 'monthly',
    contact_limit: 50,
    advanced_filters_enabled: true,
    phone_access_enabled: true,
    is_active: true,
    sort_order: 3,
  },
  {
    id: 'plan-unlimited',
    name: 'Business / Unlimited',
    slug: 'unlimited',
    description: 'For recruitment agencies & large enterprises with high-volume hiring.',
    price: 199,
    currency: 'USD',
    billing_interval: 'monthly',
    contact_limit: 9999,
    advanced_filters_enabled: true,
    phone_access_enabled: true,
    is_active: true,
    sort_order: 4,
  },
];

/**
 * Local Fallback Database Engine
 * Keeps the application 100% testable in preview mode even before Supabase keys are defined!
 */
const STORAGE_KEY_CANDIDATES = 'candidate_portal_db_candidates';
const STORAGE_KEY_AUTH_SESSION = 'candidate_portal_auth_session';
const STORAGE_KEY_CANDIDATE_ACCOUNTS = 'candidate_portal_candidate_accounts';
const STORAGE_KEY_AUTH_ATTEMPTS = 'candidate_portal_auth_attempts';
const STORAGE_KEY_EMPLOYER_SESSION = 'candidate_portal_employer_session';
const STORAGE_KEY_EMPLOYER_SUBSCRIPTIONS = 'candidate_portal_employer_subs';
const STORAGE_KEY_CONTACT_ACCESS = 'candidate_portal_contact_access';

export interface CandidateAccount {
  user_id: string;
  phone_number: string;
  normalized_phone: string;
  password_hash: string;
  created_at: string;
  last_login_at?: string;
}

export interface AuthAttemptState {
  failed_attempts: number;
  lockout_until: number | null;
  last_attempt_at: string;
}

export const localDb = {
  getCandidates(): Candidate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CANDIDATES);
      if (!data) {
        // Return initial sample candidates if empty (Neutral Global Samples)
        const initialSamples: Candidate[] = [
          {
            id: 'cand-001',
            user_id: 'user-001',
            phone_number: '+91 98765 43210',
            full_name: 'Rajesh Kumar Verma',
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
            expected_salary: '₹22,000/month',
            bio: 'Experienced commercial and personal driver. Clean driving record and valid heavy vehicle license.',
            profile_views: 42,
            is_verified: true,
            is_active: true,
            slug: 'driver-rajesh-kumar-verma-delhi-a1b2',
            created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'cand-002',
            user_id: 'user-002',
            phone_number: '+91 91234 56789',
            full_name: 'Pooja Sharma',
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
            area_other: 'Main Market',
            is_available: true,
            expected_salary: '₹18,000/month',
            bio: 'Expert in MS Office, Tally Prime, English/Hindi typing, and data management software.',
            profile_views: 28,
            is_verified: true,
            is_active: true,
            slug: 'computer-operator-pooja-sharma-mohali-c3d4',
            created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'cand-003',
            user_id: 'user-003',
            phone_number: '+971 50 123 4567',
            full_name: 'Mohammed Al-Mansoori',
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
            area_other: 'Near Metro Station',
            is_available: true,
            expected_salary: '4,500 AED/month',
            bio: 'Certified electrical maintenance technician. Commercial wiring, panels, and HVAC control repairs.',
            profile_views: 65,
            is_verified: true,
            is_active: true,
            slug: 'electrician-mohammed-al-mansoori-dubai-e5f6',
            created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
            updated_at: new Date().toISOString(),
          }
        ];
        localStorage.setItem(STORAGE_KEY_CANDIDATES, JSON.stringify(initialSamples));
        return initialSamples;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  getCandidateByUserId(userId: string): Candidate | null {
    const candidates = this.getCandidates();
    return candidates.find((c) => c.user_id === userId) || null;
  },

  getCandidateBySlug(slug: string): Candidate | null {
    const candidates = this.getCandidates();
    return candidates.find((c) => c.slug === slug || c.id === slug) || null;
  },

  saveCandidate(candidate: Candidate): Candidate {
    const candidates = this.getCandidates();
    const index = candidates.findIndex((c) => c.id === candidate.id || c.user_id === candidate.user_id);
    
    if (index >= 0) {
      candidates[index] = { ...candidate, updated_at: new Date().toISOString() };
    } else {
      candidates.unshift(candidate);
    }

    try {
      localStorage.setItem(STORAGE_KEY_CANDIDATES, JSON.stringify(candidates));
    } catch (e) {
      console.warn('Could not save candidate to localStorage', e);
    }
    return candidate;
  },

  incrementView(candidateId: string): number {
    const candidates = this.getCandidates();
    const cand = candidates.find((c) => c.id === candidateId);
    if (cand) {
      cand.profile_views = (cand.profile_views || 0) + 1;
      this.saveCandidate(cand);
      return cand.profile_views;
    }
    return 0;
  },

  getAuthSession() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_AUTH_SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setAuthSession(session: { user_id: string; phone_number: string } | null) {
    if (!session) {
      localStorage.removeItem(STORAGE_KEY_AUTH_SESSION);
    } else {
      localStorage.setItem(STORAGE_KEY_AUTH_SESSION, JSON.stringify(session));
    }
  },

  // --- CANDIDATE CREDENTIALS & ATTEMPT SECURITY ---

  getCandidateAccounts(): CandidateAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CANDIDATE_ACCOUNTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getCandidateAccountByPhone(normalizedPhone: string): CandidateAccount | null {
    const clean = normalizedPhone.replace(/[^0-9]/g, '');
    const accounts = this.getCandidateAccounts();
    return accounts.find((a) => a.normalized_phone.replace(/[^0-9]/g, '') === clean) || null;
  },

  saveCandidateAccount(account: CandidateAccount): CandidateAccount {
    const accounts = this.getCandidateAccounts();
    const clean = account.normalized_phone.replace(/[^0-9]/g, '');
    const index = accounts.findIndex((a) => a.normalized_phone.replace(/[^0-9]/g, '') === clean);
    if (index >= 0) {
      accounts[index] = { ...accounts[index], ...account };
    } else {
      accounts.push(account);
    }
    try {
      localStorage.setItem(STORAGE_KEY_CANDIDATE_ACCOUNTS, JSON.stringify(accounts));
    } catch (e) {
      console.warn('Could not save candidate account', e);
    }
    return account;
  },

  getAuthAttempts(normalizedPhone: string): AuthAttemptState {
    const clean = normalizedPhone.replace(/[^0-9]/g, '');
    try {
      const all = localStorage.getItem(STORAGE_KEY_AUTH_ATTEMPTS);
      const map: Record<string, AuthAttemptState> = all ? JSON.parse(all) : {};
      const state = map[clean];
      if (!state) {
        return { failed_attempts: 0, lockout_until: null, last_attempt_at: new Date().toISOString() };
      }
      return state;
    } catch {
      return { failed_attempts: 0, lockout_until: null, last_attempt_at: new Date().toISOString() };
    }
  },

  isAccountLocked(normalizedPhone: string): { isLocked: boolean; remainingSeconds: number } {
    const state = this.getAuthAttempts(normalizedPhone);
    if (state.lockout_until && Date.now() < state.lockout_until) {
      const remainingSeconds = Math.ceil((state.lockout_until - Date.now()) / 1000);
      return { isLocked: true, remainingSeconds };
    }
    return { isLocked: false, remainingSeconds: 0 };
  },

  recordFailedAttempt(normalizedPhone: string): {
    failedAttempts: number;
    remainingAttempts: number;
    isLocked: boolean;
    remainingSeconds: number;
  } {
    const clean = normalizedPhone.replace(/[^0-9]/g, '');
    const state = this.getAuthAttempts(clean);
    
    // If previous lockout expired, reset attempts
    if (state.lockout_until && Date.now() >= state.lockout_until) {
      state.failed_attempts = 0;
      state.lockout_until = null;
    }

    state.failed_attempts += 1;
    state.last_attempt_at = new Date().toISOString();

    const MAX_ATTEMPTS = 4;
    const remainingAttempts = Math.max(0, MAX_ATTEMPTS - state.failed_attempts);

    let isLocked = false;
    let remainingSeconds = 0;

    if (state.failed_attempts >= MAX_ATTEMPTS) {
      // 5-minute cooldown protection after 4 consecutive failed attempts
      const COOLDOWN_MS = 5 * 60 * 1000;
      state.lockout_until = Date.now() + COOLDOWN_MS;
      isLocked = true;
      remainingSeconds = 300;
    }

    try {
      const all = localStorage.getItem(STORAGE_KEY_AUTH_ATTEMPTS);
      const map: Record<string, AuthAttemptState> = all ? JSON.parse(all) : {};
      map[clean] = state;
      localStorage.setItem(STORAGE_KEY_AUTH_ATTEMPTS, JSON.stringify(map));
    } catch {}

    return {
      failedAttempts: state.failed_attempts,
      remainingAttempts,
      isLocked,
      remainingSeconds,
    };
  },

  resetAuthAttempts(normalizedPhone: string) {
    const clean = normalizedPhone.replace(/[^0-9]/g, '');
    try {
      const all = localStorage.getItem(STORAGE_KEY_AUTH_ATTEMPTS);
      const map: Record<string, AuthAttemptState> = all ? JSON.parse(all) : {};
      delete map[clean];
      localStorage.setItem(STORAGE_KEY_AUTH_ATTEMPTS, JSON.stringify(map));
    } catch {}
  },

  // --- EMPLOYER & SUBSCRIPTION SYSTEM ---

  getSubscriptionPlans(): SubscriptionPlan[] {
    return DEFAULT_SUBSCRIPTION_PLANS;
  },

  getEmployerSession(): EmployerProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY_EMPLOYER_SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setEmployerSession(employer: EmployerProfile | null) {
    if (!employer) {
      localStorage.removeItem(STORAGE_KEY_EMPLOYER_SESSION);
    } else {
      localStorage.setItem(STORAGE_KEY_EMPLOYER_SESSION, JSON.stringify(employer));
    }
  },

  getEmployerSubscription(employerId: string): EmployerSubscription {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY_EMPLOYER_SUBSCRIPTIONS}_${employerId}`);
      if (data) {
        return JSON.parse(data);
      }
    } catch {}

    // Default Free subscription
    const freePlan = DEFAULT_SUBSCRIPTION_PLANS.find((p) => p.slug === 'free')!;
    return {
      id: `sub-free-${employerId}`,
      employer_id: employerId,
      plan_id: freePlan.id,
      plan: freePlan,
      status: 'active',
      started_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000 * 365).toISOString(),
      contacts_used_this_period: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  setEmployerSubscription(subscription: EmployerSubscription) {
    try {
      localStorage.setItem(
        `${STORAGE_KEY_EMPLOYER_SUBSCRIPTIONS}_${subscription.employer_id}`,
        JSON.stringify(subscription)
      );
    } catch (e) {
      console.warn('Could not save employer subscription', e);
    }
  },

  getContactAccesses(employerId: string): EmployerContactAccess[] {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY_CONTACT_ACCESS}_${employerId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  isContactUnlocked(employerId: string, candidateId: string): boolean {
    const accesses = this.getContactAccesses(employerId);
    return accesses.some((a) => a.candidate_id === candidateId);
  },

  unlockCandidateContact(
    employerId: string,
    candidateId: string
  ): { success: boolean; message: string; remainingLimit?: number } {
    const sub = this.getEmployerSubscription(employerId);
    const plan = sub.plan || DEFAULT_SUBSCRIPTION_PLANS.find((p) => p.id === sub.plan_id);

    if (!plan || sub.status !== 'active') {
      return { success: false, message: 'You need an active subscription to unlock contacts.' };
    }

    if (!plan.phone_access_enabled || plan.contact_limit <= 0) {
      return {
        success: false,
        message: 'Your current plan does not include candidate phone contact access. Please upgrade your subscription.',
      };
    }

    const accesses = this.getContactAccesses(employerId);
    const alreadyUnlocked = accesses.some((a) => a.candidate_id === candidateId);

    if (alreadyUnlocked) {
      return {
        success: true,
        message: 'Contact details are already unlocked!',
        remainingLimit: Math.max(0, plan.contact_limit - accesses.length),
      };
    }

    if (plan.contact_limit !== 9999 && accesses.length >= plan.contact_limit) {
      return {
        success: false,
        message: `You have reached your limit of ${plan.contact_limit} unlocked contacts for this period. Upgrade to Pro or Unlimited to unlock more candidates.`,
      };
    }

    // Record new contact access
    const newAccess: EmployerContactAccess = {
      id: `access-${Date.now()}`,
      employer_id: employerId,
      candidate_id: candidateId,
      subscription_id: sub.id,
      accessed_at: new Date().toISOString(),
    };

    accesses.push(newAccess);
    try {
      localStorage.setItem(`${STORAGE_KEY_CONTACT_ACCESS}_${employerId}`, JSON.stringify(accesses));
    } catch {}

    // Update contacts used in subscription
    sub.contacts_used_this_period = accesses.length;
    this.setEmployerSubscription(sub);

    const remaining = plan.contact_limit === 9999 ? 9999 : Math.max(0, plan.contact_limit - accesses.length);

    return {
      success: true,
      message: 'Candidate contact unlocked successfully!',
      remainingLimit: remaining,
    };
  },
};

/**
 * Helper to mask phone numbers safely
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return 'Protected Number';
  const clean = phone.trim();
  if (clean.length <= 6) return 'XXXXXX';
  
  // Example: +91 98765 43210 -> +91 98*** **210
  const prefix = clean.slice(0, 6);
  const suffix = clean.slice(-3);
  return `${prefix}*****${suffix}`;
}

