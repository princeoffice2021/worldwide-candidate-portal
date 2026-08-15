import React, { useState } from 'react';
import { Briefcase, Building2, LogOut, User, UserCheck, BookOpen, Compass, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EmployerAuthModal } from './EmployerAuthModal';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, slug?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { user, candidate, logout, employer, employerSubscription, employerLogout } = useAuth();
  const [showEmployerAuthModal, setShowEmployerAuthModal] = useState<boolean>(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Tagline */}
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => onNavigate('landing')}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white border border-blue-500/30 group-hover:bg-blue-500 transition shadow-xs">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-extrabold tracking-tight leading-none text-white flex items-center space-x-1.5">
                  <span>Candidate Portal</span>
                  <span className="text-[10px] uppercase tracking-wider bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-300 font-semibold border border-blue-400/20">
                    Global
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Find Skilled People. Anywhere.</p>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* Search Candidates CTA */}
              <button
                onClick={() => onNavigate('find-candidates')}
                className={`hidden sm:inline-flex items-center space-x-1 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer ${
                  currentView === 'find-candidates'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <span>Find Candidates</span>
              </button>

              {/* Industries Directory Nav Link */}
              <button
                onClick={() => onNavigate('industries')}
                className={`hidden md:inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer ${
                  currentView === 'industries' || currentView === 'industry-detail' || currentView === 'department-detail' || currentView === 'career-detail'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Industries</span>
              </button>

              {/* Career Resources Nav Link */}
              <button
                onClick={() => onNavigate('career-resources')}
                className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer ${
                  currentView === 'career-resources' || currentView === 'resources' || currentView === 'blog' || currentView === 'article-detail'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Career Resources</span>
              </button>

              {/* Employer Portal Access / Dashboard */}
              {employer ? (
                <div className="flex items-center space-x-1.5 bg-slate-800/90 border border-blue-500/40 px-2.5 py-1.5 rounded-xl">
                  <button
                    onClick={() => onNavigate('employer-dashboard')}
                    className="flex items-center space-x-1.5 text-xs font-bold text-blue-300 hover:text-white transition cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <span className="max-w-[110px] truncate">{employer.company_name}</span>
                    <span className="bg-blue-600/60 text-white text-[10px] px-1.5 py-0.5 rounded-md font-mono">
                      {Math.max(0, (employerSubscription?.plan?.contact_limit || 0) - (employerSubscription?.contacts_used_this_period || 0))}
                    </span>
                  </button>
                  <button
                    onClick={employerLogout}
                    className="text-slate-400 hover:text-red-400 p-1 rounded transition cursor-pointer"
                    title="Employer Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowEmployerAuthModal(true)}
                  className={`hidden sm:inline-flex items-center space-x-1 text-xs font-bold px-3 py-2 rounded-xl border transition cursor-pointer ${
                    currentView === 'subscription-plans'
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/30'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Employer Access</span>
                </button>
              )}

              {/* Candidate Auth Session */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onNavigate(candidate ? 'dashboard' : 'profile-setup')}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      currentView === 'dashboard' || currentView === 'profile-setup'
                        ? 'bg-white text-slate-900'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span className="hidden xs:inline">
                      {candidate ? candidate.full_name.split(' ')[0] : 'My Profile'}
                    </span>
                  </button>

                  <button
                    onClick={logout}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-red-600/90 text-slate-300 hover:text-white transition border border-slate-700 cursor-pointer"
                    title="Candidate Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onNavigate('login')}
                  className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition shadow-xs cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Candidate Login</span>
                </button>
              )}

            </div>
          </div>

          {/* Mobile Nav Sub-bar */}
          <div className="sm:hidden pb-2.5 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <button
              onClick={() => onNavigate('find-candidates')}
              className="hover:underline text-blue-400"
            >
              🔍 Search
            </button>
            <button
              onClick={() => onNavigate('career-resources')}
              className="hover:underline text-slate-200"
            >
              📚 Guides
            </button>
            {employer ? (
              <button
                onClick={() => onNavigate('employer-dashboard')}
                className="hover:underline text-blue-300 font-bold"
              >
                🏢 Employer Desk
              </button>
            ) : (
              <button
                onClick={() => setShowEmployerAuthModal(true)}
                className="hover:underline text-amber-300"
              >
                🏢 Employer
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Employer Modal */}
      <EmployerAuthModal
        isOpen={showEmployerAuthModal}
        onClose={() => setShowEmployerAuthModal(false)}
        onSuccess={() => onNavigate('employer-dashboard')}
      />
    </>
  );
};
