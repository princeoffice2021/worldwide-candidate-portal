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

  async saveAdminPlan(plan: any): Promise<{ success: boolean; plan?: any; error?: string }> {
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(plan)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Failed to save plan' };
      }
      return { success: true, plan: json.data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  async deleteAdminPlan(planId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/admin/plans/${encodeURIComponent(planId)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const json = await res.json();
      return { success: json.success || res.ok, error: json.error };
    } catch (err: any) {
      return { success: false, error: err.message };
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

  async getAdminSubscriptions(limit = 100): Promise<any[]> {
    try {
      const res = await fetch(`/api/admin/billing/subscriptions?limit=${limit}`, {
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
  }
};
