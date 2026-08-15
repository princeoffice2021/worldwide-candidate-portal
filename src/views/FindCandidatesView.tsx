import React, { useState, useEffect, useMemo } from 'react';
import { INDUSTRIES, DEPARTMENTS, JOB_ROLES, getDepartmentsByIndustryId, getRolesByDepartmentId } from '../data/categoriesData';
import { Candidate } from '../types';
import { localDb, isSupabaseConfigured, supabase } from '../lib/supabase';
import { api } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import { ProfileCard } from '../components/ProfileCard';
import { 
  Briefcase, 
  MapPin, 
  Search, 
  Users, 
  Zap, 
  Layers, 
  X, 
  Building2, 
  UserPlus, 
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  ArrowUpDown,
  Globe2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CategoryFilterParams } from '../App';

interface FindCandidatesViewProps {
  onNavigate: (view: string, slug?: string, filters?: CategoryFilterParams) => void;
  initialFilters?: CategoryFilterParams;
}

export const FindCandidatesView: React.FC<FindCandidatesViewProps> = ({ onNavigate, initialFilters }) => {
  const { employer, employerSubscription } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Core Search Filters
  const [industryFilter, setIndustryFilter] = useState<string>(initialFilters?.industryId || '');
  const [deptFilter, setDeptFilter] = useState<string>(initialFilters?.departmentId || '');
  const [roleFilter, setRoleFilter] = useState<string>(initialFilters?.roleId || '');
  const [roleKeywordQuery, setRoleKeywordQuery] = useState<string>(initialFilters?.keyword || '');
  const [locationQuery, setLocationQuery] = useState<string>('');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  // Advanced Filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [expRange, setExpRange] = useState<string>(''); // '0-2', '3-5', '6-10', '10+'
  const [workplaceType, setWorkplaceType] = useState<string>(''); // 'On-site', 'Hybrid', 'Remote'
  const [relocationOnly, setRelocationOnly] = useState<boolean>(false);
  const [minCompletion, setMinCompletion] = useState<number>(0);
  const [skillTagQuery, setSkillTagQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('recommended'); // 'recommended', 'experience_high', 'completion_high', 'recent'

  // Synchronize state when initialFilters prop changes
  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.industryId !== undefined) setIndustryFilter(initialFilters.industryId);
      if (initialFilters.departmentId !== undefined) setDeptFilter(initialFilters.departmentId);
      if (initialFilters.roleId !== undefined) setRoleFilter(initialFilters.roleId);
      if (initialFilters.keyword !== undefined) setRoleKeywordQuery(initialFilters.keyword);
    }
  }, [initialFilters?.industryId, initialFilters?.departmentId, initialFilters?.roleId, initialFilters?.keyword]);

  useEffect(() => {
    loadCandidates();
  }, [industryFilter, deptFilter, roleFilter, roleKeywordQuery, locationQuery, onlyAvailable, expRange, workplaceType, relocationOnly, minCompletion, skillTagQuery, sortBy, employer?.id]);

  const selectedIndObj = useMemo(() => {
    if (!industryFilter) return null;
    return INDUSTRIES.find((i) => i.id === industryFilter || i.slug === industryFilter);
  }, [industryFilter]);

  const selectedDeptObj = useMemo(() => {
    if (!deptFilter) return null;
    return DEPARTMENTS.find((d) => d.id === deptFilter);
  }, [deptFilter]);

  const selectedRoleObj = useMemo(() => {
    if (!roleFilter) return null;
    return JOB_ROLES.find((r) => r.id === roleFilter);
  }, [roleFilter]);

  const availableDeptsForSelectedIndustry = useMemo(() => {
    if (!industryFilter) return [];
    return getDepartmentsByIndustryId(industryFilter);
  }, [industryFilter]);

  const availableRolesForSelectedDept = useMemo(() => {
    if (!deptFilter) return [];
    return getRolesByDepartmentId(deptFilter);
  }, [deptFilter]);

  const loadCandidates = async () => {
    setLoading(true);

    let minExpNum: number | undefined = undefined;
    let maxExpNum: number | undefined = undefined;

    if (expRange === '0-2') { minExpNum = 0; maxExpNum = 2; }
    else if (expRange === '3-5') { minExpNum = 3; maxExpNum = 5; }
    else if (expRange === '6-10') { minExpNum = 6; maxExpNum = 10; }
    else if (expRange === '10+') { minExpNum = 10; }

    // 1. Try Central Backend API with server-side multi-factor ranking & employer context
    try {
      const res = await api.getCandidates({
        industry_id: industryFilter || undefined,
        department_id: deptFilter || undefined,
        job_role_id: roleFilter || undefined,
        search: roleKeywordQuery.trim() || undefined,
        location: locationQuery.trim() || undefined,
        is_available: onlyAvailable ? true : undefined,
        min_experience_years: minExpNum,
        max_experience_years: maxExpNum,
        workplace_type: workplaceType || undefined,
        willing_to_relocate: relocationOnly ? true : undefined,
        min_completion_percentage: minCompletion > 0 ? minCompletion : undefined,
        skills: skillTagQuery.trim() ? [skillTagQuery.trim()] : undefined,
        sort_by: sortBy,
        employer_id: employer?.id || undefined,
        limit: 100
      });

      if (res && res.candidates) {
        setCandidates(res.candidates as Candidate[]);
        setLoading(false);
        return;
      }
    } catch {}

    // 2. Supabase fallback
    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.from('candidates').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          setCandidates(data as Candidate[]);
          setLoading(false);
          return;
        }
      } catch {}
    }

    // 3. Local DB fallback
    setCandidates(localDb.getCandidates());
    setLoading(false);
  };

  const resetAllFilters = () => {
    setIndustryFilter('');
    setDeptFilter('');
    setRoleFilter('');
    setRoleKeywordQuery('');
    setLocationQuery('');
    setOnlyAvailable(false);
    setExpRange('');
    setWorkplaceType('');
    setRelocationOnly(false);
    setMinCompletion(0);
    setSkillTagQuery('');
    setSortBy('recommended');
  };

  const hasActiveFilters = Boolean(
    industryFilter || 
    deptFilter || 
    roleFilter || 
    roleKeywordQuery || 
    locationQuery || 
    onlyAvailable || 
    expRange || 
    workplaceType || 
    relocationOnly || 
    minCompletion > 0 || 
    skillTagQuery
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* EMPLOYER LOGGED-IN STATUS BAR */}
        {employer && (
          <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900">
                  Employer Access: <span className="text-blue-600">{employer.company_name}</span>
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Active Plan: <span className="font-bold text-emerald-700">{employerSubscription?.plan?.name || 'Free Plan'}</span> •{' '}
                  <span className="font-bold text-blue-600">
                    {Math.max(0, (employerSubscription?.plan?.contact_limit || 0) - (employerSubscription?.contacts_used_this_period || 0))} contact credits remaining
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigate('employer-dashboard')}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
              >
                Employer Dashboard &rarr;
              </button>
              <button
                onClick={() => onNavigate('subscription-plans')}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Find Skilled Candidates Worldwide
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Browse verified candidate profiles across 35 Industry Sectors and 1,000+ Job Roles.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-center">
            
            {/* Industry Filter Dropdown */}
            <div className="relative">
              <Briefcase className="w-4 h-4 text-blue-600 absolute left-3 top-3 pointer-events-none" />
              <select
                value={industryFilter}
                onChange={(e) => {
                  setIndustryFilter(e.target.value);
                  setDeptFilter('');
                  setRoleFilter('');
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              >
                <option value="">All Industry Sectors (35 Major Sectors)</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter (Filtered by selected Industry if chosen) */}
            <div className="relative">
              <Layers className="w-4 h-4 text-blue-600 absolute left-3 top-3 pointer-events-none" />
              <select
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setRoleFilter('');
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              >
                <option value="">
                  {industryFilter
                    ? `All Departments in Sector (${availableDeptsForSelectedIndustry.length})`
                    : 'All Departments Across Sectors'}
                </option>
                {(industryFilter ? availableDeptsForSelectedIndustry : DEPARTMENTS).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Specific Job Role Filter (Filtered by Department if selected) */}
            <div className="relative">
              <Briefcase className="w-4 h-4 text-blue-600 absolute left-3 top-3 pointer-events-none" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              >
                <option value="">
                  {deptFilter
                    ? `All Job Roles in Department (${availableRolesForSelectedDept.length})`
                    : 'All Specific Job Roles'}
                </option>
                {(deptFilter ? availableRolesForSelectedDept : JOB_ROLES.slice(0, 100)).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center pt-2 border-t border-slate-100">
            {/* Keyword Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Role / Keyword Search (e.g. Nurse, Welder)..."
                value={roleKeywordQuery}
                onChange={(e) => setRoleKeywordQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            {/* Location Input */}
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Location (e.g. Delhi, Dubai, Toronto)..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            {/* Available Now Toggle Checkbox & Advanced Filters Toggle Button */}
            <div className="flex items-center space-x-2">
              <div className="flex-1 flex items-center justify-between space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <label htmlFor="availToggle" className="text-xs font-bold text-slate-700 cursor-pointer flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span>"Available Now" Only</span>
                </label>
                <input
                  id="availToggle"
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`p-2 rounded-xl border text-xs font-bold transition flex items-center space-x-1 cursor-pointer shrink-0 ${
                  showAdvancedFilters || expRange || workplaceType || relocationOnly || minCompletion > 0 || skillTagQuery
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                title="Toggle Advanced Filters"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {showAdvancedFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* COLLAPSIBLE ADVANCED FILTERS PANEL */}
          {showAdvancedFilters && (
            <div className="pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/70 p-4 rounded-2xl animate-in fade-in duration-200">
              
              {/* Experience Range */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Experience Level</label>
                <select
                  value={expRange}
                  onChange={(e) => setExpRange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Any Experience</option>
                  <option value="0-2">Entry Level (0 - 2 Years)</option>
                  <option value="3-5">Mid Level (3 - 5 Years)</option>
                  <option value="6-10">Senior Level (6 - 10 Years)</option>
                  <option value="10+">Expert / Veteran (10+ Years)</option>
                </select>
              </div>

              {/* Workplace Preference */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Workplace Preference</label>
                <select
                  value={workplaceType}
                  onChange={(e) => setWorkplaceType(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Any Workplace Type</option>
                  <option value="On-site">On-site Only</option>
                  <option value="Hybrid">Hybrid (Office + Remote)</option>
                  <option value="Remote">100% Remote</option>
                </select>
              </div>

              {/* Skills Tag Query */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Specific Skill Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Python, CNC, AutoCAD..."
                  value={skillTagQuery}
                  onChange={(e) => setSkillTagQuery(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Sorting Multi-Factor Rank */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Sort Results By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="recommended">Best Multi-Factor Match</option>
                  <option value="experience_high">Most Experienced First</option>
                  <option value="completion_high">Highest Profile Completion</option>
                  <option value="recent">Recently Registered</option>
                </select>
              </div>

              {/* Willing to Relocate Toggle */}
              <div className="sm:col-span-2 flex items-center space-x-2 pt-1">
                <input
                  id="relocToggle"
                  type="checkbox"
                  checked={relocationOnly}
                  onChange={(e) => setRelocationOnly(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
                <label htmlFor="relocToggle" className="text-xs font-bold text-slate-700 cursor-pointer flex items-center space-x-1">
                  <Globe2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Only candidates willing to relocate worldwide</span>
                </label>
              </div>

              {/* Min Profile Completion */}
              <div className="sm:col-span-2 flex items-center justify-between space-x-3 pt-1">
                <span className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Min Completion: {minCompletion > 0 ? `${minCompletion}%` : 'All'}</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={90}
                  step={10}
                  value={minCompletion}
                  onChange={(e) => setMinCompletion(Number(e.target.value))}
                  className="w-36 accent-blue-600 cursor-pointer"
                />
              </div>

            </div>
          )}

        </div>

        {/* Results Info & Active Filter Badges Bar */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between text-xs font-semibold text-slate-600 gap-2 px-1">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-900 text-sm">
                Showing {candidates.length} Candidate{candidates.length === 1 ? '' : 's'}
              </span>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Filters:</span>
              
              {selectedIndObj && (
                <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                  <Building2 className="w-3 h-3 text-blue-600" />
                  <span>Industry: {selectedIndObj.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIndustryFilter('');
                      setDeptFilter('');
                      setRoleFilter('');
                    }}
                    className="hover:bg-blue-200/60 p-0.5 rounded transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedDeptObj && (
                <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                  <Layers className="w-3 h-3 text-blue-600" />
                  <span>Dept: {selectedDeptObj.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDeptFilter('');
                      setRoleFilter('');
                    }}
                    className="hover:bg-blue-200/60 p-0.5 rounded transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedRoleObj && (
                <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                  <Briefcase className="w-3 h-3 text-blue-600" />
                  <span>Role: {selectedRoleObj.name}</span>
                  <button
                    type="button"
                    onClick={() => setRoleFilter('')}
                    className="hover:bg-blue-200/60 p-0.5 rounded transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {roleKeywordQuery.trim() && (
                <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold px-2.5 py-1 rounded-lg">
                  <Search className="w-3 h-3" />
                  <span>Keyword: "{roleKeywordQuery}"</span>
                  <button
                    type="button"
                    onClick={() => setRoleKeywordQuery('')}
                    className="hover:bg-slate-200 p-0.5 rounded transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {locationQuery.trim() && (
                <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold px-2.5 py-1 rounded-lg">
                  <MapPin className="w-3 h-3" />
                  <span>Location: "{locationQuery}"</span>
                  <button
                    type="button"
                    onClick={() => setLocationQuery('')}
                    className="hover:bg-slate-200 p-0.5 rounded transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {expRange && (
                <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold px-2.5 py-1 rounded-lg">
                  <span>Exp: {expRange} yrs</span>
                  <button
                    type="button"
                    onClick={() => setExpRange('')}
                    className="hover:bg-slate-200 p-0.5 rounded transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {workplaceType && (
                <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                  <span>Workplace: {workplaceType}</span>
                  <button
                    type="button"
                    onClick={() => setWorkplaceType('')}
                    className="hover:bg-blue-200 p-0.5 rounded transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {relocationOnly && (
                <span className="inline-flex items-center space-x-1 bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                  <span>Relocation Willing</span>
                  <button
                    type="button"
                    onClick={() => setRelocationOnly(false)}
                    className="hover:bg-purple-200 p-0.5 rounded transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {onlyAvailable && (
                <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                  <Zap className="w-3 h-3 text-amber-600" />
                  <span>"Available Now" Only</span>
                  <button
                    type="button"
                    onClick={() => setOnlyAvailable(false)}
                    className="hover:bg-amber-200 p-0.5 rounded transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Candidate Cards Grid OR Zero-Candidate Empty States */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : candidates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {candidates.map((c) => (
              <ProfileCard
                key={c.id}
                candidate={c}
                onViewClick={(slug) => onNavigate('public-profile', slug)}
              />
            ))}
          </div>
        ) : (
          /* RICH ZERO-CANDIDATE EMPTY STATES */
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-6 shadow-xs max-w-3xl mx-auto">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  No matching candidates found
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  Try clearing some filter criteria or searching across all 35 industry sectors.
                </p>
              </div>
              <button
                type="button"
                onClick={resetAllFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer inline-flex items-center space-x-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
