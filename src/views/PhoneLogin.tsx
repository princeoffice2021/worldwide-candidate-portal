import React, { useState, useEffect } from 'react';
import { COUNTRY_CODES } from '../data/countries';
import { useAuth } from '../context/AuthContext';
import { validatePasswordStrength } from '../lib/authCrypto';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Phone,
  ShieldCheck,
  ShieldAlert,
  LogIn,
  UserPlus,
  HelpCircle,
  X,
  Clock,
  Info,
} from 'lucide-react';

interface PhoneLoginProps {
  onNavigate: (view: string) => void;
  initialMode?: 'login' | 'register';
}

export const PhoneLogin: React.FC<PhoneLoginProps> = ({ onNavigate, initialMode = 'login' }) => {
  const { registerWithPassword, loginWithPassword, getLockoutStatus, user, candidate } = useAuth();

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  
  // Country & Phone
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('IN');
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  // Password fields
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  // Show / Hide password toggles
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Informational "Forgot Password" Modal / Sheet
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState<boolean>(false);

  // Status & Feedback
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [alreadyExistsError, setAlreadyExistsError] = useState<boolean>(false);
  
  // Failed attempts tracking
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [isLockedOut, setIsLockedOut] = useState<boolean>(false);
  const [lockoutSecondsRemaining, setLockoutSecondsRemaining] = useState<number>(0);

  const activeCountry = COUNTRY_CODES.find((c) => c.code === selectedCountryCode) || COUNTRY_CODES[0];

  // Auto redirect if candidate session is active
  useEffect(() => {
    if (user) {
      if (candidate) {
        onNavigate('dashboard');
      } else {
        onNavigate('profile-setup');
      }
    }
  }, [user, candidate, onNavigate]);

  // Live Password Strength for Registration
  const passwordStrength = validatePasswordStrength(password);

  // Check lockout status on country/phone change
  useEffect(() => {
    if (phoneNumber.trim().length >= 6) {
      const status = getLockoutStatus(activeCountry.dial_code, phoneNumber);
      setIsLockedOut(status.isLocked);
      setLockoutSecondsRemaining(status.remainingSeconds);
      if (status.isLocked) {
        setRemainingAttempts(0);
      }
    }
  }, [phoneNumber, activeCountry.dial_code, getLockoutStatus]);

  // Lockout countdown timer
  useEffect(() => {
    let interval: any = null;
    if (isLockedOut && lockoutSecondsRemaining > 0) {
      interval = setInterval(() => {
        setLockoutSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsLockedOut(false);
            setRemainingAttempts(4);
            setErrorMessage(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLockedOut, lockoutSecondsRemaining]);

  const switchMode = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setErrorMessage(null);
    setSuccessMessage(null);
    setAlreadyExistsError(false);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // --- SUBMIT REGISTRATION ---
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setAlreadyExistsError(false);

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 6 || cleanPhone.length > 15) {
      setErrorMessage('Please enter a valid phone number (6-15 digits).');
      return;
    }

    if (!passwordStrength.isValid) {
      setErrorMessage('Please meet all password security requirements before proceeding.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await registerWithPassword(activeCountry.dial_code, cleanPhone, password);
    setLoading(false);

    if (res.success) {
      setSuccessMessage(res.message);
      // Navigation is triggered by auth session effect (profile-setup)
      setTimeout(() => {
        onNavigate('profile-setup');
      }, 300);
    } else {
      if (res.alreadyExists) {
        setAlreadyExistsError(true);
      }
      setErrorMessage(res.message);
    }
  };

  // --- SUBMIT LOGIN ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setAlreadyExistsError(false);

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 6) {
      setErrorMessage('Please enter your registered phone number.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    const res = await loginWithPassword(activeCountry.dial_code, cleanPhone, password);
    setLoading(false);

    if (res.success) {
      setSuccessMessage(res.message);
      setRemainingAttempts(null);
      setIsLockedOut(false);
      // Navigation is handled by user/candidate state or direct call
      setTimeout(() => {
        onNavigate('dashboard');
      }, 300);
    } else {
      if (res.isLocked) {
        setIsLockedOut(true);
        setLockoutSecondsRemaining(res.remainingSeconds || 300);
        setRemainingAttempts(0);
      } else if (res.remainingAttempts !== undefined) {
        setRemainingAttempts(res.remainingAttempts);
      }
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Back Navigation */}
        <button
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline mb-4 cursor-pointer transition"
          id="btn-back-home"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        {/* Portal Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-sm mb-3 border border-slate-800">
            {authMode === 'register' ? (
              <UserPlus className="w-6 h-6 text-blue-400" />
            ) : (
              <LogIn className="w-6 h-6 text-blue-400" />
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {authMode === 'register' ? 'Create Candidate Account' : 'Candidate Login'}
          </h1>
          <p className="mt-1.5 text-xs text-slate-600 max-w-sm mx-auto">
            {authMode === 'register'
              ? 'Join Candidate Portal with your phone number and secure personal password.'
              : 'Log in with your country calling code, phone number, and password.'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mt-6 flex bg-slate-200/80 p-1 rounded-2xl">
          <button
            type="button"
            id="tab-login"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
              authMode === 'login'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login</span>
          </button>
          <button
            type="button"
            id="tab-register"
            onClick={() => switchMode('register')}
            className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
              authMode === 'register'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Main Auth Card */}
        <div className="mt-4 bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200">
          
          {/* Lockout Alert Banner */}
          {isLockedOut && (
            <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start space-x-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-amber-950">
                  Temporary Access Protection Activated
                </p>
                <p className="mt-0.5 text-amber-800">
                  Maximum failed password attempts reached (4/4). Please wait{' '}
                  <span className="font-bold font-mono">
                    {Math.floor(lockoutSecondsRemaining / 60)}:
                    {(lockoutSecondsRemaining % 60).toString().padStart(2, '0')}
                  </span>{' '}
                  before attempting to log in again.
                </p>
              </div>
            </div>
          )}

          {/* General Error Banner */}
          {errorMessage && !isLockedOut && (
            <div
              className="mb-4 p-3.5 rounded-2xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200 flex items-start space-x-2"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMessage}</span>
                {alreadyExistsError && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-lg shadow-xs transition cursor-pointer"
                    >
                      <LogIn className="w-3 h-3" />
                      <span>Go to Login</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-4 p-3.5 rounded-2xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* FLOW A: CREATE CANDIDATE ACCOUNT (REGISTRATION)              */}
          {/* ============================================================ */}
          {authMode === 'register' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4" id="form-register">
              
              {/* 1. Country Selection */}
              <div>
                <label htmlFor="reg-country" className="block text-xs font-bold text-slate-700 mb-1">
                  Country *
                </label>
                <select
                  id="reg-country"
                  value={selectedCountryCode}
                  onChange={(e) => setSelectedCountryCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.dial_code})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Phone Number Entry */}
              <div>
                <label htmlFor="reg-phone" className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-extrabold text-blue-700 select-none">
                    {activeCountry.dial_code}
                  </span>
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-16 pr-3 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Stored safely in international format ({activeCountry.dial_code} {phoneNumber || '...'}), no OTP required.
                </p>
              </div>

              {/* 3. Create Password */}
              <div>
                <label htmlFor="reg-password" className="block text-xs font-bold text-slate-700 mb-1">
                  Create Password *
                </label>
                <div className="relative flex items-center">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3 pr-10 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Real-time Password Requirements Checklist */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] space-y-1">
                <div className="font-bold text-slate-700 mb-1">Password requirements:</div>
                
                <div className="flex items-center space-x-1.5">
                  {passwordStrength.hasMinLength ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shrink-0" />
                  )}
                  <span className={passwordStrength.hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                    Minimum 8 characters
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {passwordStrength.hasUpperCase ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shrink-0" />
                  )}
                  <span className={passwordStrength.hasUpperCase ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                    At least 1 uppercase letter (A-Z)
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {passwordStrength.hasLowerCase ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shrink-0" />
                  )}
                  <span className={passwordStrength.hasLowerCase ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                    At least 1 lowercase letter (a-z)
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {passwordStrength.hasNumber ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shrink-0" />
                  )}
                  <span className={passwordStrength.hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                    At least 1 number (0-9)
                  </span>
                </div>
              </div>

              {/* 4. Confirm Password */}
              <div>
                <label htmlFor="reg-confirm-password" className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative flex items-center">
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3 pr-10 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[11px] font-bold text-red-600 mt-1">
                    Passwords do not match.
                  </p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Passwords match perfectly.</span>
                  </p>
                )}
              </div>

              {/* 5. Submit Create Account */}
              <button
                type="submit"
                id="btn-create-account"
                disabled={loading || !passwordStrength.isValid || password !== confirmPassword}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3.5 px-4 rounded-xl shadow-xs transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? (
                  <span>Creating Candidate Account...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-extrabold text-blue-600 hover:underline cursor-pointer"
                >
                  Login
                </button>
              </div>

            </form>
          ) : (
            /* ============================================================ */
            /* FLOW B: CANDIDATE LOGIN                                      */
            /* ============================================================ */
            <form onSubmit={handleLoginSubmit} className="space-y-4" id="form-login">
              
              {/* 1. Country Selection */}
              <div>
                <label htmlFor="login-country" className="block text-xs font-bold text-slate-700 mb-1">
                  Country *
                </label>
                <select
                  id="login-country"
                  value={selectedCountryCode}
                  onChange={(e) => setSelectedCountryCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.dial_code})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Phone Number Entry */}
              <div>
                <label htmlFor="login-phone" className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-extrabold text-blue-700 select-none">
                    {activeCountry.dial_code}
                  </span>
                  <input
                    id="login-phone"
                    type="tel"
                    required
                    placeholder="Enter registered phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-16 pr-3 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* 3. Password Entry */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="login-password" className="block text-xs font-bold text-slate-700">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    id="btn-forgot-password"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLockedOut}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3 pr-10 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition disabled:bg-slate-100 disabled:opacity-75"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Remaining Attempts Warning Indicator */}
                {remainingAttempts !== null && remainingAttempts > 0 && remainingAttempts < 4 && !isLockedOut && (
                  <div className="mt-1.5 flex items-center space-x-1 text-[11px] font-bold text-amber-700">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      {remainingAttempts} login {remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining before temporary protection.
                    </span>
                  </div>
                )}
              </div>

              {/* 4. Submit Login Button */}
              <button
                type="submit"
                id="btn-login-submit"
                disabled={loading || isLockedOut}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3.5 px-4 rounded-xl shadow-xs transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="font-extrabold text-blue-600 hover:underline cursor-pointer"
                >
                  Create Account
                </button>
              </div>

            </form>
          )}

          {/* Privacy and Protection Notice */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-[11px] text-slate-500">
            <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Passwords are securely hashed. Phone numbers are protected.</span>
          </div>

        </div>

        {/* Global Security Information Pill */}
        <div className="mt-4 text-center text-[11px] text-slate-500 bg-slate-100/80 p-3 rounded-2xl border border-slate-200 flex items-center justify-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Worldwide candidate access across 190+ countries with custom secure passwords.</span>
        </div>

      </div>

      {/* ============================================================ */}
      {/* FORGOT PASSWORD INFORMATIONAL MODAL                          */}
      {/* (NO OTP, NO SMS, NO EMAIL RESET, NO INSECURE LEAKS)          */}
      {/* ============================================================ */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative">
            
            {/* Close Button */}
            <button
              onClick={() => setShowForgotPasswordModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Forgot your password?
                </h3>
                <p className="text-xs text-slate-500">Account Access Guidance</p>
              </div>
            </div>

            {/* Explanatory Body */}
            <div className="space-y-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed">
              <p>
                Please try entering the personal password you chose when creating your candidate account.
              </p>
              <p>
                You have <strong>up to 4 login attempts</strong> before temporary access protection is activated.
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] font-semibold flex items-start space-x-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Password recovery by email or SMS is not currently available. If you cannot remember your password, please contact candidate support.
                </span>
              </div>
            </div>

            {/* Action */}
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-xs transition cursor-pointer"
              >
                Back to Login
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
