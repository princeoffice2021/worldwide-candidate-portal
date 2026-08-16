import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Candidate, EmployerProfile, EmployerSubscription } from '../types';
import { isSupabaseConfigured, localDb, supabase, DEFAULT_SUBSCRIPTION_PLANS, CandidateAccount } from '../lib/supabase';
import { generateCandidateSlug } from '../lib/slug';
import { hashPassword, validatePasswordStrength, normalizePhoneNumber } from '../lib/authCrypto';
import { api } from '../lib/apiClient';

interface AuthUser {
  id: string;
  phone: string;
}

export interface RegisterResult {
  success: boolean;
  isNewUser?: boolean;
  alreadyExists?: boolean;
  message: string;
}

export interface LoginResult {
  success: boolean;
  isLocked?: boolean;
  remainingAttempts?: number;
  remainingSeconds?: number;
  message: string;
}

interface AuthContextType {
  user: AuthUser | null;
  candidate: Candidate | null;
  loading: boolean;
  
  // Phone + Password Authentication (NO OTP)
  registerWithPassword: (dialCode: string, localPhone: string, password: string) => Promise<RegisterResult>;
  loginWithPassword: (dialCode: string, localPhone: string, password: string) => Promise<LoginResult>;
  getLockoutStatus: (dialCode: string, localPhone: string) => { isLocked: boolean; remainingSeconds: number; remainingAttempts: number };
  
  saveProfile: (data: Partial<Candidate>) => Promise<{ success: boolean; candidate?: Candidate; message?: string }>;
  toggleAvailability: (isAvailable: boolean) => Promise<boolean>;
  logout: (onDone?: () => void) => Promise<void>;
  refreshProfile: () => void;

  // Employer & Subscription Auth
  employer: EmployerProfile | null;
  employerSubscription: EmployerSubscription | null;
  unlockedCandidateIds: Set<string>;
  unlockedResumeCandidateIds: Set<string>;
  savedCandidateIds: Set<string>;
  employerLogin: (contactPersonName: string, companyName: string, phoneOrEmail: string, extra?: Partial<EmployerProfile>) => Promise<boolean>;
  employerLogout: (onDone?: () => void) => void;
  subscribePlan: (planId: string) => Promise<{ success: boolean; message: string }>;
  unlockContact: (candidateId: string) => Promise<{ success: boolean; message: string; candidate?: any; remainingAllowance?: number }>;
  unlockResume: (candidateId: string, action?: 'view' | 'download') => Promise<{ success: boolean; message: string; candidate?: any; remainingAllowance?: number; alreadyUnlocked?: boolean; error?: string }>;
  isContactUnlocked: (candidateId: string) => boolean;
  isResumeUnlocked: (candidateId: string) => boolean;
  isCandidateSaved: (candidateId: string) => boolean;
  saveCandidate: (candidateId: string, notes?: string) => Promise<boolean>;
  removeSavedCandidate: (candidateId: string) => Promise<boolean>;
  recordRecentlyViewed: (candidateId: string) => void;
  refreshEmployerState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Employer state
  const [employer, setEmployer] = useState<EmployerProfile | null>(null);
  const [employerSubscription, setEmployerSubscription] = useState<EmployerSubscription | null>(null);
  const [unlockedCandidateIds, setUnlockedCandidateIds] = useState<Set<string>>(new Set());
  const [unlockedResumeCandidateIds, setUnlockedResumeCandidateIds] = useState<Set<string>>(new Set());
  const [savedCandidateIds, setSavedCandidateIds] = useState<Set<string>>(new Set());

  // Load persistent sessions on launch
  useEffect(() => {
    initAuthSession();
  }, []);

