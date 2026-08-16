import React from 'react';
import { useAuth } from '../context/AuthContext';
import { formatFullLocation } from '../lib/slug';
import { calculateCandidateCompletion } from '../lib/profileCompletion';
import { 
  Briefcase, 
  Edit3, 
  Eye, 
  ExternalLink, 
  LogOut, 
  MapPin, 
  CheckCircle, 
  ShieldCheck, 
  Zap, 
  User, 
  Sparkles, 
  FileText, 
  GraduationCap, 
  Languages, 
  ArrowRight,
  Shield,
  Clock
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string, slug?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, candidate, loading, toggleAvailability, logout } = useAuth();

  React.useEffect(() => {
    if (!loading && !user) {
      onNavigate('landing');
    }
  }, [loading, user, onNavigate]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <User className="w-12 h-12 text-blue-600 mb-3" />
        <h2 className="text-xl font-bold text-slate-900">No Candidate Profile Found</h2>
        <p className="text-xs text-slate-600 mt-1 max-w-sm mb-4">
          Please create your professional profile to start getting discovered by employers worldwide.
        </p>
        <button
          onClick={() => onNavigate('profile-setup')}
          className="bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs hover:bg-blue-700 transition cursor-pointer"
        >
          Create Candidate Profile
        </button>
      </div>
    );
  }

  // Calculate detailed profile breakdown
  const completionStats = calculateCandidateCompletion(candidate);
  const fullLoc = formatFullLocation(candidate);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* TOP WELCOME BANNER - Deep Navy */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {candidate.photo_url ? (
              <img
                src={candidate.photo_url}
                alt={candidate.full_name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-400 shadow-xs shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-300 border-2 border-blue-500/30 flex items-center justify-center font-bold text-2xl shrink-0">
                {candidate.full_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
                <span>{candidate.full_name}</span>
                {candidate.is_verified && (
                  <CheckCircle className="w-4 h-4 text-emerald-400" title="Verified Phone Profile" />
                )}
              </h1>
              <p className="text-xs text-slate-300 flex items-center space-x-1.5 mt-0.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-semibold">{candidate.headline || candidate.custom_profession || candidate.job_role_name || candidate.skill_category}</span>
                <span>•</span>
                <span>{candidate.experience_label || `${candidate.experience_years} Yrs`}</span>
              </p>
              <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-1">
                <MapPin className="w-3 h-3 text-blue-400" />
                <span className="truncate max-w-xs">{fullLoc}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onNavigate('profile-edit')}
              className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Edit Full Profile</span>
            </button>
            <button
              onClick={async () => {
                await logout();
                onNavigate('landing');
              }}
              className="bg-slate-800 hover:bg-red-600 text-white font-bold text-xs p-2 rounded-xl transition border border-slate-700 cursor-pointer"
              title="Logout Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PROFILE COMPLETION & NEXT BEST ACTION */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Profile Strength Engine</span>
              <h2 className="text-sm font-extrabold text-slate-900 mt-0.5">
                {completionStats.totalPercentage >= 80 ? '🌟 Profile is Highly Complete & Searchable' : '⚡ Complete Your Profile to Boost Employer Outreach'}
              </h2>
            </div>
            <span className={`text-sm font-extrabold px-3 py-1 rounded-full ${
              completionStats.totalPercentage >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {completionStats.totalPercentage}% Complete
            </span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                completionStats.totalPercentage >= 80 ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${completionStats.totalPercentage}%` }}
            />
          </div>

          {/* Next Best Action Card */}
          {completionStats.nextBestAction && (
            <div className="bg-amber-50/60 border border-amber-200 p-3.5 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-amber-900">{completionStats.nextBestAction.title}</h3>
                  <p className="text-[11px] text-amber-800 mt-0.5">{completionStats.nextBestAction.description}</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('profile-edit')}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shrink-0 flex items-center space-x-1 cursor-pointer"
              >
                <span>Complete Now</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Section Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
            {completionStats.sections.map((sec, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg border flex items-center space-x-1.5 ${
                  sec.isComplete
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${sec.isComplete ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span className="truncate">{sec.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* METRICS & STATUS CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Card 1: Profile Views Count */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Candidate Profile Views</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{candidate.profile_views || 0}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Times employers viewed your profile in directory</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Eye className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Availability Status Toggle */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Current Job Availability</p>
                <p className={`text-sm font-extrabold mt-1 ${candidate.is_available ? 'text-emerald-600' : 'text-slate-600'}`}>
                  {candidate.is_available ? '🟢 Available for Immediate Hire' : '⚪ Not Currently Seeking'}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${candidate.is_available ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                <Zap className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Toggle Status:</span>
              <button
                onClick={() => toggleAvailability(!candidate.is_available)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  candidate.is_available
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {candidate.is_available ? 'Pause Job Availability' : 'Set Available for Hire'}
              </button>
            </div>
          </div>

        </div>

        {/* SUMMARY OF STRUCTURED PROFILE SECTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{candidate.work_experiences?.length || 0} Work Roles</p>
              <p className="text-[10px] text-slate-500">Employment history</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{candidate.education?.length || 0} Degrees/Diplomas</p>
              <p className="text-[10px] text-slate-500">Academic credentials</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Languages className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{candidate.languages?.length || 0} Languages</p>
              <p className="text-[10px] text-slate-500">{candidate.skills?.length || 0} Skills Tagged</p>
            </div>
          </div>
        </div>

        {/* PUBLIC PROFILE PREVIEW LINK CARD */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Your Shareable Public Profile</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5 break-all">
                /candidates/{candidate.slug}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('public-profile', candidate.slug)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
          >
            <span>View Public Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
