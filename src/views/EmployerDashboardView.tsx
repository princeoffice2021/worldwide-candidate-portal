import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/apiClient';
import { Candidate, EmployerSubscription, SavedCandidate, RecentlyViewedCandidate } from '../types';
import { ProfileCard } from '../components/ProfileCard';
import { EmployerAuthModal } from '../components/EmployerAuthModal';
import { 
  Building2, 
  Users, 
  Bookmark, 
  Clock, 
  PhoneCall, 
  MessageSquare, 
  Sparkles, 
  Search, 
  CheckCircle, 
  CreditCard, 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MapPin,
  Briefcase,
  AlertCircle,
  FileText,
  Eye,
  Download
} from 'lucide-react';

interface EmployerDashboardViewProps {
  onNavigate: (view: string, slug?: string) => void;
}

export const EmployerDashboardView: React.FC<EmployerDashboardViewProps> = ({ onNavigate }) => {
  const { employer, employerSubscription, employerLogout, refreshEmployerState, removeSavedCandidate } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'unlocked' | 'unlocked_resumes' | 'saved' | 'recent' | 'billing'>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [unlockedResumesList, setUnlockedResumesList] = useState<any[]>([]);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [invoicesList, setInvoicesList] = useState<any[]>([]);
  const [entitlements, setEntitlements] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [editingNotesCandidateId, setEditingNotesCandidateId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [cancellingSub, setCancellingSub] = useState<boolean>(false);

  useEffect(() => {
    if (employer) {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [employer?.id]);

  const loadDashboard = async () => {
    if (!employer) return;
    setLoading(true);
    try {
      const data = await api.getEmployerDashboard(employer.id);
      if (data) {
        setDashboardData(data);
      }
      const resumes = await api.getUnlockedResumes(employer.id);
      if (Array.isArray(resumes)) {
        setUnlockedResumesList(resumes);
      } else if (resumes && (resumes as any).unlocked_resumes) {
        setUnlockedResumesList((resumes as any).unlocked_resumes);
      }

      // Load live billing data
      const [pays, invs, ents] = await Promise.all([
        api.getEmployerPayments(employer.id),
        api.getEmployerInvoices(employer.id),
        api.getEmployerEntitlements(employer.id)
      ]);
      setPaymentsList(pays || []);
      setInvoicesList(invs || []);
      setEntitlements(ents);
    } catch (e) {
      console.warn('Dashboard fetch error:', e);
    }
    setLoading(false);
  };

  const handleCancelSubscription = async () => {
    if (!employer) return;
    if (!window.confirm('Are you sure you want to cancel your subscription renewal? You will retain access until the end of your current billing period.')) {
      return;
    }
    setCancellingSub(true);
    try {
      const res = await api.cancelEmployerSubscription(employer.id);
      if (res.success) {
        setFeedback('Subscription cancellation scheduled for period end.');
        await refreshEmployerState();
        await loadDashboard();
        setTimeout(() => setFeedback(''), 4000);
      } else {
        setFeedback(res.error || 'Failed to cancel subscription');
      }
    } catch (err: any) {
      setFeedback(err.message || 'Cancellation error');
    } finally {
      setCancellingSub(false);
    }
  };

  const handleSaveNotes = async (candidateId: string) => {
    if (!employer) return;
    try {
      const res = await api.updateSavedCandidateNotes(employer.id, candidateId, notesText);
      if (res.success) {
        setFeedback('Notes updated successfully.');
        setEditingNotesCandidateId(null);
        loadDashboard();
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch {
      setFeedback('Failed to update notes.');
    }
  };

  const handleRemoveSaved = async (candidateId: string) => {
    const ok = await removeSavedCandidate(candidateId);
    if (ok) {
      setFeedback('Candidate removed from saved list.');
      loadDashboard();
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  if (!employer) {
    return (
      <div className="min-h-[75vh] bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full p-8 rounded-3xl border border-slate-200 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Employer Hiring Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Sign in or register your business to access candidate discovery tools, track contacts, manage saved candidates, and monitor your subscription.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center space-x-2"
            >
              <Building2 className="w-4 h-4" />
              <span>Employer Sign In / Register</span>
            </button>
            <button
              onClick={() => onNavigate('find-candidates')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-3 rounded-xl transition cursor-pointer"
            >
              Search Candidates
            </button>
          </div>

          <EmployerAuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onSuccess={() => {
              setShowAuthModal(false);
              loadDashboard();
            }}
          />
        </div>
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {
    saved_count: 0,
    recently_viewed_count: 0,
    unlocked_count: 0,
    contacts_limit: employerSubscription?.plan?.contact_limit || 0,
    contacts_used: employerSubscription?.contacts_used_this_period || 0,
    contacts_remaining: Math.max(0, (employerSubscription?.plan?.contact_limit || 0) - (employerSubscription?.contacts_used_this_period || 0)),
    plan_name: employerSubscription?.plan?.name || 'Free Employer'
  };

  const usagePercent = metrics.contacts_limit > 0
    ? Math.min(100, Math.round((metrics.contacts_used / metrics.contacts_limit) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* TOP BANNER / FEEDBACK */}
        {feedback && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center space-x-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* EMPLOYER PROFILE HEADER & STATS BAR */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {employer.company_name}
                  </h1>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Employer
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500 flex flex-wrap items-center gap-x-3">
                  <span>Hiring Lead: <strong>{employer.contact_person_name || employer.full_name}</strong></span>
                  {employer.phone_number && <span>• Phone: {employer.phone_number}</span>}
                  {employer.email && <span>• Email: {employer.email}</span>}
                  {employer.industry && <span>• Sector: {employer.industry}</span>}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => onNavigate('find-candidates')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow-xs inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search Candidates</span>
              </button>
              <button
                onClick={() => onNavigate('subscription-plans')}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow-xs inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Manage Subscription</span>
              </button>
              <button
                onClick={() => {
                  employerLogout();
                  onNavigate('landing');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl transition cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* 4-METRICS BENTO ROW */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Subscription & Credits */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Plan & Credits</span>
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-extrabold text-slate-900">{metrics.plan_name}</span>
                  <span className="text-xs font-extrabold text-blue-600">
                    {metrics.contacts_remaining} left
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-amber-500' : 'bg-blue-600'}`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  {metrics.contacts_used} / {metrics.contacts_limit} contact unlocks used this period
                </p>
              </div>
            </div>

            {/* 2. Unlocked Contacts */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Unlocked Contacts</span>
                <PhoneCall className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{metrics.unlocked_count}</p>
              <p className="text-[11px] text-slate-500 font-medium">Direct candidate phone numbers</p>
            </div>

            {/* 3. Saved Candidates */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Saved Candidates</span>
                <Bookmark className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{metrics.saved_count}</p>
              <p className="text-[11px] text-slate-500 font-medium">Bookmarked talent with notes</p>
            </div>

            {/* 4. Recently Viewed */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Recently Viewed</span>
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{metrics.recently_viewed_count}</p>
              <p className="text-[11px] text-slate-500 font-medium">Profiles reviewed recently</p>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Overview & Recommendations</span>
          </button>

          <button
            onClick={() => setActiveTab('unlocked')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'unlocked'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Unlocked Phone Numbers ({metrics.unlocked_count})</span>
          </button>

          <button
            onClick={() => setActiveTab('unlocked_resumes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'unlocked_resumes'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Unlocked Resumes ({unlockedResumesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'saved'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Candidates & Notes ({metrics.saved_count})</span>
          </button>

          <button
            onClick={() => setActiveTab('recent')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'recent'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Recently Viewed ({metrics.recently_viewed_count})</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'billing'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Billing & Invoices ({invoicesList.length})</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        {loading ? (
          <div className="min-h-[30vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            {/* 1. OVERVIEW & RECOMMENDATIONS */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Recommended Candidates</h3>
                    <p className="text-xs text-slate-500">Based on active global talent and highest profile completion.</p>
                  </div>
                  <button
                    onClick={() => onNavigate('find-candidates')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <span>View all in directory</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {dashboardData?.recommended_candidates && dashboardData.recommended_candidates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {dashboardData.recommended_candidates.map((c: Candidate) => (
                      <ProfileCard
                        key={c.id}
                        candidate={c}
                        onViewClick={(slug) => onNavigate('public-profile', slug)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
                    <p className="text-xs text-slate-500 font-medium">No direct recommendations yet.</p>
                    <button
                      onClick={() => onNavigate('find-candidates')}
                      className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
                    >
                      Browse Worldwide Candidates
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 2. UNLOCKED CONTACTS DIRECTORY */}
            {activeTab === 'unlocked' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Unlocked Candidate Contacts</h3>
                    <p className="text-xs text-slate-500">Candidates whose complete phone numbers you have unlocked with your subscription.</p>
                  </div>
                </div>

                {dashboardData?.unlocked_contacts && dashboardData.unlocked_contacts.length > 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-xs">
                    {dashboardData.unlocked_contacts.map((u: any) => {
                      const cand = u.candidate;
                      const cleanPhone = cand?.phone_number?.replace(/\s+/g, '') || '';
                      return (
                        <div key={u.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-extrabold text-slate-900">{cand?.full_name || 'Candidate'}</h4>
                              {cand?.is_available && (
                                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                                  Available Now
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-blue-600">
                              {cand?.job_role_name || cand?.skill_category || 'Skilled Professional'}
                            </p>
                            <p className="text-[11px] text-slate-500 flex items-center space-x-3">
                              <span className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{cand?.village_or_town || cand?.admin_level_1 || cand?.country || 'Worldwide'}</span>
                              </span>
                              <span>• Unlocked: {new Date(u.unlocked_at).toLocaleDateString()}</span>
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {cleanPhone && (
                              <>
                                <a
                                  href={`tel:${cleanPhone}`}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl transition shadow-xs flex items-center space-x-1.5"
                                >
                                  <PhoneCall className="w-3.5 h-3.5" />
                                  <span>{cand.phone_number}</span>
                                </a>
                                <a
                                  href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center space-x-1.5"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>WhatsApp</span>
                                </a>
                              </>
                            )}

                            {cand?.slug && (
                              <button
                                onClick={() => onNavigate('public-profile', cand.slug)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center space-x-1 cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Full Profile</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                    <PhoneCall className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-extrabold text-slate-900">No Unlocked Contacts Yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      When you unlock candidate contact details from search or profile views, they will appear here for fast direct calling and messaging.
                    </p>
                    <button
                      onClick={() => onNavigate('find-candidates')}
                      className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
                    >
                      Search Candidates to Unlock
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 2B. UNLOCKED RESUMES */}
            {activeTab === 'unlocked_resumes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Unlocked Candidate Resumes &amp; Documents</h3>
                    <p className="text-xs text-slate-500">Official PDF resumes you have unlocked for active recruitment and review.</p>
                  </div>
                </div>

                {unlockedResumesList && unlockedResumesList.length > 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
                    {unlockedResumesList.map((item: any) => {
                      const cand = item.candidate;
                      const resume = item.resume;
                      return (
                        <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                          <div className="flex items-start space-x-3.5">
                            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0 border border-red-200">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-extrabold text-slate-900 truncate">{cand?.full_name || 'Candidate'}</h4>
                                {resume?.original_filename && (
                                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 truncate max-w-[140px]">
                                    {resume.original_filename}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-semibold text-blue-600">
                                {cand?.job_role_name || cand?.skill_category || 'Skilled Professional'}
                              </p>
                              <p className="text-[11px] text-slate-500 flex items-center space-x-3">
                                <span>Unlocked: {new Date(item.unlocked_at).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>Action: {item.action_type === 'download' ? 'Downloaded' : 'Viewed'}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={`/api/candidates/${cand?.id || item.candidate_id}/resume/view?employer_id=${employer.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-300 transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                              <span>View PDF</span>
                            </a>

                            <a
                              href={`/api/candidates/${cand?.id || item.candidate_id}/resume/download?employer_id=${employer.id}`}
                              download
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </a>

                            {cand?.slug && (
                              <button
                                onClick={() => onNavigate('public-profile', cand.slug)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center space-x-1 cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Profile</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-extrabold text-slate-900">No Unlocked Resumes Yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      When you unlock candidate resumes on their profile pages, they will appear here with instant view and download access.
                    </p>
                    <button
                      onClick={() => onNavigate('find-candidates')}
                      className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
                    >
                      Search Candidates
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 3. SAVED CANDIDATES & PRIVATE NOTES */}
            {activeTab === 'saved' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Bookmarked Candidates & Private Notes</h3>
                    <p className="text-xs text-slate-500">Save candidates you are considering and attach private internal notes.</p>
                  </div>
                </div>

                {dashboardData?.saved_candidates && dashboardData.saved_candidates.length > 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
                    {dashboardData.saved_candidates.map((s: any) => {
                      const cand = s.candidate;
                      const isEditing = editingNotesCandidateId === s.candidate_id;

                      return (
                        <div key={s.id} className="p-5 space-y-3 hover:bg-slate-50/50 transition">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <h4 className="text-sm font-extrabold text-slate-900">{cand?.full_name || 'Candidate'}</h4>
                              <p className="text-xs font-semibold text-blue-600">
                                {cand?.job_role_name || cand?.skill_category || 'Skilled Professional'}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {cand?.experience_years ? `${cand.experience_years} yrs exp` : ''} • {cand?.country || 'Worldwide'}
                              </p>
                            </div>

                            <div className="flex items-center space-x-2">
                              {cand?.slug && (
                                <button
                                  onClick={() => onNavigate('public-profile', cand.slug)}
                                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center space-x-1 cursor-pointer"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>View Profile</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleRemoveSaved(s.candidate_id)}
                                className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition cursor-pointer"
                                title="Remove bookmark"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Private Notes Field */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            {isEditing ? (
                              <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-slate-700">
                                  Private Hiring Notes (Visible only to your company)
                                </label>
                                <textarea
                                  rows={2}
                                  value={notesText}
                                  onChange={(e) => setNotesText(e.target.value)}
                                  placeholder="e.g. Interview scheduled for Thursday. Passed initial screen..."
                                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
                                />
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleSaveNotes(s.candidate_id)}
                                    className="bg-blue-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition cursor-pointer"
                                  >
                                    Save Note
                                  </button>
                                  <button
                                    onClick={() => setEditingNotesCandidateId(null)}
                                    className="bg-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-slate-300 transition cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Internal Notes:</span>
                                  <p className="text-xs text-slate-700 font-medium italic mt-0.5">
                                    {s.notes ? `"${s.notes}"` : 'No private notes added yet.'}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    setEditingNotesCandidateId(s.candidate_id);
                                    setNotesText(s.notes || '');
                                  }}
                                  className="text-blue-600 hover:text-blue-700 text-xs font-bold inline-flex items-center space-x-1 shrink-0 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>{s.notes ? 'Edit' : 'Add Note'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                    <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-extrabold text-slate-900">No Saved Candidates</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Click the bookmark icon on any candidate in the search directory to save them here with private evaluation notes.
                    </p>
                    <button
                      onClick={() => onNavigate('find-candidates')}
                      className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
                    >
                      Browse Candidates
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 4. RECENTLY VIEWED */}
            {activeTab === 'recent' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Recently Viewed Profiles</h3>
                    <p className="text-xs text-slate-500">History of candidate profiles you opened recently.</p>
                  </div>
                </div>

                {dashboardData?.recently_viewed && dashboardData.recently_viewed.length > 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
                    {dashboardData.recently_viewed.map((r: any) => {
                      const cand = r.candidate;
                      return (
                        <div key={r.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-extrabold text-slate-900">{cand?.full_name || 'Candidate'}</h4>
                            <p className="text-xs font-bold text-blue-600">
                              {cand?.job_role_name || cand?.skill_category}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Viewed {new Date(r.viewed_at).toLocaleDateString()} {new Date(r.viewed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          {cand?.slug && (
                            <button
                              onClick={() => onNavigate('public-profile', cand.slug)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center space-x-1 cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Open Profile</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                    <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-extrabold text-slate-900">No View History</h4>
                    <p className="text-xs text-slate-500">Profiles you examine in the directory will appear here for fast return access.</p>
                  </div>
                )}
              </div>
            )}

            {/* 5. BILLING & INVOICES */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                {/* Active Plan & Subscription Management Card */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Current Tier
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          employerSubscription?.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : employerSubscription?.status === 'EXPIRED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {employerSubscription?.status || 'ACTIVE'}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                        {entitlements?.plan_name || employerSubscription?.plan?.name || 'Free Employer Starter'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {employerSubscription?.cancel_at_period_end 
                          ? 'Cancellation scheduled. Access expires at the end of the current billing cycle.'
                          : 'Your subscription renews automatically unless cancelled.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() => onNavigate('subscription-plans')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow-xs inline-flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Change / Upgrade Plan</span>
                      </button>

                      {employerSubscription?.status === 'ACTIVE' && employerSubscription.plan_id !== 'plan-free' && !employerSubscription.cancel_at_period_end && (
                        <button
                          onClick={handleCancelSubscription}
                          disabled={cancellingSub}
                          className="bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200 font-bold text-xs px-3.5 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50"
                        >
                          {cancellingSub ? 'Cancelling...' : 'Cancel Renewal'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Entitlements Breakdown Bento */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>Contact Unlocks</span>
                        <PhoneCall className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-xl font-black text-slate-900">
                          {entitlements?.contact_unlocks_remaining ?? metrics.contacts_remaining}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          of {entitlements?.contact_unlocks_total ?? metrics.contacts_limit} remaining
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>Resume Unlocks</span>
                        <FileText className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-xl font-black text-slate-900">
                          {entitlements?.resume_unlocks_remaining ?? (employerSubscription?.plan?.resume_unlock_limit ? Math.max(0, employerSubscription.plan.resume_unlock_limit - (employerSubscription.resume_unlocks_used_this_period || 0)) : 0)}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          of {entitlements?.resume_unlocks_total ?? (employerSubscription?.plan?.resume_unlock_limit || 0)} remaining
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>Billing Cycle</span>
                        <CreditCard className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-sm font-extrabold text-slate-900 capitalize">
                          {employerSubscription?.billing_interval || 'Monthly'}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {employerSubscription?.expires_at ? `Renews ${new Date(employerSubscription.expires_at).toLocaleDateString()}` : 'No expiration'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoices List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">Invoices & Receipts</h3>
                      <p className="text-xs text-slate-500">Download and view receipts for your account accounting records.</p>
                    </div>
                  </div>

                  {invoicesList.length > 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
                      {invoicesList.map((inv) => (
                        <div key={inv.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
                          <div className="flex items-start sm:items-center space-x-3.5">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-black text-slate-900">{inv.invoice_number}</span>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                  inv.status === 'PAID'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : inv.status === 'PENDING'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {inv.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 font-medium">
                                {inv.plan_name} • {(inv.amount_cents / 100).toLocaleString('en-US', { style: 'currency', currency: inv.currency || 'USD' })}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                Issued on {new Date(inv.created_at).toLocaleDateString()} {new Date(inv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 self-end sm:self-auto">
                            <button
                              onClick={() => onNavigate('invoice', inv.id)}
                              className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-extrabold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Receipt</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-3">
                      <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                      <h4 className="text-sm font-extrabold text-slate-900">No Invoices Yet</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Invoices and payment receipts will be generated automatically when you subscribe or renew a plan.
                      </p>
                      <button
                        onClick={() => onNavigate('subscription-plans')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
                      >
                        Explore Plans
                      </button>
                    </div>
                  )}
                </div>

                {/* Payment History List */}
                {paymentsList.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">Payment Transactions</h3>
                        <p className="text-xs text-slate-500">Provider-independent audit log of completed and pending payment authorizations.</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
                      {paymentsList.map((pay) => (
                        <div key={pay.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-900">
                                {(pay.amount_cents / 100).toLocaleString('en-US', { style: 'currency', currency: pay.currency || 'USD' })}
                              </span>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                pay.status === 'SUCCEEDED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {pay.status}
                              </span>
                              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                {pay.provider}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              TX: {pay.id} • {new Date(pay.created_at).toLocaleDateString()} {new Date(pay.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          {pay.invoice_id && (
                            <button
                              onClick={() => onNavigate('invoice', pay.invoice_id)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                            >
                              <span>Invoice</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