  const refreshEmployerState = useCallback(async () => {
    const currentEmp = employer || localDb.getEmployerSession();
    if (!currentEmp) return;

    try {
      // 1. Fetch live subscription & profile from server
      const profileRes = await api.getEmployerProfile(currentEmp.id);
      if (profileRes) {
        if (profileRes.employer) {
          setEmployer(profileRes.employer);
          localDb.setEmployerSession(profileRes.employer);
        }
        if (profileRes.subscription) {
          setEmployerSubscription(profileRes.subscription);
          localDb.setEmployerSubscription(profileRes.subscription);
        }
      }

      // 2. Fetch unlocked contacts list
      const unlocks = await api.getUnlockedContacts(currentEmp.id);
      if (unlocks && Array.isArray(unlocks)) {
        setUnlockedCandidateIds(new Set(unlocks.map((u: any) => u.candidate_id)));
      }

      // 2b. Fetch unlocked resumes list
      const resumeUnlocks = await api.getUnlockedResumes(currentEmp.id);
      if (resumeUnlocks && Array.isArray(resumeUnlocks)) {
        setUnlockedResumeCandidateIds(new Set(resumeUnlocks.map((u: any) => u.candidate_id)));
      }

      // 3. Fetch saved candidates list
      const saved = await api.getSavedCandidates(currentEmp.id);
      if (saved && Array.isArray(saved)) {
        setSavedCandidateIds(new Set(saved.map((s: any) => s.candidate_id)));
      }
    } catch (e) {
      console.warn('Failed to refresh employer remote state:', e);
    }
  }, [employer]);

