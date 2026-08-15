/**
 * Secure Client & Storage Password Hashing Utility
 * Uses standard Web Crypto API (SHA-256 with static + dynamic salt)
 * Ensures passwords are never stored or compared in plain text.
 */

const AUTH_SALT = 'candidate_portal_secure_auth_salt_v1';

export async function hashPassword(password: string, phoneKey: string): Promise<string> {
  const normalizedPhone = phoneKey.replace(/[^0-9]/g, '');
  const dataToHash = `${AUTH_SALT}:${normalizedPhone}:${password}`;
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(dataToHash);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback deterministic hash if crypto.subtle is unavailable
  let hash = 0;
  for (let i = 0; i < dataToHash.length; i++) {
    const char = dataToHash.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return 'h_' + Math.abs(hash).toString(16) + '_' + dataToHash.length;
}

export function validatePasswordStrength(password: string): {
  isValid: boolean;
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
} {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return {
    isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumber,
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
  };
}

export function normalizePhoneNumber(dialCode: string, rawNumber: string): string {
  const cleanDial = dialCode.replace(/[^0-9+]/g, '');
  const cleanNum = rawNumber.replace(/[^0-9]/g, '');
  return `${cleanDial}${cleanNum}`;
}
