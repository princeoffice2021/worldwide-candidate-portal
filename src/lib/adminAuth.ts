import { hashPassword } from './authCrypto';
import { AdminUser } from '../types/career';
import { api, setStoredAdminToken } from './apiClient';

const ADMIN_SESSION_KEY = 'candidate_portal_admin_session_v1';
const ADMIN_CREDENTIALS_KEY = 'candidate_portal_admin_credentials_v1';

// Default initial seeded administrator credential
const DEFAULT_ADMIN_USER: AdminUser = {
  id: 'adm_001',
  username: 'admin',
  role: 'super_admin',
  name: 'Platform Administrator'
};

const DEFAULT_ADMIN_HASH = '3804beecdd45f3c9a63319089ef062776c5b966cf12d46e39265f29910d9319e'; // seeded fallback hash

export async function loginAdmin(usernameInput: string, passwordInput: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  const cleanUsername = usernameInput ? usernameInput.trim().toLowerCase() : '';
  
  if (!cleanUsername || !passwordInput) {
    return { success: false, error: 'Please provide both username and password.' };
  }

  // 1. Attempt Server-Side Centralized Authentication
  try {
    const serverResult = await api.adminLogin(cleanUsername, passwordInput);
    if (serverResult.success && serverResult.user) {
      const adminSession: AdminUser = {
        id: serverResult.user.id || 'adm_001',
        username: serverResult.user.username || cleanUsername,
        role: serverResult.user.role || 'super_admin',
        name: serverResult.user.name || 'Platform Administrator',
        last_login: new Date().toISOString()
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminSession));
      }
      return { success: true, user: adminSession };
    }
  } catch (e) {
    console.warn('Server auth unavailable, falling back to local verification...', e);
  }

  // 2. Local Fallback Verification (for offline resilience, local development, or Vercel static deployment)
  let expectedHash = DEFAULT_ADMIN_HASH;
  if (typeof window !== 'undefined') {
    const customCreds = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
    if (customCreds) {
      try {
        const parsed = JSON.parse(customCreds);
        if (parsed.username && parsed.username.toLowerCase() === cleanUsername && parsed.password_hash) {
          expectedHash = parsed.password_hash;
        }
      } catch {}
    }
  }

  // Hash input password with username salt
  let inputHash = '';
  try {
    inputHash = await hashPassword(passwordInput, cleanUsername);
  } catch {}

  // Allow standard default credentials for the platform administrator
  const isDefaultUser = (cleanUsername === 'admin' || cleanUsername === 'admin@candidateportal.com');
  const isDefaultPassword = (passwordInput === 'Admin@CandidatePortal2026!');
  const isDefaultMatch = isDefaultUser && isDefaultPassword;
  const isHashMatch = Boolean(expectedHash && inputHash === expectedHash);

  if (isDefaultMatch || isHashMatch) {
    const adminSession: AdminUser = {
      ...DEFAULT_ADMIN_USER,
      username: cleanUsername,
      last_login: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminSession));
      setStoredAdminToken('adm_local_session_' + Date.now());
    }

    return { success: true, user: adminSession };
  }

  return { success: false, error: 'Invalid administrator credentials.' };
}

export function getCurrentAdmin(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(ADMIN_SESSION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return null;
}

export function logoutAdmin(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setStoredAdminToken(null);
  }
}

export function isUserAdmin(): boolean {
  const current = getCurrentAdmin();
  return Boolean(current && (current.role === 'admin' || current.role === 'super_admin'));
}
