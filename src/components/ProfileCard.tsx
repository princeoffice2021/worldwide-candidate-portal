import React from 'react';
import { Candidate } from '../types';
import { formatFullLocation } from '../lib/slug';
import { maskPhoneNumber } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Eye, Lock, MapPin, CheckCircle, Clock, PhoneCall, Bookmark, Sparkles, Globe2 } from 'lucide-react';

interface ProfileCardProps {
  candidate: Candidate;
  onViewClick: (slug: string) => void;
  showManageActions?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  candidate,
  onViewClick,
  showManageActions = false,
}) => {
  const { employer, isContactUnlocked, isCandidateSaved, saveCandidate, removeSavedCandidate } = useAuth();
  const fullLoc = formatFullLocation(candidate);
  const unlocked = isContactUnlocked(candidate.id);
  const isSaved = isCandidateSaved(candidate.id);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!employer) {
      // Trigger navigation or prompt
      onViewClick(candidate.slug);
      return;
    }
    if (isSaved) {
      await removeSavedCandidate(candidate.id);
    } else {
      await saveCandidate(candidate.id);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition duration-200 overflow-hidden flex flex-col justify-between group relative">
      
      {/* Top Banner & Main Content */}
      <div className="p-5">
        
        {/* Availability Badge, Profile Completion & Bookmark */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {candidate.is_available ? (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Available Now</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Unavailable</span>
              </span>
            )}

            {candidate.profile_completion_percentage && candidate.profile_completion_percentage >= 70 && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles className="w-2.5 h-2.5" />
                <span>{candidate.profile_completion_percentage}% Complete</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            {employer && (
              <button
                onClick={handleToggleBookmark}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  isSaved
                    ? 'bg-amber-50 text-amber-600 border-amber-300 hover:bg-amber-100'
                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700'
                }`}
                title={isSaved ? 'Remove from saved candidates' : 'Save candidate'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500' : ''}`} />
              </button>
            )}

            <div className="inline-flex items-center space-x-1 text-[11px] text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
              <Eye className="w-3 h-3 text-slate-400" />
              <span>{candidate.profile_views || 0}</span>
            </div>
          </div>
        </div>

        {/* Profile Avatar & Info */}
        <div className="flex items-start space-x-4">
          <div className="relative shrink-0">
            {candidate.photo_url ? (
              <img
                src={candidate.photo_url}
                alt={candidate.full_name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/20 shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-xl shadow-xs border border-slate-800">
                {candidate.full_name ? candidate.full_name.charAt(0).toUpperCase() : 'C'}
              </div>
            )}
            {candidate.is_verified && (
              <div
                className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 text-emerald-600 shadow-xs"
                title="Verified Candidate Profile"
              >
                <CheckCircle className="w-4 h-4 fill-emerald-600 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-extrabold text-slate-900 truncate group-hover:text-blue-600 transition">
              {candidate.full_name}
            </h3>

            {/* Skill / Job Role Badge */}
            <div className="mt-1 flex items-center space-x-1 text-xs font-bold text-blue-600">
              <Briefcase className="w-3.5 h-3.5 shrink-0 text-blue-600" />
              <span className="truncate">{candidate.custom_profession || candidate.job_role_name || candidate.skill_category}</span>
            </div>

            {/* Industry / Dept Subtitle */}
            {(candidate.industry_name || candidate.department_name) && (
              <div className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">
                {candidate.industry_name}{candidate.department_name ? ` • ${candidate.department_name}` : ''}
              </div>
            )}

            {/* Experience Tag */}
            <div className="mt-1 text-xs text-slate-600 font-medium">
              Experience:{' '}
              <span className="font-bold text-slate-800">
                {candidate.experience_label || `${candidate.experience_years} Years`}
              </span>
            </div>
          </div>
        </div>

        {/* Skills Tag Chips */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {candidate.skills.slice(0, 3).map((sk, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200">
                {sk.skill_name}
              </span>
            ))}
            {candidate.skills.length > 3 && (
              <span className="text-[10px] font-semibold text-slate-400 self-center">
                +{candidate.skills.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Location Row */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-start space-x-1.5 text-xs text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
          <span className="font-medium line-clamp-2">{fullLoc}</span>
        </div>

        {/* Bio preview if available */}
        {candidate.bio && (
          <p className="mt-2 text-xs text-slate-600 italic line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
            "{candidate.bio}"
          </p>
        )}

        {/* Work Preferences Tags */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-600">
          {candidate.workplace_type && (
            <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200/60">
              {candidate.workplace_type}
            </span>
          )}
          {candidate.is_relocation_willing && (
            <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200/60 flex items-center space-x-0.5">
              <Globe2 className="w-2.5 h-2.5" />
              <span>Willing to Relocate</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Protected Phone Notice & Public View CTA */}
      <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
        {unlocked ? (
          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700">
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate">{candidate.phone_number}</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-500">
            <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">{maskPhoneNumber(candidate.phone_number)}</span>
          </div>
        )}

        <button
          onClick={() => onViewClick(candidate.slug)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-xs cursor-pointer"
        >
          View Profile
        </button>
      </div>

    </div>
  );
};