  const initAuthSession = async () => {
    setLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const u = { id: data.session.user.id, phone: data.session.user.phone || '' };
          setUser(u);
          await loadCandidateProfile(u.id);
        }
      } catch (err) {
        console.warn('Supabase auth session check warning:', err);
      }
    }

    // Check local fallback session
    try {
      const localSession = localDb.getAuthSession();
      if (localSession && localSession.user_id) {
        setUser({ id: localSession.user_id, phone: localSession.phone_number || '' });
        let c = localDb.getCandidateByUserId(localSession.user_id);
        if (!c && localSession.phone_number) {
          const cleanPhone = localSession.phone_number.replace(/[^0-9]/g, '');
          const allCandidates = localDb.getCandidates();
          c = allCandidates.find(cand => (cand.phone_number || '').replace(/[^0-9]/g, '') === cleanPhone) || null;
          if (c) {
            c.user_id = localSession.user_id;
            localDb.saveCandidate(c);
          }
        }
        if (c) {
          setCandidate(c);
        }

        // Try syncing profile from centralized server
        try {
          const res = await fetch(`/api/candidates/user/${encodeURIComponent(localSession.user_id)}`);
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              setCandidate(json.data);
              localDb.saveCandidate(json.data);
            }
          }
        } catch {}
      }
    } catch (err) {
      console.warn('Corrupted local candidate session:', err);
    }

    // Check local employer session
    try {
      const localEmployer = localDb.getEmployerSession();
      if (localEmployer && localEmployer.id) {
        setEmployer(localEmployer);
        const sub = localDb.getEmployerSubscription(localEmployer.id);
        if (sub) {
          setEmployerSubscription(sub);
        }

        // Async sync with central database
        api.getEmployerDashboard(localEmployer.id).then((dash) => {
          if (dash) {
            if (dash.employer) {
              setEmployer(dash.employer);
              localDb.setEmployerSession(dash.employer);
            }
            if (dash.subscription) {
              setEmployerSubscription(dash.subscription);
              localDb.setEmployerSubscription(dash.subscription);
            }
            if (dash.unlocked_contacts) {
              setUnlockedCandidateIds(new Set(dash.unlocked_contacts.map((u: any) => u.candidate_id)));
            }
            if (dash.unlocked_resumes) {
              setUnlockedResumeCandidateIds(new Set(dash.unlocked_resumes.map((u: any) => u.candidate_id)));
            }
            if (dash.saved_candidates) {
              setSavedCandidateIds(new Set(dash.saved_candidates.map((s: any) => s.candidate_id)));
            }
          }
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('Corrupted local employer session:', err);
    }

    setLoading(false);
  };

  const loadCandidateProfile = async (userId: string) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!error && data) {
          setCandidate(data as Candidate);
          return;
        }
      } catch (e) {
        console.warn('Error fetching Supabase candidate:', e);
      }
    }

    // Try central backend API
    try {
      const res = await fetch(`/api/candidates/user/${encodeURIComponent(userId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setCandidate(json.data);
          localDb.saveCandidate(json.data);
          return;
        }
      }
    } catch {}

    // Fallback local check
    const c = localDb.getCandidateByUserId(userId);
    if (c) {
      setCandidate(c);
    }
  };

  // --- CANDIDATE PHONE + MANUAL PASSWORD REGISTRATION (NO OTP) ---

  const registerWithPassword = async (
    dialCode: string,
    localPhone: string,
    password: string
  ): Promise<RegisterResult> => {
    const cleanNum = localPhone.replace(/[^0-9]/g, '');
    if (!cleanNum || cleanNum.length < 6 || cleanNum.length > 15) {
      return { success: false, message: 'Please enter a valid phone number.' };
    }

    const normalizedPhone = normalizePhoneNumber(dialCode, localPhone);
    const displayPhone = `${dialCode.trim()} ${cleanNum}`;

    // Validate password requirements
    const strength = validatePasswordStrength(password);
    if (!strength.isValid) {
      return {
        success: false,
        message: 'Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, and 1 number.',
      };
    }

    // Check if account already exists with this phone number
    const existingAccount = localDb.getCandidateAccountByPhone(normalizedPhone);
    if (existingAccount) {
      return {
        success: false,
        alreadyExists: true,
        message: 'An account already exists with this phone number. Please log in.',
      };
    }

    // Check if any existing candidate profile in db matches this phone number
    const existingCandidate = localDb.getCandidates().find((c) => {
      const cNorm = (c.phone_number || '').replace(/[^0-9]/g, '');
      return cNorm === normalizedPhone.replace(/[^0-9]/g, '');
    });

    if (existingCandidate && existingCandidate.user_id) {
      const acc = localDb.getCandidateAccounts().find(a => a.user_id === existingCandidate.user_id);
      if (acc) {
        return {
          success: false,
          alreadyExists: true,
          message: 'An account already exists with this phone number. Please log in.',
        };
      }
    }

    // Generate secure hashed password
    const pwdHash = await hashPassword(password, normalizedPhone);
    const newUserId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);

    const newAccount: CandidateAccount = {
      user_id: newUserId,
      phone_number: displayPhone,
      normalized_phone: normalizedPhone,
      password_hash: pwdHash,
      created_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
    };

    localDb.saveCandidateAccount(newAccount);

    // Establish authenticated session immediately (NO OTP)
    const authUserObj: AuthUser = { id: newUserId, phone: displayPhone };
    setUser(authUserObj);
    localDb.setAuthSession({ user_id: newUserId, phone_number: displayPhone });

    // Link existing candidate profile if one was pre-created, else empty
    if (existingCandidate) {
      existingCandidate.user_id = newUserId;
      localDb.saveCandidate(existingCandidate);
      setCandidate(existingCandidate);
    } else {
      setCandidate(null);
    }

    return {
      success: true,
      isNewUser: !existingCandidate,
      message: 'Account created successfully! Welcome to Candidate Portal.',
    };
  };

  // --- CANDIDATE PHONE + MANUAL PASSWORD LOGIN (MAX 4 ATTEMPTS + COOLDOWN) ---

  const loginWithPassword = async (
    dialCode: string,
    localPhone: string,
    password: string
  ): Promise<LoginResult> => {
    const cleanNum = localPhone.replace(/[^0-9]/g, '');
    if (!cleanNum || cleanNum.length < 6) {
      return { success: false, message: 'Please enter a valid phone number.' };
    }

    const normalizedPhone = normalizePhoneNumber(dialCode, localPhone);
    const displayPhone = `${dialCode.trim()} ${cleanNum}`;

    // Step 1: Check if account is temporarily locked out
    const lockCheck = localDb.isAccountLocked(normalizedPhone);
    if (lockCheck.isLocked) {
      const mins = Math.ceil(lockCheck.remainingSeconds / 60);
      return {
        success: false,
        isLocked: true,
        remainingAttempts: 0,
        remainingSeconds: lockCheck.remainingSeconds,
        message: `Too many incorrect password attempts. Please try again later (cooldown: ${mins} min).`,
      };
    }

    if (!password) {
      return { success: false, message: 'Please enter your password.' };
    }

    // Step 2: Find candidate account
    let account = localDb.getCandidateAccountByPhone(normalizedPhone);

    // Fallback: If candidate exists from pre-existing demo profiles and hasn't registered account yet
    if (!account) {
      const cand = localDb.getCandidates().find((c) => {
        const cNorm = (c.phone_number || '').replace(/[^0-9]/g, '');
        return cNorm === normalizedPhone.replace(/[^0-9]/g, '');
      });

      if (!cand) {
        return {
          success: false,
          message: 'No account found with this phone number. Please create an account.',
        };
      }
    }

    // Step 3: Compute password hash and verify
    const enteredHash = await hashPassword(password, normalizedPhone);

    if (account && account.password_hash === enteredHash) {
      // SUCCESSFUL LOGIN: Reset failed attempt counter immediately
      localDb.resetAuthAttempts(normalizedPhone);

      account.last_login_at = new Date().toISOString();
      localDb.saveCandidateAccount(account);

      const authUserObj: AuthUser = { id: account.user_id, phone: account.phone_number || displayPhone };
      setUser(authUserObj);
      localDb.setAuthSession({ user_id: account.user_id, phone_number: account.phone_number || displayPhone });

      // Load profile
      const cand = localDb.getCandidateByUserId(account.user_id);
      setCandidate(cand);

      return {
        success: true,
        message: 'Welcome back! Login successful.',
      };
    }

    // Special backward compatibility for existing sample users who have not set a password yet
    if (!account) {
      // For legacy accounts without a password, prompt them to register/create account
      return {
        success: false,
        message: 'No password has been set for this phone number yet. Please click "Create Account" to create your password.',
      };
    }

    // Step 4: INCORRECT PASSWORD: Record failed attempt and compute remaining attempts
    const attemptResult = localDb.recordFailedAttempt(normalizedPhone);

    if (attemptResult.isLocked) {
      return {
        success: false,
        isLocked: true,
        remainingAttempts: 0,
        remainingSeconds: attemptResult.remainingSeconds,
        message: 'Maximum password attempts reached for now. Too many incorrect password attempts. Please try again later.',
      };
    }

    const remaining = attemptResult.remainingAttempts;
    const attemptWord = remaining === 1 ? 'attempt' : 'attempts';

    return {
      success: false,
      isLocked: false,
      remainingAttempts: remaining,
      message: `Incorrect password. ${remaining} ${attemptWord} remaining.`,
    };
  };

  const getLockoutStatus = (dialCode: string, localPhone: string) => {
    const normalizedPhone = normalizePhoneNumber(dialCode, localPhone);
    const lock = localDb.isAccountLocked(normalizedPhone);
    const attempts = localDb.getAuthAttempts(normalizedPhone);
    const MAX_ATTEMPTS = 4;
    const remainingAttempts = Math.max(0, MAX_ATTEMPTS - attempts.failed_attempts);

    return {
      isLocked: lock.isLocked,
      remainingSeconds: lock.remainingSeconds,
      remainingAttempts,
    };
  };

  const saveProfile = async (
    data: Partial<Candidate>
  ): Promise<{ success: boolean; candidate?: Candidate; message?: string }> => {
    if (!user) {
      return { success: false, message: 'Candidate user session not found. Please log in.' };
    }

    const now = new Date().toISOString();
    const slug = candidate?.slug || generateCandidateSlug(
      data.full_name || 'candidate',
      data.skill_category || 'skilled',
      data.admin_level_2 || data.admin_level_1 || data.country
    );

    const fullProfile: Candidate = {
      id: candidate?.id || 'cand_' + Math.random().toString(36).substring(2, 10),
      user_id: user.id,
      phone_number: user.phone,
      full_name: data.full_name || candidate?.full_name || 'Candidate',
      photo_url: data.photo_url !== undefined ? data.photo_url : candidate?.photo_url,
      skill_category_id: data.skill_category_id ?? candidate?.skill_category_id ?? '1',
      skill_category: data.skill_category || candidate?.skill_category || 'Skilled Worker',

      // Hierarchical Category Taxonomy
      industry_id: data.industry_id ?? candidate?.industry_id ?? null,
      industry_name: data.industry_name ?? candidate?.industry_name ?? null,
      department_id: data.department_id ?? candidate?.department_id ?? null,
      department_name: data.department_name ?? candidate?.department_name ?? null,
      job_role_id: data.job_role_id ?? candidate?.job_role_id ?? null,
      job_role_name: data.job_role_name ?? candidate?.job_role_name ?? null,
      custom_profession: data.custom_profession ?? candidate?.custom_profession ?? null,

      experience_years: data.experience_years ?? candidate?.experience_years ?? 0,
      experience_label: data.experience_label || candidate?.experience_label || 'Fresher',
      country: data.country || candidate?.country || 'India',
      country_code: data.country_code || candidate?.country_code || 'IN',
      admin_level_1: data.admin_level_1 ?? candidate?.admin_level_1 ?? null,
      admin_level_1_type: data.admin_level_1_type ?? candidate?.admin_level_1_type ?? null,
      admin_level_2: data.admin_level_2 ?? candidate?.admin_level_2 ?? null,
      admin_level_2_type: data.admin_level_2_type ?? candidate?.admin_level_2_type ?? null,
      admin_level_3: data.admin_level_3 ?? candidate?.admin_level_3 ?? null,
      admin_level_3_type: data.admin_level_3_type ?? candidate?.admin_level_3_type ?? null,
      village_or_town: data.village_or_town ?? candidate?.village_or_town ?? null,
      area_other: data.area_other ?? candidate?.area_other ?? null,
      is_available: data.is_available ?? candidate?.is_available ?? true,
      expected_salary: data.expected_salary ?? candidate?.expected_salary ?? 'Negotiable',
      bio: data.bio ?? candidate?.bio ?? null,

      // Phase 4 Worldwide Structured Profile Enhancements
      headline: data.headline ?? candidate?.headline ?? null,
      gender: data.gender ?? candidate?.gender ?? null,
      work_experiences: data.work_experiences ?? candidate?.work_experiences ?? [],
      education: data.education ?? candidate?.education ?? [],
      skills: data.skills ?? candidate?.skills ?? [],
      certifications: data.certifications ?? candidate?.certifications ?? [],
      languages: data.languages ?? candidate?.languages ?? [],
      job_preferences: data.job_preferences ?? candidate?.job_preferences ?? {
        employment_types: ['Full-Time'],
        workplace_type: 'Any',
        willing_to_relocate: true,
        notice_period_days: 0
      },
      privacy_settings: data.privacy_settings ?? candidate?.privacy_settings ?? {
        profile_visibility: 'public',
        hide_phone_from_public: true,
        allow_employer_messages: true
      },
      resume_document: data.resume_document !== undefined ? data.resume_document : candidate?.resume_document,
      portfolio_url: data.portfolio_url ?? candidate?.portfolio_url ?? null,
      linkedin_or_social: data.linkedin_or_social ?? candidate?.linkedin_or_social ?? null,

      profile_views: candidate?.profile_views || 0,
      is_verified: candidate?.is_verified ?? false,
      is_active: true,
      slug,
      created_at: candidate?.created_at || now,
      updated_at: now,
    };

    // Save to Centralized Backend API
    try {
      await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullProfile)
      });
    } catch (apiErr) {
      console.warn('Central API candidate sync warning:', apiErr);
    }

    // Save to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('candidates').upsert(fullProfile);
        if (error) console.warn('Supabase profile upsert warning:', error.message);
      } catch (err) {
        console.warn('Supabase upsert exception:', err);
      }
    }

    // Always sync with local database storage
    localDb.saveCandidate(fullProfile);
    setCandidate(fullProfile);

    return { success: true, candidate: fullProfile, message: 'Profile saved successfully!' };
  };

  const toggleAvailability = async (isAvailable: boolean): Promise<boolean> => {
    if (!candidate) return false;
    const updated = { ...candidate, is_available: isAvailable, updated_at: new Date().toISOString() };
    
    try {
      await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch {}

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('candidates').update({ is_available: isAvailable }).eq('id', candidate.id);
      } catch {}
    }

    localDb.saveCandidate(updated);
    setCandidate(updated);
    return true;
  };

  const logout = async (onDone?: () => void) => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }

    localDb.setAuthSession(null);
    setUser(null);
    setCandidate(null);
    if (onDone) {
      onDone();
    }
  };

  const refreshProfile = () => {
    if (user) {
      loadCandidateProfile(user.id);
    }
  };

  // --- EMPLOYER AUTH & SUBSCRIPTION METHODS ---

  const employerLogin = async (
    contactPersonName: string,
    companyName: string,
    phoneOrEmail: string,
    extra?: Partial<EmployerProfile>
  ): Promise<boolean> => {
    try {
      const isEmail = phoneOrEmail.includes('@');
      const payload = {
        contact_person_name: contactPersonName || 'Hiring Lead',
        company_name: companyName || 'Hiring Enterprise',
        phone_number: isEmail ? (extra?.phone_number || '') : phoneOrEmail,
        email: isEmail ? phoneOrEmail : (extra?.email || undefined),
        company_website: extra?.company_website,
        industry: extra?.industry,
        country: extra?.country,
        city: extra?.city
      };

      const result = await api.employerLoginOrRegister(payload);
      if (result.success && result.employer) {
        const emp = result.employer;
        localDb.setEmployerSession(emp);
        setEmployer(emp);

        if (result.subscription) {
          localDb.setEmployerSubscription(result.subscription);
          setEmployerSubscription(result.subscription);
        }

        // Refresh unlocks and saved lists
        refreshEmployerState();
        return true;
      }

      // Fallback local session if backend fails
      const fallbackEmp: EmployerProfile = {
        id: 'emp_' + Math.random().toString(36).substring(2, 10),
        user_id: 'emp_usr_' + Math.random().toString(36).substring(2, 10),
        full_name: contactPersonName || 'Employer User',
        contact_person_name: contactPersonName || 'Employer User',
        company_name: companyName || 'Hiring Enterprise',
        phone_number: isEmail ? '' : phoneOrEmail,
        email: isEmail ? phoneOrEmail : undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...extra
      };
      localDb.setEmployerSession(fallbackEmp);
      setEmployer(fallbackEmp);
      const sub = localDb.getEmployerSubscription(fallbackEmp.id);
      setEmployerSubscription(sub);
      return true;
    } catch {
      return false;
    }
  };

  const employerLogout = (onDone?: () => void) => {
    localDb.setEmployerSession(null);
    setEmployer(null);
    setEmployerSubscription(null);
    setUnlockedCandidateIds(new Set());
    setUnlockedResumeCandidateIds(new Set());
    setSavedCandidateIds(new Set());
    if (onDone) {
      onDone();
    }
  };

  const subscribePlan = async (
    planId: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!employer) {
      return { success: false, message: 'Please log in as an employer first.' };
    }

    try {
      const res = await api.subscribePlan(employer.id, planId);
      if (res.success && res.subscription) {
        setEmployerSubscription(res.subscription);
        localDb.setEmployerSubscription(res.subscription);
        return { success: true, message: res.message || 'Subscription successfully activated!' };
      }

      // Local fallback
      const selectedPlan = DEFAULT_SUBSCRIPTION_PLANS.find((p) => p.id === planId);
      if (!selectedPlan) {
        return { success: false, message: 'Selected subscription plan not found.' };
      }

      const newSub: EmployerSubscription = {
        id: `sub_${Date.now()}`,
        employer_id: employer.id,
        plan_id: selectedPlan.id,
        plan: selectedPlan,
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
        contacts_used_this_period: 0,
        payment_provider: 'stripe_or_razorpay',
        provider_subscription_id: `sub_ref_${Math.random().toString(36).substring(2, 8)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      localDb.setEmployerSubscription(newSub);
      setEmployerSubscription(newSub);

      return {
        success: true,
        message: `Successfully subscribed to ${selectedPlan.name}!`,
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Subscription failed' };
    }
  };

  const unlockContact = async (
    candidateId: string
  ): Promise<{ success: boolean; message: string; candidate?: any; remainingAllowance?: number }> => {
    if (!employer) {
      return { success: false, message: 'Employer account required to unlock contact details.' };
    }

    try {
      const res = await api.unlockCandidateContact(employer.id, candidateId);
      if (res.success) {
        // Add to unlocked state set immediately
        setUnlockedCandidateIds(prev => new Set([...prev, candidateId]));

        // Refresh live employer and subscription data
        refreshEmployerState();

        return {
          success: true,
          message: res.message,
          candidate: res.candidate,
          remainingAllowance: res.remainingAllowance
        };
      } else {
        return {
          success: false,
          message: res.message
        };
      }
    } catch (err: any) {
      // Local fallback
      const localRes = localDb.unlockCandidateContact(employer.id, candidateId);
      if (localRes.success) {
        setUnlockedCandidateIds(prev => new Set([...prev, candidateId]));
        const updatedSub = localDb.getEmployerSubscription(employer.id);
        setEmployerSubscription(updatedSub);
      }
      return {
        success: localRes.success,
        message: localRes.message,
        remainingAllowance: localRes.remainingLimit
      };
    }
  };

  const unlockResume = async (
    candidateId: string,
    action: 'view' | 'download' = 'view'
  ): Promise<{ success: boolean; message: string; candidate?: any; remainingAllowance?: number; alreadyUnlocked?: boolean; error?: string }> => {
    if (!employer) {
      return { success: false, message: 'Please log in as an employer first.' };
    }

    try {
      const res = await api.unlockCandidateResume(employer.id, candidateId, action);
      if (res.success) {
        setUnlockedResumeCandidateIds(prev => new Set([...prev, candidateId]));
        await refreshEmployerState();
        return {
          success: true,
          message: res.message || 'Resume access granted.',
          candidate: res.candidate,
          remainingAllowance: res.remainingAllowance,
          alreadyUnlocked: res.alreadyUnlocked
        };
      } else {
        return {
          success: false,
          message: res.message || res.error || 'Failed to unlock resume',
          error: res.error
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Resume unlock network request failed'
      };
    }
  };

  const isContactUnlocked = (candidateId: string): boolean => {
    if (!employer) return false;
    if (unlockedCandidateIds.has(candidateId)) return true;
    return localDb.isContactUnlocked(employer.id, candidateId);
  };

  const isResumeUnlocked = (candidateId: string): boolean => {
    if (!employer) return false;
    return unlockedResumeCandidateIds.has(candidateId);
  };

  const isCandidateSaved = (candidateId: string): boolean => {
    if (!employer) return false;
    return savedCandidateIds.has(candidateId);
  };

  const saveCandidate = async (candidateId: string, notes?: string): Promise<boolean> => {
    if (!employer) return false;
    try {
      const res = await api.saveCandidateForEmployer(employer.id, candidateId, notes);
      if (res.success) {
        setSavedCandidateIds(prev => new Set([...prev, candidateId]));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const removeSavedCandidate = async (candidateId: string): Promise<boolean> => {
    if (!employer) return false;
    try {
      const res = await api.removeSavedCandidate(employer.id, candidateId);
      if (res.success) {
        setSavedCandidateIds(prev => {
          const next = new Set(prev);
          next.delete(candidateId);
          return next;
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const recordRecentlyViewed = (candidateId: string) => {
    if (!employer) return;
    api.recordRecentlyViewed(employer.id, candidateId).catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        candidate,
        loading,
        registerWithPassword,
        loginWithPassword,
        getLockoutStatus,
        saveProfile,
        toggleAvailability,
        logout,
        refreshProfile,
        employer,
        employerSubscription,
        unlockedCandidateIds,
        unlockedResumeCandidateIds,
        savedCandidateIds,
        employerLogin,
        employerLogout,
        subscribePlan,
        unlockContact,
        unlockResume,
        isContactUnlocked,
        isResumeUnlocked,
        isCandidateSaved,
        saveCandidate,
        removeSavedCandidate,
        recordRecentlyViewed,
        refreshEmployerState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};


