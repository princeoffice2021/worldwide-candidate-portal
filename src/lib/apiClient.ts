import { BlogArticle, BlogTopic } from '../types/blog';
import { CareerGuide } from '../types/career';

const ADMIN_TOKEN_KEY = 'candidate_portal_admin_token_v2';
const ADMIN_SESSION_KEY = 'candidate_portal_admin_session_v1';

export function getStoredAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setStoredAdminToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (!token) {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  } else {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  }
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredAdminToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['X-Admin-Token'] = token;
  }
  return headers;
}

export interface ApiArticleFilterParams {
  industry_id?: string;
  department_id?: string;
  job_role_id?: string;
  topic_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
  featured?: boolean;
}

export const api = {
  // Public Articles API (Published Only)
  async getArticles(params: ApiArticleFilterParams = {}): Promise<{ articles: BlogArticle[]; total: number }> {
    try {
      const searchParams = new URLSearchParams();
      if (params.industry_id) searchParams.set('industry_id', params.industry_id);
      if (params.department_id) searchParams.set('department_id', params.department_id);
      if (params.job_role_id) searchParams.set('job_role_id', params.job_role_id);
      if (params.topic_id) searchParams.set('topic_id', params.topic_id);
      if (params.search) searchParams.set('search', params.search);
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.offset) searchParams.set('offset', params.offset.toString());
      if (params.featured) searchParams.set('featured', 'true');

      const url = `/api/articles?${searchParams.toString()}`;
      const res = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch articles (status ${res.status})`);
      }

      const json = await res.json();
      return {
        articles: json.data || [],
        total: json.total || 0
      };
    } catch (err) {
      console.warn('API getArticles error, fallbacking to client store:', err);
      return { articles: [], total: 0 };
    }
  },

  async getArticleBySlug(slug: string): Promise<BlogArticle | null> {
    try {
      const res = await fetch(`/api/articles/${encodeURIComponent(slug)}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        return null;
      }
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.warn(`API getArticleBySlug (${slug}) error:`, err);
      return null;
    }
  },

  async getRelatedArticles(articleId: string, industryId?: string, departmentId?: string, jobRoleId?: string, limit = 3): Promise<BlogArticle[]> {
    try {
      const searchParams = new URLSearchParams();
      if (industryId) searchParams.set('industry_id', industryId);
      if (departmentId) searchParams.set('department_id', departmentId);
      if (jobRoleId) searchParams.set('job_role_id', jobRoleId);
      searchParams.set('limit', limit.toString());

      const res = await fetch(`/api/articles/${encodeURIComponent(articleId)}/related?${searchParams.toString()}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  // Public Topics API
  async getTopics(): Promise<BlogTopic[]> {
    try {
      const res = await fetch('/api/topics');
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('API getTopics error:', err);
      return [];
    }
  },

  // Public Career Guides API
  async getCareerGuides(): Promise<CareerGuide[]> {
    try {
      const res = await fetch('/api/career-guides');
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async getCareerGuideBySlug(slug: string): Promise<CareerGuide | null> {
    try {
      const res = await fetch(`/api/career-guides/${encodeURIComponent(slug)}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  // ==========================================
  // ADMIN PROTECTED APIS
  // ==========================================

  async adminLogin(username: string, password: string): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success && data.token) {
        setStoredAdminToken(data.token);
        if (typeof window !== 'undefined' && data.user) {
          localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(data.user));
        }
      }
      return data;
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed' };
    }
  },

  async getAdminArticles(statusFilter?: string): Promise<{ articles: BlogArticle[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (statusFilter && statusFilter !== 'all') searchParams.set('status', statusFilter);

    const res = await fetch(`/api/admin/articles?${searchParams.toString()}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    const json = await res.json();
    return { articles: json.data || [], total: json.total || 0 };
  },

  async createAdminArticle(articleData: Partial<BlogArticle>): Promise<{ success: boolean; article?: BlogArticle; error?: string }> {
    const res = await fetch('/api/admin/articles', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(articleData)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || `Failed to create article (status ${res.status})` };
    }
    return { success: true, article: json.data };
  },

  async updateAdminArticle(id: string, updates: Partial<BlogArticle>): Promise<{ success: boolean; article?: BlogArticle; error?: string }> {
    const res = await fetch(`/api/admin/articles/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || `Failed to update article (status ${res.status})` };
    }
    return { success: true, article: json.data };
  },

  async updateAdminArticleStatus(id: string, status: 'draft' | 'in_review' | 'published'): Promise<{ success: boolean; article?: BlogArticle; error?: string }> {
    const res = await fetch(`/api/admin/articles/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || `Failed to update status (status ${res.status})` };
    }
    return { success: true, article: json.data };
  },

  async deleteAdminArticle(id: string): Promise<{ success: boolean; error?: string }> {
    const res = await fetch(`/api/admin/articles/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || `Failed to delete article (status ${res.status})` };
    }
    return { success: true };
  },

  async saveAdminCareerGuide(guide: Partial<CareerGuide>): Promise<{ success: boolean; guide?: CareerGuide; error?: string }> {
    const res = await fetch('/api/admin/career-guides', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(guide)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || `Failed to save career guide (status ${res.status})` };
    }
    return { success: true, guide: json.data };
  },

  async getAdminStats(): Promise<any> {
    const res = await fetch('/api/admin/stats', {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  },

  // Candidates Client API (With Advanced Filtering & Employer Context)
  async getCandidates(params: {
    industry_id?: string;
    department_id?: string;
    job_role_id?: string;
    search?: string;
    location?: string;
    country?: string;
    is_available?: boolean;
    min_experience_years?: number;
    max_experience_years?: number;
    workplace_type?: string;
    willing_to_relocate?: boolean;
    skills?: string[];
    languages?: string[];
    min_completion_percentage?: number;
    sort_by?: string;
    limit?: number;
    offset?: number;
    employer_id?: string;
  } = {}): Promise<{ candidates: any[]; total: number }> {
    try {
      const searchParams = new URLSearchParams();
      if (params.industry_id) searchParams.set('industry_id', params.industry_id);
      if (params.department_id) searchParams.set('department_id', params.department_id);
      if (params.job_role_id) searchParams.set('job_role_id', params.job_role_id);
      if (params.search) searchParams.set('search', params.search);
      if (params.location) searchParams.set('location', params.location);
      if (params.country) searchParams.set('country', params.country);
      if (params.is_available) searchParams.set('is_available', 'true');
      if (params.min_experience_years !== undefined) searchParams.set('min_experience_years', params.min_experience_years.toString());
      if (params.max_experience_years !== undefined) searchParams.set('max_experience_years', params.max_experience_years.toString());
      if (params.workplace_type) searchParams.set('workplace_type', params.workplace_type);
      if (params.willing_to_relocate) searchParams.set('willing_to_relocate', 'true');
      if (params.skills && params.skills.length > 0) searchParams.set('skills', params.skills.join(','));
      if (params.languages && params.languages.length > 0) searchParams.set('languages', params.languages.join(','));
      if (params.min_completion_percentage) searchParams.set('min_completion_percentage', params.min_completion_percentage.toString());
      if (params.sort_by) searchParams.set('sort_by', params.sort_by);
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.offset) searchParams.set('offset', params.offset.toString());
      if (params.employer_id) searchParams.set('employer_id', params.employer_id);

      const res = await fetch(`/api/candidates?${searchParams.toString()}`);
      if (!res.ok) return { candidates: [], total: 0 };
      const json = await res.json();
      return {
        candidates: json.data || [],
        total: json.total || 0
      };
    } catch {
      return { candidates: [], total: 0 };
    }
  },

  async getCandidateBySlug(slug: string, employerId?: string): Promise<any | null> {
    try {
      const url = employerId 
        ? `/api/candidates/${encodeURIComponent(slug)}?employer_id=${encodeURIComponent(employerId)}`
        : `/api/candidates/${encodeURIComponent(slug)}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async saveCandidate(candidate: any): Promise<{ success: boolean; candidate?: any; error?: string }> {
    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidate)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Failed to save candidate' };
      }
      return { success: true, candidate: json.data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  // Subscription Plans
  async getPlans(): Promise<any[]> {
    try {
      const res = await fetch('/api/plans');
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  // Employer Profile & Auth API
  async employerLoginOrRegister(data: any): Promise<{ success: boolean; employer?: any; subscription?: any; error?: string }> {
    try {
      const res = await fetch('/api/employer/login-or-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Login failed' };
      }
      return { success: true, employer: json.data?.employer, subscription: json.data?.subscription };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  async getEmployerProfile(id: string): Promise<{ employer: any; subscription: any } | null> {
    try {
      const res = await fetch(`/api/employer/profile/${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async updateEmployerProfile(id: string, updates: any): Promise<{ success: boolean; employer?: any; error?: string }> {
    try {
      const res = await fetch(`/api/employer/profile/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Update failed' };
      }
      return { success: true, employer: json.data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Employer Dashboard Aggregates
  async getEmployerDashboard(id: string): Promise<any | null> {
    try {
      const res = await fetch(`/api/employer/dashboard/${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  // Saved Candidates & Notes
  async getSavedCandidates(employerId: string): Promise<any[]> {
    try {
      const res = await fetch(`/api/employer/saved-candidates/${encodeURIComponent(employerId)}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async saveCandidateForEmployer(employerId: string, candidateId: string, notes?: string): Promise<{ success: boolean; saved?: any; error?: string }> {
    try {
      const res = await fetch('/api/employer/saved-candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employer_id: employerId, candidate_id: candidateId, notes })
      });
      const json = await res.json();
      return { success: json.success || res.ok, saved: json.data, error: json.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateSavedCandidateNotes(employerId: string, candidateId: string, notes: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/employer/saved-candidates/${encodeURIComponent(employerId)}/${encodeURIComponent(candidateId)}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      const json = await res.json();
      return { success: json.success || res.ok, error: json.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async removeSavedCandidate(employerId: string, candidateId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/employer/saved-candidates/${encodeURIComponent(employerId)}/${encodeURIComponent(candidateId)}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      return { success: json.success || res.ok, error: json.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Recently Viewed Candidates
  async getRecentlyViewed(employerId: string, limit = 20): Promise<any[]> {
    try {
      const res = await fetch(`/api/employer/recently-viewed/${encodeURIComponent(employerId)}?limit=${limit}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async recordRecentlyViewed(employerId: string, candidateId: string): Promise<void> {
    try {
      await fetch('/api/employer/recently-viewed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employer_id: employerId, candidate_id: candidateId })
      });
    } catch {}
  },

  // Subscription & Contact Unlock
  async getEmployerSubscription(employerId: string): Promise<any | null> {
    try {
      const res = await fetch(`/api/employer/subscription/${encodeURIComponent(employerId)}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async subscribePlan(employerId: string, planId: string): Promise<{ success: boolean; message: string; subscription?: any }> {
    try {
      const res = await fetch('/api/employer/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employer_id: employerId, plan_id: planId })
      });
      const json = await res.json();
      return { success: json.success || res.ok, message: json.message || json.error, subscription: json.data };
    } catch (err: any) {
      return { success: false, message: err.message || 'Subscription failed' };
    }
  },

  async unlockCandidateContact(employerId: string, candidateId: string): Promise<{ success: boolean; message: string; candidate?: any; remainingAllowance?: number }> {
    try {
      const res = await fetch('/api/employer/unlock-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employer_id: employerId, candidate_id: candidateId })
      });
      const json = await res.json();
      return {
        success: json.success || res.ok,
        message: json.message || json.error || 'Unlock processed',
        candidate: json.candidate,
        remainingAllowance: json.remainingAllowance
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Contact unlock request failed' };
    }
  },

  async getUnlockedContacts(employerId: string): Promise<any[]> {
    try {
      const res = await fetch(`/api/employer/unlocked-contacts/${encodeURIComponent(employerId)}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async checkUnlockedStatus(employerId: string, candidateId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/employer/unlocked-status/${encodeURIComponent(employerId)}/${encodeURIComponent(candidateId)}`);
      if (!res.ok) return false;
      const json = await res.json();
      return !!json.is_unlocked;
    } catch {
      return false;
    }
  },

  // ==========================================
  // SECURE RESUME MANAGEMENT & ACCESS CLIENT
  // ==========================================

  async uploadResume(formData: FormData): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
    try {
      const res = await fetch('/api/candidates/resume', {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      return {
        success: json.success || res.ok,
        message: json.message || json.error || 'Upload processed',
        data: json.data,
        error: json.error
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Resume upload failed', error: err.message };
    }
  },

  async deleteResume(candidateId: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const res = await fetch(`/api/candidates/resume/${encodeURIComponent(candidateId)}`, {
        method: 'DELETE',
        headers: {
          'x-candidate-id': candidateId
        }
      });
      const json = await res.json();
      return {
        success: json.success || res.ok,
        message: json.message || json.error || 'Delete processed',
        data: json.data
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Resume delete failed' };
    }
  },

  async updateResumePrivacy(candidateId: string, access_visibility: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const res = await fetch('/api/candidates/resume/privacy', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-candidate-id': candidateId
        },
        body: JSON.stringify({ candidate_id: candidateId, access_visibility, caller_id: candidateId })
      });
      const json = await res.json();
      return {
        success: json.success || res.ok,
        message: json.message || json.error || 'Privacy updated',
        data: json.data
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Privacy update failed' };
    }
  },

  async unlockCandidateResume(employerId: string, candidateId: string, action: 'view' | 'download' = 'view'): Promise<{ success: boolean; message: string; candidate?: any; remainingAllowance?: number; alreadyUnlocked?: boolean; error?: string }> {
    try {
      const res = await fetch('/api/employer/unlock-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employer_id: employerId, candidate_id: candidateId, action })
      });
      const json = await res.json();
      return {
        success: json.success || res.ok,
        message: json.message || json.error || 'Resume access processed',
        candidate: json.candidate,
        remainingAllowance: json.remainingAllowance,
        alreadyUnlocked: json.alreadyUnlocked,
        error: json.error
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Resume unlock request failed', error: err.message };
    }
  },

  async getUnlockedResumes(employerId: string): Promise<any[]> {
    try {
      const res = await fetch(`/api/employer/unlocked-resumes/${encodeURIComponent(employerId)}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async checkResumeAccessStatus(employerId: string, candidateId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/employer/resume-status/${encodeURIComponent(employerId)}/${encodeURIComponent(candidateId)}`);
      if (!res.ok) return false;
      const json = await res.json();
      return !!json.has_access;
    } catch {
      return false;
    }
  },

  // Admin Audit Logs
  async createAuditLog(data: {
    actor_type: 'employer' | 'candidate' | 'admin' | 'system';
    actor_id: string;
    actor_name: string;
    action: string;
    target_type: string;
    target_id: string;
    metadata?: Record<string, any>;
  }): Promise<boolean> {
    try {
      const res = await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getAdminAudits(limit = 100): Promise<any[]> {
    try {
      const res = await fetch(`/api/admin/audits?limit=${limit}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  // ==========================================
  // BILLING, PAYMENTS & INVOICES API
  // ==========================================

  async getEmployerEntitlements(employerId: string): Promise<any | null> {
    try {
      const res = await fetch(`/api/billing/entitlements/${encodeURIComponent(employerId)}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.warn('API getEmployerEntitlements error:', err);
      return null;
    }
  },

  async createCheckoutSession(data: {
    employer_id: string;
    plan_id: string;
    billing_interval?: 'monthly' | 'yearly' | 'one_time';
    currency?: string;
    idempotency_key?: string;
    provider?: string;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch('/api/billing/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      return {
        success: json.success || res.ok,
        data: json.data,
        error: json.error
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Checkout initialization failed' };
    }
  },

  async finalizePayment(data: {
    payment_id: string;
    provider_order_id?: string;
    provider_payment_id?: string;
    provider_signature?: string;
    simulated_status?: 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
    failure_reason?: string;
  }): Promise<{ success: boolean; status?: string; message?: string; payment?: any; subscription?: any; invoice?: any; error?: string }> {
    try {
      const res = await fetch('/api/billing/finalize-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message || 'Payment finalization failed' };
    }
  },

  async getEmployerPayments(employerId: string): Promise<any[]> {
    try {
      const res = await fetch(`/api/billing/payments/${encodeURIComponent(employerId)}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async getEmployerInvoices(employerId: string): Promise<any[]> {
    try {
      const res = await fetch(`/api/billing/invoices/${encodeURIComponent(employerId)}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async getInvoice(invoiceId: string): Promise<{ invoice: any; payment: any } | null> {
    try {
      const res = await fetch(`/api/billing/invoice/${encodeURIComponent(invoiceId)}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async cancelEmployerSubscription(employerId: string): Promise<{ success: boolean; message?: string; subscription?: any; error?: string }> {
    try {
      const res = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employer_id: employerId })
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message || 'Cancellation request failed' };
    }
  },

  // Admin Billing APIs
  async getAdminBillingStats(): Promise<any | null> {
    try {
      const res = await fetch('/api/admin/billing/stats', {
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async getAdminPayments(limit = 100): Promise<any[]> {
    try {
      const res = await fetch(`/api/admin/billing/payments?limit=${limit}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async getAdminInvoices(limit = 100): Promise<any[]> {
    try {
      const res = await fetch(`/api/admin/billing/invoices?limit=${limit}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async adminSuspendSubscription(subscriptionId: string, suspend: boolean, reason?: string): Promise<{ success: boolean; message?: string; subscription?: any; error?: string }> {
    try {
      const res = await fetch(`/api/admin/billing/subscriptions/${encodeURIComponent(subscriptionId)}/suspend`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ suspend, reason })
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ==========================================
  // ADMIN MASTER CONTROL PANEL CLIENT APIS (PHASE 8)
  // ==========================================

  // Dashboard Stats
  async getAdminMasterDashboard(): Promise<any | null> {
    try {
      const res = await fetch('/api/admin/dashboard', { headers: getAuthHeaders() });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  // Candidates
  async getAdminCandidates(params: {
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
  } = {}): Promise<{ candidates: any[]; total: number; page: number; limit: number }> {
    try {
      const sp = new URLSearchParams();
      if (params.page) sp.set('page', params.page.toString());
      if (params.limit) sp.set('limit', params.limit.toString());
      if (params.search) sp.set('search', params.search);
      if (params.status) sp.set('status', params.status);
      if (params.industry_id) sp.set('industry_id', params.industry_id);
      if (params.department_id) sp.set('department_id', params.department_id);
      if (params.job_role_id) sp.set('job_role_id', params.job_role_id);
      if (params.has_resume) sp.set('has_resume', params.has_resume);
      if (params.country) sp.set('country', params.country);
      if (params.sort_by) sp.set('sort_by', params.sort_by);

      const res = await fetch(`/api/admin/candidates?${sp.toString()}`, { headers: getAuthHeaders() });
      if (!res.ok) return { candidates: [], total: 0, page: 1, limit: 20 };
      const json = await res.json();
      return {
        candidates: json.candidates || [],
        total: json.total || 0,
        page: json.page || 1,
        limit: json.limit || 20
      };
    } catch {
      return { candidates: [], total: 0, page: 1, limit: 20 };
    }
  },

  async getAdminCandidateDetail(id: string): Promise<any | null> {
    try {
      const res = await fetch(`/api/admin/candidates/${encodeURIComponent(id)}`, { headers: getAuthHeaders() });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async updateAdminCandidate(id: string, updates: any, reason?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`/api/admin/candidates/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ updates, reason })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async setAdminCandidateStatus(id: string, status: string, reason?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`/api/admin/candidates/${encodeURIComponent(id)}/status`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, reason })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Employers
  async getAdminEmployers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    plan_id?: string;
    sort_by?: string;
  } = {}): Promise<{ employers: any[]; total: number; page: number; limit: number }> {
    try {
      const sp = new URLSearchParams();
      if (params.page) sp.set('page', params.page.toString());
      if (params.limit) sp.set('limit', params.limit.toString());
      if (params.search) sp.set('search', params.search);
      if (params.status) sp.set('status', params.status);
      if (params.plan_id) sp.set('plan_id', params.plan_id);
      if (params.sort_by) sp.set('sort_by', params.sort_by);

      const res = await fetch(`/api/admin/employers?${sp.toString()}`, { headers: getAuthHeaders() });
      if (!res.ok) return { employers: [], total: 0, page: 1, limit: 20 };
      const json = await res.json();
      return {
        employers: json.employers || [],
        total: json.total || 0,
        page: json.page || 1,
        limit: json.limit || 20
      };
    } catch {
      return { employers: [], total: 0, page: 1, limit: 20 };
    }
  },

  async getAdminEmployerDetail(id: string): Promise<any | null> {
    try {
      const res = await fetch(`/api/admin/employers/${encodeURIComponent(id)}`, { headers: getAuthHeaders() });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async updateAdminEmployer(id: string, updates: any, reason?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`/api/admin/employers/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ updates, reason })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async setAdminEmployerStatus(id: string, status: string, reason?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`/api/admin/employers/${encodeURIComponent(id)}/status`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, reason })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateAdminEmployerSubscription(id: string, updates: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`/api/admin/employers/${encodeURIComponent(id)}/subscription`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async resetAdminEmployerQuotas(id: string): Promise<{ success: boolean; message?: string; data?: any; error?: string }> {
    try {
      const res = await fetch(`/api/admin/employers/${encodeURIComponent(id)}/reset-quotas`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Plans
  async getAdminPlans(): Promise<any[]> {
    try {
      const res = await fetch('/api/admin/plans', { headers: getAuthHeaders() });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async createAdminPlan(planData: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(planData)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateAdminPlan(id: string, updates: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`/api/admin/plans/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async toggleAdminPlanStatus(id: string, is_active: boolean): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`/api/admin/plans/${encodeURIComponent(id)}/toggle`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_active })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Billing & Transactions
  async getAdminTransactions(params: {
    page?: number;
    limit?: number;
    status?: string;
    employer_id?: string;
    search?: string;
  } = {}): Promise<{ transactions: any[]; total: number; page: number; limit: number }> {
    try {
      const sp = new URLSearchParams();
      if (params.page) sp.set('page', params.page.toString());
      if (params.limit) sp.set('limit', params.limit.toString());
      if (params.status) sp.set('status', params.status);
      if (params.employer_id) sp.set('employer_id', params.employer_id);
      if (params.search) sp.set('search', params.search);

      const res = await fetch(`/api/admin/billing/transactions?${sp.toString()}`, { headers: getAuthHeaders() });
      if (!res.ok) return { transactions: [], total: 0, page: 1, limit: 20 };
      const json = await res.json();
      return {
        transactions: json.transactions || [],
        total: json.total || 0,
        page: json.page || 1,
        limit: json.limit || 20
      };
    } catch {
      return { transactions: [], total: 0, page: 1, limit: 20 };
    }
  },

  async getAdminInvoicesList(params: {
    page?: number;
    limit?: number;
    status?: string;
    employer_id?: string;
  } = {}): Promise<{ invoices: any[]; total: number; page: number; limit: number }> {
    try {
      const sp = new URLSearchParams();
      if (params.page) sp.set('page', params.page.toString());
      if (params.limit) sp.set('limit', params.limit.toString());
      if (params.status) sp.set('status', params.status);
      if (params.employer_id) sp.set('employer_id', params.employer_id);

      const res = await fetch(`/api/admin/billing/invoices?${sp.toString()}`, { headers: getAuthHeaders() });
      if (!res.ok) return { invoices: [], total: 0, page: 1, limit: 20 };
      const json = await res.json();
      return {
        invoices: json.invoices || [],
        total: json.total || 0,
        page: json.page || 1,
        limit: json.limit || 20
      };
    } catch {
      return { invoices: [], total: 0, page: 1, limit: 20 };
    }
  },

  // Contact & Resume Unlocks
  async getAdminContactUnlocks(params: {
    page?: number;
    limit?: number;
    search?: string;
    employer_id?: string;
    candidate_id?: string;
  } = {}): Promise<{ unlocks: any[]; total: number; page: number; limit: number }> {
    try {
      const sp = new URLSearchParams();
      if (params.page) sp.set('page', params.page.toString());
      if (params.limit) sp.set('limit', params.limit.toString());
      if (params.search) sp.set('search', params.search);
      if (params.employer_id) sp.set('employer_id', params.employer_id);
      if (params.candidate_id) sp.set('candidate_id', params.candidate_id);

      const res = await fetch(`/api/admin/unlocks/contacts?${sp.toString()}`, { headers: getAuthHeaders() });
      if (!res.ok) return { unlocks: [], total: 0, page: 1, limit: 50 };
      const json = await res.json();
      return {
        unlocks: json.unlocks || [],
        total: json.total || 0,
        page: json.page || 1,
        limit: json.limit || 50
      };
    } catch {
      return { unlocks: [], total: 0, page: 1, limit: 50 };
    }
  },

  async getAdminResumeUnlocks(params: {
    page?: number;
    limit?: number;
    search?: string;
    employer_id?: string;
    candidate_id?: string;
    action?: string;
  } = {}): Promise<{ unlocks: any[]; total: number; page: number; limit: number }> {
    try {
      const sp = new URLSearchParams();
      if (params.page) sp.set('page', params.page.toString());
      if (params.limit) sp.set('limit', params.limit.toString());
      if (params.search) sp.set('search', params.search);
      if (params.employer_id) sp.set('employer_id', params.employer_id);
      if (params.candidate_id) sp.set('candidate_id', params.candidate_id);
      if (params.action) sp.set('action', params.action);

      const res = await fetch(`/api/admin/unlocks/resumes?${sp.toString()}`, { headers: getAuthHeaders() });
      if (!res.ok) return { unlocks: [], total: 0, page: 1, limit: 50 };
      const json = await res.json();
      return {
        unlocks: json.unlocks || [],
        total: json.total || 0,
        page: json.page || 1,
        limit: json.limit || 50
      };
    } catch {
      return { unlocks: [], total: 0, page: 1, limit: 50 };
    }
  },

  // Resumes list & moderation
  async getAdminResumes(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    visibility?: string;
  } = {}): Promise<{ resumes: any[]; total: number; page: number; limit: number }> {
    try {
      const sp = new URLSearchParams();
      if (params.page) sp.set('page', params.page.toString());
      if (params.limit) sp.set('limit', params.limit.toString());
      if (params.search) sp.set('search', params.search);
      if (params.status) sp.set('status', params.status);
      if (params.visibility) sp.set('visibility', params.visibility);

      const res = await fetch(`/api/admin/resumes?${sp.toString()}`, { headers: getAuthHeaders() });
      if (!res.ok) return { resumes: [], total: 0, page: 1, limit: 20 };
      const json = await res.json();
      return {
        resumes: json.resumes || [],
        total: json.total || 0,
        page: json.page || 1,
        limit: json.limit || 20
      };
    } catch {
      return { resumes: [], total: 0, page: 1, limit: 20 };
    }
  },

  async moderateAdminResume(candidateId: string, status: string, reason?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`/api/admin/resumes/${encodeURIComponent(candidateId)}/moderate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, reason })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Audit Logs
  async getAdminAuditLogs(params: {
    page?: number;
    limit?: number;
    actor_type?: string;
    actor_id?: string;
    action?: string;
    target_type?: string;
    target_id?: string;
    from_date?: string;
    to_date?: string;
    search?: string;
  } = {}): Promise<{ logs: any[]; total: number; page: number; limit: number }> {
    try {
      const sp = new URLSearchParams();
      if (params.page) sp.set('page', params.page.toString());
      if (params.limit) sp.set('limit', params.limit.toString());
      if (params.actor_type) sp.set('actor_type', params.actor_type);
      if (params.actor_id) sp.set('actor_id', params.actor_id);
      if (params.action) sp.set('action', params.action);
      if (params.target_type) sp.set('target_type', params.target_type);
      if (params.target_id) sp.set('target_id', params.target_id);
      if (params.from_date) sp.set('from_date', params.from_date);
      if (params.to_date) sp.set('to_date', params.to_date);
      if (params.search) sp.set('search', params.search);

      const res = await fetch(`/api/admin/audit-logs?${sp.toString()}`, { headers: getAuthHeaders() });
      if (!res.ok) return { logs: [], total: 0, page: 1, limit: 50 };
      const json = await res.json();
      return {
        logs: json.logs || [],
        total: json.total || 0,
        page: json.page || 1,
        limit: json.limit || 50
      };
    } catch {
      return { logs: [], total: 0, page: 1, limit: 50 };
    }
  },

  // Admin Users
  async getAdminUsers(): Promise<any[]> {
    try {
      const res = await fetch('/api/admin/users', { headers: getAuthHeaders() });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async createAdminUser(data: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateAdminUser(id: string, updates: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async setAdminUserStatus(id: string, status: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}/status`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteAdminUser(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Platform Settings
  async getAdminSettings(): Promise<any | null> {
    try {
      const res = await fetch('/api/admin/settings', { headers: getAuthHeaders() });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async updateAdminSettings(settings: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Taxonomy & Directory Stats
  async getAdminTaxonomies(): Promise<any[]> {
    try {
      const res = await fetch('/api/admin/taxonomies', { headers: getAuthHeaders() });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  // Subscriptions management
  async getAdminSubscriptions(params?: number | { page?: number; limit?: number; search?: string; status?: string; plan?: string }): Promise<{ subscriptions: any[]; invoices: any[]; total: number; page: number; limit: number } & any[]> {
    try {
      const isParamObj = typeof params === 'object' && params !== null;
      const limit = isParamObj ? (params.limit || 100) : (typeof params === 'number' ? params : 100);
      const page = isParamObj ? (params.page || 1) : 1;
      const search = isParamObj ? params.search : undefined;
      const status = isParamObj ? params.status : undefined;
      const plan = isParamObj ? params.plan : undefined;

      const sp = new URLSearchParams();
      sp.set('limit', limit.toString());
      if (page) sp.set('page', page.toString());
      if (search) sp.set('search', search);
      if (status && status !== 'all') sp.set('status', status);
      if (plan && plan !== 'all') sp.set('plan', plan);

      const [subRes, invRes] = await Promise.all([
        fetch(`/api/admin/billing/subscriptions?${sp.toString()}`, { headers: getAuthHeaders() }),
        fetch(`/api/admin/billing/invoices?limit=100`, { headers: getAuthHeaders() })
      ]);

      const subJson = subRes.ok ? await subRes.json() : { data: [] };
      const invJson = invRes.ok ? await invRes.json() : { invoices: [], data: [] };

      const subs = subJson.data || subJson.subscriptions || [];
      const invoices = invJson.invoices || invJson.data || [];

      const result: any = subs;
      result.subscriptions = subs;
      result.invoices = invoices;
      result.total = subJson.total || subs.length;
      result.page = page;
      result.limit = limit;

      return result;
    } catch {
      const result: any = [];
      result.subscriptions = [];
      result.invoices = [];
      result.total = 0;
      result.page = 1;
      result.limit = 20;
      return result;
    }
  },

  async updateAdminSubscription(id: string, updates: any): Promise<{ success: boolean; data?: any; error?: string }> {
    return api.updateAdminEmployerSubscription(id, updates);
  },

  async adminAdjustEmployerQuota(id: string, updates: any): Promise<{ success: boolean; data?: any; error?: string }> {
    return api.updateAdminEmployerSubscription(id, updates);
  },

  async deleteAdminResume(candidateId: string, reason?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return api.moderateAdminResume(candidateId, 'deleted', reason);
  },

  async getAdminJobRoleGuides(): Promise<any[]> {
    try {
      return await api.getCareerGuides();
    } catch {
      return [];
    }
  },

  async saveAdminJobRoleGuide(guide: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      return await api.saveAdminCareerGuide(guide);
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getAdminUnlocks(params: {
    page?: number;
    limit?: number;
    type?: 'all' | 'contact' | 'resume' | string;
    search?: string;
  } = {}): Promise<{ unlocks: any[]; total: number; page: number; limit: number }> {
    try {
      const type = params.type || 'all';
      let contactList: any[] = [];
      let resumeList: any[] = [];
      let total = 0;

      if (type === 'all' || type === 'contact') {
        const cRes = await api.getAdminContactUnlocks({
          page: params.page,
          limit: params.limit,
          search: params.search
        });
        contactList = (cRes.unlocks || []).map(u => ({ ...u, type: 'contact' }));
        total += cRes.total || contactList.length;
      }

      if (type === 'all' || type === 'resume') {
        const rRes = await api.getAdminResumeUnlocks({
          page: params.page,
          limit: params.limit,
          search: params.search
        });
        resumeList = (rRes.unlocks || []).map(u => ({ ...u, type: 'resume' }));
        total += rRes.total || resumeList.length;
      }

      const combined = [...contactList, ...resumeList];
      combined.sort((a, b) => new Date(b.created_at || b.unlocked_at || 0).getTime() - new Date(a.created_at || a.unlocked_at || 0).getTime());

      return {
        unlocks: combined,
        total,
        page: params.page || 1,
        limit: params.limit || 50
      };
    } catch {
      return { unlocks: [], total: 0, page: 1, limit: 50 };
    }
  },

  // Aliases for compatibility
  async getAdminPlatformSettings(): Promise<any | null> {
    return api.getAdminSettings();
  },

  async updateAdminPlatformSettings(settings: any): Promise<{ success: boolean; data?: any; error?: string }> {
    return api.updateAdminSettings(settings);
  }
};

export const apiClient = api;
export default api;
