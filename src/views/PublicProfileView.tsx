import React, { useEffect, useState } from 'react';
import { Candidate } from '../types';
import { localDb, isSupabaseConfigured, supabase, maskPhoneNumber } from '../lib/supabase';
import { api } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import { formatFullLocation } from '../lib/slug';
import { EmployerAuthModal } from '../components/EmployerAuthModal';
import { 
  ArrowLeft, 
  Briefcase, 
  CheckCircle, 
  Clock, 
  Eye, 
  Lock, 
  MapPin, 
  MessageSquare, 
  PhoneCall, 
  ShieldCheck, 
  Shield,
  Sparkles, 
  User, 
  Unlock, 
  Building2,
  GraduationCap,
  Languages,
  FileText,
  Globe,
  Share2,
  Calendar,
  Layers,
  Bookmark,
  Download,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface PublicProfileViewProps {
  slug: string;
  onNavigate: (view: string, slug?: string) => void;
}

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({ slug, onNavigate }) => {
  const { 
    user, 
    candidate: myCandidate, 
    employer, 
    employerSubscription, 
    unlockContact, 
    unlockResume,
    isContactUnlocked,
    isResumeUnlocked,
    isCandidateSaved,
    saveCandidate,
    removeSavedCandidate,
    recordRecentlyViewed
  } = useAuth();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [inquirySent, setInquirySent] = useState<boolean>(false);
  const [inquiryText, setInquiryText] = useState<string>('');
  const [showInquiryModal, setShowInquiryModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [unlockMessage, setUnlockMessage] = useState<string>('');
  const [unlockLoading, setUnlockLoading] = useState<boolean>(false);
  const [resumeUnlockLoading, setResumeUnlockLoading] = useState<boolean>(false);
  const [resumeUnlockMessage, setResumeUnlockMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    loadCandidateAndIncrementView();
  }, [slug]);

  const loadCandidateAndIncrementView = async () => {
    setLoading(true);

    let found: Candidate | null = null;

    // 1. Try Central Backend API First (pass employer_id if present)
    try {
      const serverCand = await api.getCandidateBySlug(slug, employer?.id);
      if (serverCand) {
        found = serverCand as Candidate;
      }
    } catch {}

    // 2. Try Supabase if configured
    if (!found && isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.from('candidates').select('*').eq('slug', slug).single();
        if (data) {
          found = data as Candidate;
        }
      } catch {}
    }

    // 3. Fallback to Local Storage
    if (!found) {
      found = localDb.getCandidateBySlug(slug);
    }

    if (found) {
      setCandidate(found);
      const updatedViews = localDb.incrementView(found.id);
      setCandidate((prev) => (prev ? { ...prev, profile_views: updatedViews } : null));

      // If employer is logged in, record recently viewed
      if (employer?.id) {
        recordRecentlyViewed(found.id);
      }

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.rpc('increment_candidate_view', { candidate_uuid: found.id });
        } catch {}
      }
    }

    setLoading(false);
  };

  const handleShareProfile = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleToggleBookmark = async () => {
    if (!candidate) return;
    if (!employer) {
      setShowAuthModal(true);
      return;
    }
    if (isCandidateSaved(candidate.id)) {
      await removeSavedCandidate(candidate.id);
    } else {
      await saveCandidate(candidate.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <User className="w-12 h-12 text-slate-400 mb-2" />
        <h2 className="text-xl font-bold text-slate-900">Candidate Profile Not Found</h2>
        <p className="text-xs text-slate-600 mt-1 mb-4">
          The requested profile may have been removed or updated.
        </p>
        <button
          onClick={() => onNavigate('landing')}
          className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-blue-700 transition cursor-pointer"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const fullLoc = formatFullLocation(candidate);

  // Is phone unlocked for current viewer?
  const isSelf = myCandidate?.id === candidate.id || user?.id === candidate.user_id;
  const isUnlockedByEmployer = employer ? isContactUnlocked(candidate.id) : false;
  const showFullContact = isSelf || isUnlockedByEmployer || candidate.is_phone_unlocked;
  const isSaved = isCandidateSaved(candidate.id);

  const handleUnlockClick = async () => {
    if (!employer) {
      setShowAuthModal(true);
      return;
    }

    if (!employerSubscription || employerSubscription.status !== 'active') {
      setUnlockMessage('Active employer subscription required to view contact details.');
      setTimeout(() => onNavigate('subscription-plans'), 1500);
      return;
    }

    setUnlockLoading(true);
    const res = await unlockContact(candidate.id);
    setUnlockLoading(false);
    setUnlockMessage(res.message);

    if (res.success && res.candidate) {
      setCandidate(res.candidate as Candidate);
    }
  };

  const handleUnlockResumeClick = async (action: 'view' | 'download' = 'view') => {
    if (!candidate) return;

    if (!employer) {
      setShowAuthModal(true);
      return;
    }

    setResumeUnlockLoading(true);
    setResumeUnlockMessage('');

    const res = await unlockResume(candidate.id, action);
    setResumeUnlockLoading(false);

    if (res.success) {
      setResumeUnlockMessage(res.message);
      if (res.candidate) {
        setCandidate(res.candidate as Candidate);
      }
      // If action is view, open view link directly
      if (action === 'view') {
        window.open(`/api/candidates/${candidate.id}/resume/view?employer_id=${employer.id}`, '_blank');
      } else {
        window.location.href = `/api/candidates/${candidate.id}/resume/download?employer_id=${employer.id}`;
      }
    } else {
      setResumeUnlockMessage(res.message || res.error || 'Failed to unlock resume.');
    }
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryText.trim() || !candidate) return;

    try {
      await api.createAuditLog({
        actor_type: employer ? 'employer' : 'system',
        actor_id: employer?.id || 'guest_employer',
        actor_name: employer?.company_name || 'Hiring Employer',
        action: 'message_sent',
        target_type: 'candidate',
        target_id: candidate.id,
        metadata: {
          candidate_name: candidate.full_name,
          message_preview: inquiryText.trim().slice(0, 100)
        }
      });
    } catch {}

    setInquirySent(true);
    setInquiryText('');
    setTimeout(() => {
      setShowInquiryModal(false);
      setInquirySent(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back Navigation Bar & Share */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('find-candidates')}
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>&larr; Back to Candidate Directory</span>
          </button>

          <button
            onClick={handleShareProfile}
            className="inline-flex items-center space-x-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-600" />
            <span>{copied ? 'Link Copied! ✓' : 'Share Profile'}</span>
          </button>
        </div>

        {/* Main Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          
          {/* Header Backdrop */}
          <div className="bg-slate-900 h-28 relative p-4 flex justify-between items-start border-b border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-600/30 border border-blue-400/30 text-blue-200 px-2.5 py-1 rounded-md backdrop-blur-sm">
              Worldwide Candidate Profile
            </span>
            <div className="flex items-center space-x-1 text-xs text-slate-300 font-semibold bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>{candidate.profile_views || 0} Views</span>
            </div>
          </div>

          {/* Profile Card Main Info */}
          <div className="p-6 relative pt-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 mb-4">
              <div className="flex items-center space-x-4">
                {candidate.photo_url ? (
                  <img
                    src={candidate.photo_url}
                    alt={candidate.full_name}
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-blue-600 text-white border-4 border-white shadow-md flex items-center justify-center font-bold text-3xl">
                    {candidate.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
                    <span>{candidate.full_name}</span>
                    {candidate.is_verified && (
                      <CheckCircle className="w-5 h-5 text-emerald-600 fill-emerald-600 text-white" />
                    )}
                  </h1>
                  
                  {candidate.headline ? (
                    <p className="text-xs font-semibold text-slate-700 mt-0.5 max-w-lg">
                      {candidate.headline}
                    </p>
                  ) : (
                    <p className="text-xs font-bold text-blue-600 flex items-center space-x-1 mt-0.5">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <span>{candidate.custom_profession || candidate.job_role_name || candidate.skill_category}</span>
                    </p>
                  )}

                  {(candidate.industry_name || candidate.department_name) && (
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {candidate.industry_name}{candidate.department_name ? ` • ${candidate.department_name}` : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Availability Badge */}
              <div className="shrink-0">
                {candidate.is_available ? (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Available for Hire</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Not Currently Seeking</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-semibold block mb-0.5">Experience</span>
                <span className="font-extrabold text-slate-900">
                  {candidate.experience_label || `${candidate.experience_years} Years`}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-semibold block mb-0.5">Expected Salary</span>
                <span className="font-extrabold text-blue-600">
                  {candidate.expected_salary || 'Negotiable'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-semibold block mb-0.5">Workplace</span>
                <span className="font-extrabold text-slate-900">
                  {candidate.job_preferences?.workplace_type || 'Any'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-semibold block mb-0.5">Relocation</span>
                <span className="font-extrabold text-slate-900">
                  {candidate.job_preferences?.willing_to_relocate !== false ? 'Willing' : 'Local Only'}
                </span>
              </div>
            </div>

            {/* Location Row */}
            <div className="mt-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-center space-x-2 text-xs">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-bold text-slate-800">{fullLoc}</span>
            </div>

            {/* Bio section */}
            {candidate.bio && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Candidate Summary & Background
                </h3>
                <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed font-medium whitespace-pre-wrap">
                  {candidate.bio}
                </p>
              </div>
            )}

            {/* Unlock Feedback Toast */}
            {unlockMessage && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-900 text-center">
                {unlockMessage}
              </div>
            )}

            {/* Protected vs Unlocked Contact Information Box */}
            <div className="mt-6 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3 text-left">
                  <div className={`w-11 h-11 rounded-2xl text-white flex items-center justify-center shrink-0 ${
                    showFullContact ? 'bg-blue-600' : 'bg-slate-900'
                  }`}>
                    {showFullContact ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5 text-amber-300" />}
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 flex items-center space-x-2">
                      <span>Direct Phone Contact:</span>
                      <span className="font-mono text-base font-black text-blue-600">
                        {showFullContact ? candidate.phone_number : maskPhoneNumber(candidate.phone_number)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {showFullContact
                        ? 'Unlocked! Direct calling and messaging enabled for this verified candidate.'
                        : 'Candidate phone number protected at database level.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {employer && (
                    <button
                      onClick={handleToggleBookmark}
                      className={`text-xs font-bold px-3.5 py-2.5 rounded-xl border transition flex items-center space-x-1.5 cursor-pointer ${
                        isSaved
                          ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                      title={isSaved ? 'Saved in Employer Dashboard' : 'Save candidate'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-600' : 'text-slate-400'}`} />
                      <span>{isSaved ? 'Saved' : 'Save Candidate'}</span>
                    </button>
                  )}

                  {!showFullContact ? (
                    <button
                      onClick={handleUnlockClick}
                      disabled={unlockLoading}
                      className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold px-5 py-2.5 rounded-xl transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Unlock className="w-4 h-4 text-slate-950" />
                      <span>{unlockLoading ? 'Unlocking...' : 'Unlock Candidate Phone'}</span>
                    </button>
                  ) : (
                    <>
                      <a
                        href={`tel:${candidate.phone_number.replace(/\s+/g, '')}`}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition shadow-xs flex items-center justify-center space-x-1.5"
                      >
                        <PhoneCall className="w-4 h-4" />
                        <span>Call Candidate</span>
                      </a>
                      <a
                        href={`https://wa.me/${candidate.phone_number.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold px-3.5 py-2.5 rounded-xl transition shadow-xs flex items-center justify-center space-x-1.5"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    </>
                  )}

                  <button
                    onClick={() => setShowInquiryModal(true)}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Structured Sections (Work Experience, Skills, Education, Languages, Links) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* LEFT 2 COLUMNS: WORK EXPERIENCE & EDUCATION */}
          <div className="md:col-span-2 space-y-6">
            
            {/* WORK EXPERIENCE */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-extrabold text-slate-900">Work Experience & Employment History</h2>
              </div>

              {candidate.work_experiences && candidate.work_experiences.length > 0 ? (
                <div className="space-y-4">
                  {candidate.work_experiences.map((exp, idx) => (
                    <div key={exp.id || idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xs font-extrabold text-slate-900">{exp.job_title}</h3>
                          <p className="text-xs font-bold text-blue-600">{exp.company_name}</p>
                          {exp.city && <p className="text-[10px] text-slate-500">{exp.city}</p>}
                        </div>
                        <span className="text-[10px] font-bold bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-600">
                          {exp.start_date} – {exp.is_current ? 'Present' : exp.end_date || 'N/A'}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="text-xs text-slate-600 whitespace-pre-wrap pt-1 font-medium">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic py-2">
                  No detailed past employment history provided. (Candidate listed {candidate.experience_label || `${candidate.experience_years} Years`} total experience).
                </div>
              )}
            </div>

            {/* EDUCATION */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-extrabold text-slate-900">Education & Qualifications</h2>
              </div>

              {candidate.education && candidate.education.length > 0 ? (
                <div className="space-y-3">
                  {candidate.education.map((edu, idx) => (
                    <div key={edu.id || idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                      <div className="flex items-start justify-between">
                        <h3 className="text-xs font-extrabold text-slate-900">{edu.degree_or_diploma}</h3>
                        {edu.completion_year && (
                          <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {edu.completion_year}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-blue-600">{edu.institution}</p>
                      {edu.field_of_study && (
                        <p className="text-[11px] text-slate-500 font-medium">{edu.field_of_study}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic py-2">
                  No formal degree entries listed.
                </div>
              )}
            </div>

          </div>

          {/* RIGHT 1 COLUMN: SKILLS, LANGUAGES, RESUME, LINKS */}
          <div className="space-y-6">
            
            {/* SKILLS */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Layers className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-extrabold text-slate-900">Skills & Competencies</h2>
              </div>

              {candidate.skills && candidate.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((s, i) => (
                    <span
                      key={i}
                      className="bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-1 rounded-lg text-xs font-bold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No specific skills tagged.</p>
              )}
            </div>

            {/* LANGUAGES SPOKEN */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Languages className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-extrabold text-slate-900">Languages Spoken</h2>
              </div>

              {candidate.languages && candidate.languages.length > 0 ? (
                <div className="space-y-2">
                  {candidate.languages.map((l, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-800">{l.language}</span>
                      <span className="text-[10px] font-extrabold text-blue-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {l.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No language proficiencies specified.</p>
              )}
            </div>

            {/* RESUME DOCUMENT & LINKS */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-extrabold text-slate-900">Resume / CV Document</h2>
                </div>
                {(candidate.has_resume || candidate.resume || candidate.resume_document) && (
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                    PDF Attached
                  </span>
                )}
              </div>

              {resumeUnlockMessage && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{resumeUnlockMessage}</span>
                </div>
              )}

              {(() => {
                const hasResume = Boolean(
                  candidate.has_resume || 
                  (candidate.resume && candidate.resume.status === 'active') || 
                  candidate.resume_document
                );

                if (!hasResume) {
                  return (
                    <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                      <FileText className="w-6 h-6 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-500 font-medium">No resume document attached.</p>
                      <span className="text-[10px] text-slate-400">Candidate has completed online dossier.</span>
                    </div>
                  );
                }

                const visibility = candidate.resume_visibility || candidate.resume?.access_visibility || candidate.privacy_settings?.resume_visibility || 'PRIVATE';
                const isResumeUnlockedForViewer = isSelf || (employer ? (isResumeUnlocked(candidate.id) || candidate.is_resume_unlocked) : false);

                // Case 1: Candidate set resume to PRIVATE
                if (visibility === 'PRIVATE' && !isSelf) {
                  return (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs">
                        <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Resume Access Restricted</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        The candidate has set their resume privacy to <strong className="text-slate-700">Private</strong>. Direct recruiter view or download is not permitted.
                      </p>
                    </div>
                  );
                }

                // Case 2: Candidate set resume to EMPLOYER_REQUEST_REQUIRED
                if (visibility === 'EMPLOYER_REQUEST_REQUIRED' && !isSelf && !isResumeUnlockedForViewer) {
                  return (
                    <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-2.5">
                      <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                        <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Recruiter Request Required</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        This candidate requires recruiter request authorization before releasing their verified resume document.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowInquiryModal(true)}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 rounded-xl transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Send Direct Inquiry &amp; Request</span>
                      </button>
                    </div>
                  );
                }

                // Case 3: Resume is unlocked for viewer OR viewer is the candidate themselves
                if (isResumeUnlockedForViewer) {
                  const fileName = candidate.resume?.original_filename || candidate.resume_document?.file_name || `${candidate.full_name.replace(/\s+/g, '_')}_Resume.pdf`;
                  const fileSize = candidate.resume?.file_size ? `${(candidate.resume.file_size / 1024).toFixed(1)} KB` : 'PDF Document';

                  return (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0 border border-red-200">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-extrabold text-slate-900 block truncate">{fileName}</span>
                          <span className="text-[11px] text-slate-500 font-medium">{fileSize} • Verified Candidate File</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <a
                          href={isSelf ? `/api/candidates/${candidate.id}/resume/view?candidate_id=${candidate.id}` : `/api/candidates/${candidate.id}/resume/view?employer_id=${employer?.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold py-2 px-3 rounded-xl border border-slate-300 transition flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer text-center"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>View PDF</span>
                        </a>

                        <a
                          href={isSelf ? `/api/candidates/${candidate.id}/resume/download?candidate_id=${candidate.id}` : `/api/candidates/${candidate.id}/resume/download?employer_id=${employer?.id}`}
                          download
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer text-center"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>

                      {isSelf && (
                        <div className="text-[10px] text-slate-500 font-medium text-center pt-1">
                          Current Privacy: <span className="font-bold text-slate-700">{visibility}</span>
                        </div>
                      )}
                    </div>
                  );
                }

                // Case 4: Eligible employers - Resume locked, requires unlock
                return (
                  <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200/80 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-xs font-extrabold text-blue-950">Verified Resume Available</span>
                    </div>

                    <p className="text-[11px] text-blue-900 leading-relaxed font-medium">
                      Candidate has attached a verified PDF resume available to eligible employers with portal allowance.
                    </p>

                    <button
                      type="button"
                      disabled={resumeUnlockLoading}
                      onClick={() => handleUnlockResumeClick('view')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold py-2.5 px-4 rounded-xl transition flex items-center justify-center space-x-2 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {resumeUnlockLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Unlocking Document...</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>
                            {employer ? 'Unlock Resume Access' : 'Log In as Employer to Unlock'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })()}

              {/* Portfolio and LinkedIn Links */}
              {(candidate.portfolio_url || candidate.linkedin_or_social) && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {candidate.portfolio_url && (
                    <a
                      href={candidate.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-xs font-bold text-blue-600 hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Candidate Portfolio Website</span>
                    </a>
                  )}
                  {candidate.linkedin_or_social && (
                    <a
                      href={candidate.linkedin_or_social}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-xs font-bold text-blue-600 hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Professional Social Profile</span>
                    </a>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900">
              Send Direct Message to {candidate.full_name}
            </h3>
            <p className="text-xs text-slate-600">
              Your inquiry will be delivered to the candidate's dashboard.
            </p>

            {inquirySent ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl text-center">
                Message delivered successfully!
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-3">
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your job opportunity, location, and salary..."
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowInquiryModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Employer Auth Modal */}
      {showAuthModal && (
        <EmployerAuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};
