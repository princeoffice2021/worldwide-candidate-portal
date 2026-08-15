import React, { useState } from 'react';
import { INDUSTRIES, getDepartmentsByIndustryId, getRolesByDepartmentId, getRolesByIndustryId } from '../data/categoriesData';
import { Briefcase, Building2, ChevronDown, ChevronRight, ChevronUp, Globe, HelpCircle, MapPin, Search, ShieldCheck, UserCheck, Zap, Layers, X, ArrowRight } from 'lucide-react';
import { CategoryFilterParams } from '../App';

interface LandingPageProps {
  onNavigate: (view: string, slug?: string, filters?: CategoryFilterParams) => void;
  onSearchSkill?: (skill: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSearchSkill }) => {
  const [selectedIndustryFilter, setSelectedIndustryFilter] = useState<string>('');
  const [locationQuery, setLocationQuery] = useState<string>('');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Expandable Industry & Department Card State on Homepage
  const [expandedIndustryId, setExpandedIndustryId] = useState<string | null>(null);
  const [expandedDeptId, setExpandedDeptId] = useState<string | null>(null);

  // Modal / Drawer state for browsing all 1,000+ roles
  const [isBrowseModalOpen, setIsBrowseModalOpen] = useState<boolean>(false);
  const [activeModalIndustry, setActiveModalIndustry] = useState<string>(INDUSTRIES[0].id);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('find-candidates', undefined, {
      industryId: selectedIndustryFilter || undefined,
      keyword: locationQuery || undefined,
    });
  };

  const toggleFaq = (idx: number) => {
    setFaqOpen(faqOpen === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* HERO SECTION - Deep Navy Identity */}
      <section className="relative bg-slate-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-800">
        {/* Subtle Radial Blue Glow Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900 to-slate-950 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Top Pill Notice */}
          <div className="inline-flex items-center space-x-2 bg-slate-800/80 backdrop-blur-md border border-slate-700 text-blue-300 px-3.5 py-1.5 rounded-full text-xs font-bold mb-6 shadow-xs">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>Worldwide Reverse Job Board — Candidate Discovery Platform</span>
          </div>

          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Find Skilled People. <span className="text-blue-400">Anywhere.</span>
            </h1>
            <p className="text-sm sm:text-lg text-slate-300 leading-relaxed font-normal">
              A worldwide platform where skilled candidates create professional profiles, and employers discover & contact verified talent by skill, experience, availability, and location.
            </p>
          </div>

          {/* DUAL CTA BOXES (Candidates vs Employers) */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            
            {/* CTA 1: FOR CANDIDATES */}
            <div className="bg-slate-800/70 backdrop-blur-md rounded-3xl p-6 border border-slate-700 text-white flex flex-col justify-between hover:bg-slate-800/90 hover:border-slate-600 transition shadow-xl">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 mb-4 border border-blue-500/30">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">For Candidates</h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Create your profile with mobile phone verification and get discovered directly by employers in your city or anywhere worldwide.
                </p>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => onNavigate('login')}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm py-3 px-5 rounded-xl shadow-xs flex items-center justify-center space-x-2 transition cursor-pointer"
                >
                  <span>Create Candidate Profile</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CTA 2: FOR EMPLOYERS */}
            <div className="bg-slate-800/70 backdrop-blur-md rounded-3xl p-6 border border-slate-700 text-white flex flex-col justify-between hover:bg-slate-800/90 hover:border-slate-600 transition shadow-xl">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-400 mb-4 border border-amber-400/20">
                  <Search className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">For Employers</h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Search drivers, electricians, computer operators, mechanics, and technicians. Browse profiles freely and subscribe to unlock contact info.
                </p>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => onNavigate('find-candidates')}
                  className="flex-1 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs py-3 px-4 rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <span>Search Candidates</span>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => onNavigate('subscription-plans')}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs py-3 px-4 rounded-xl transition flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-900" />
                  <span>Employer Plans</span>
                </button>
              </div>
            </div>

          </div>

          {/* Quick Search Bar */}
          <div className="mt-10 max-w-3xl mx-auto bg-white p-2.5 rounded-2xl shadow-xl border border-slate-200">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={selectedIndustryFilter}
                  onChange={(e) => setSelectedIndustryFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select Industry Sector (35 Major Sectors)...</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {ind.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 w-full">
                <MapPin className="w-4 h-4 text-blue-600 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Location (e.g. Delhi, Dubai, Toronto)..."
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
              >
                <span>Search</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* POPULAR INDUSTRY SECTORS & HIERARCHY EXPLORER */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Browse Worldwide Industry Sectors</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Find qualified talent across 35 Industry Sectors and 1,000+ standardized job roles.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsBrowseModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 hover:bg-blue-600 hover:text-white text-blue-900 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-blue-600 group-hover:text-white" />
            <span>Browse All 1,000+ Job Roles</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {INDUSTRIES.map((ind) => {
            const depts = getDepartmentsByIndustryId(ind.id);
            const isExpanded = expandedIndustryId === ind.id;

            if (isExpanded) {
              return (
                <div
                  key={ind.id}
                  className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 bg-white p-5 sm:p-6 rounded-3xl border-2 border-blue-600 shadow-xl transition-all duration-300 space-y-5 text-left"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                            {ind.name}
                          </h3>
                          <span className="text-[10px] font-extrabold bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-0.5 rounded-full">
                            {depts.length} Departments
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {ind.description || 'Verified candidates & professional talent.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setExpandedIndustryId(null);
                        setExpandedDeptId(null);
                      }}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer"
                    >
                      <span>Collapse Card</span>
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Departments Accordion List */}
                  <div className="space-y-3">
                    <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                      Departments in {ind.name} (Click a department to view job roles)
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {depts.map((dept) => {
                        const deptRoles = getRolesByDepartmentId(dept.id);
                        const isDeptExpanded = expandedDeptId === dept.id;

                        return (
                          <div
                            key={dept.id}
                            className={`border rounded-2xl transition-all overflow-hidden ${
                              isDeptExpanded
                                ? 'border-blue-600 bg-blue-50/30 shadow-xs'
                                : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                            }`}
                          >
                            {/* Department Header Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setExpandedDeptId(isDeptExpanded ? null : dept.id);
                              }}
                              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-blue-50/50 transition cursor-pointer"
                            >
                              <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                                <Building2 className={`w-4 h-4 shrink-0 ${isDeptExpanded ? 'text-blue-600' : 'text-slate-400'}`} />
                                <span className="text-xs font-bold text-slate-800 truncate">
                                  {dept.name}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md shrink-0">
                                  {deptRoles.length} Roles
                                </span>
                              </div>
                              {isDeptExpanded ? (
                                <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                            </button>

                            {/* Department Job Roles Chips */}
                            {isDeptExpanded && (
                              <div className="p-3 bg-white border-t border-blue-100 space-y-2 animate-fadeIn">
                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  <span>Click a role to search candidates:</span>
                                  <button
                                    type="button"
                                    onClick={() => onNavigate('find-candidates', undefined, { industryId: ind.id, departmentId: dept.id })}
                                    className="text-blue-600 hover:underline normal-case font-bold cursor-pointer"
                                  >
                                    View all candidates in {dept.name} &rarr;
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {deptRoles.map((role) => (
                                    <button
                                      key={role.id}
                                      type="button"
                                      onClick={() => {
                                        if (onSearchSkill) onSearchSkill(role.name);
                                        onNavigate('find-candidates', undefined, {
                                          industryId: ind.id,
                                          departmentId: dept.id,
                                          roleId: role.id,
                                        });
                                      }}
                                      className="bg-blue-50/80 hover:bg-blue-600 hover:text-white text-slate-800 border border-blue-200/80 px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer group/chip"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 group-hover/chip:bg-white shrink-0" />
                                      <span>{role.name}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs text-slate-500 font-medium">
                      Find verified talent across all departments in {ind.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate('find-candidates', undefined, { industryId: ind.id })}
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
                    >
                      <span>Find Candidates in {ind.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={ind.id}
                onClick={() => {
                  setExpandedIndustryId(ind.id);
                  setExpandedDeptId(null);
                }}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-600 hover:shadow-md transition text-left group cursor-pointer space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:bg-blue-600 group-hover:text-white transition">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      {depts.length} Depts
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                    {ind.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                    {ind.description || 'Verified candidates & professional talent.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-600">
                  <span>Explore Categories</span>
                  <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW CANDIDATE PORTAL WORKS */}
      <section className="py-12 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              How Candidate Portal Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">3 Simple Steps to Connect</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 relative text-left">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-xs">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Candidates Create Profiles</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Candidates register with their mobile phone number and custom password, add skills, experience, expected salary, availability, and location details with easy voice typing support.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 relative text-left">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-xs">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Employers Search Talent</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Employers search candidates worldwide by skill category, experience level, availability, and location hierarchy (Country &rarr; State &rarr; City).
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 relative text-left">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-xs">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Subscribe and Connect</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Phone numbers are masked to prevent spam. Subscribed employers unlock full contact numbers, direct phone calls, and instant WhatsApp messaging.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* EMPLOYER SUBSCRIPTION BANNER */}
      <section className="py-12 bg-slate-950 text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="space-y-2 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              Employer Access Architecture
            </span>
            <h3 className="text-2xl font-extrabold text-white">
              Subscribe to Unlock Candidate Phone Numbers & WhatsApp
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Choose from Free, Basic, Pro, or Unlimited plans. Connect directly with skilled candidates worldwide without middleman agency fees.
            </p>
          </div>

          <button
            onClick={() => onNavigate('subscription-plans')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl transition shadow-lg shrink-0 flex items-center space-x-2 cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-amber-300" />
            <span>Explore Subscription Plans</span>
          </button>
        </div>
      </section>

      {/* "AVAILABLE NOW" & PRIVACY EXPLANATION */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Available Now Explanation */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xs flex items-start space-x-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-bold text-white mb-1">Instant "Available Now" Status</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Candidates can toggle their availability on or off anytime from their candidate dashboard. When set to "Available Now", employers know you are ready for immediate hire.
              </p>
            </div>
          </div>

          {/* Card 2: Privacy Assurance */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xs flex items-start space-x-4">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-bold text-white mb-1">Database-Level Phone Security</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Candidate phone numbers are protected at the database/API level to prevent web scraping and spam. Subscribed employers unlock authentic candidate contact details safely.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-600 mt-1">Simple answers for candidates and employers.</p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Is Candidate Portal free for job seekers?',
              a: 'Yes! Candidates can create and maintain their professional profiles completely free of charge.',
            },
            {
              q: 'Do candidates need an email address to register?',
              a: 'No! Registration requires only your country calling code, phone number, and a secure password created by you.',
            },
            {
              q: 'How do employers contact candidates?',
              a: 'Employers can browse candidate cards freely with masked phone numbers. Subscribing to an employer plan unlocks full phone numbers, direct phone calls, and WhatsApp chats.',
            },
            {
              q: 'What subscription plans are available for employers?',
              a: 'We offer Free, Basic ($29/mo), Pro ($79/mo), and Unlimited/Business ($199/mo) plans tailored for individual hirers up to large enterprises.',
            },
            {
              q: 'Can candidates type in Hindi or regional languages?',
              a: 'Yes! Full Unicode is supported, plus built-in microphone voice typing allows candidates to speak naturally in Hindi, English, or Punjabi.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-left"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 text-left hover:bg-slate-50 transition cursor-pointer"
              >
                <span>{item.q}</span>
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
              </button>
              {faqOpen === idx && (
                <div className="px-4 pb-4 text-xs text-slate-600 border-t border-slate-100 pt-2 leading-relaxed bg-slate-50/50">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* MODAL: 1,000+ JOB ROLES HIERARCHY BROWSER */}
      {isBrowseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-extrabold text-white">Worldwide Profession Hierarchy (1,000+ Job Roles)</h3>
                  <p className="text-[11px] text-slate-300">
                    Explore Industry Sectors &rarr; Departments &rarr; Standard Job Roles
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBrowseModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Industry Selector List */}
              <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 overflow-y-auto p-2 shrink-0 max-h-48 md:max-h-none">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Select Sector ({INDUSTRIES.length})
                </div>
                {INDUSTRIES.map((ind) => {
                  const isActive = activeModalIndustry === ind.id;
                  return (
                    <button
                      key={ind.id}
                      onClick={() => setActiveModalIndustry(ind.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer my-0.5 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-200/60'
                      }`}
                    >
                      <span className="truncate">{ind.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 ml-1 opacity-70" />
                    </button>
                  );
                })}
              </div>

              {/* Right Main Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-white">
                {(() => {
                  const selectedIndObj = INDUSTRIES.find((i) => i.id === activeModalIndustry);
                  const depts = getDepartmentsByIndustryId(activeModalIndustry);
                  const rolesForInd = getRolesByIndustryId(activeModalIndustry);

                  return (
                    <div>
                      <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900">
                            {selectedIndObj?.name}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {depts.length} Departments &bull; {rolesForInd.length} Standard Job Roles
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setIsBrowseModalOpen(false);
                            onNavigate('find-candidates', undefined, { industryId: activeModalIndustry });
                          }}
                          className="bg-blue-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer shadow-xs"
                        >
                          Find Candidates in this Sector &rarr;
                        </button>
                      </div>

                      <div className="space-y-6 mt-4">
                        {depts.map((dept) => {
                          const deptRoles = rolesForInd.filter((r) => r.department_id === dept.id);
                          return (
                            <div key={dept.id} className="space-y-2">
                              <div className="flex items-center justify-between text-xs font-extrabold text-blue-900 bg-blue-50/80 px-3 py-2 rounded-xl border border-blue-100">
                                <div className="flex items-center space-x-1.5 min-w-0">
                                  <Building2 className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                                  <span className="truncate">{dept.name} ({deptRoles.length} Roles)</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsBrowseModalOpen(false);
                                    onNavigate('find-candidates', undefined, {
                                      industryId: activeModalIndustry,
                                      departmentId: dept.id,
                                    });
                                  }}
                                  className="text-[11px] font-bold text-blue-600 hover:underline hover:bg-blue-100/60 px-2 py-0.5 rounded transition shrink-0 cursor-pointer"
                                >
                                  Search Dept &rarr;
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2">
                                {deptRoles.map((role) => (
                                  <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => {
                                      setIsBrowseModalOpen(false);
                                      onNavigate('find-candidates', undefined, {
                                        industryId: activeModalIndustry,
                                        departmentId: dept.id,
                                        roleId: role.id,
                                      });
                                    }}
                                    className="text-xs text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5 transition text-left cursor-pointer group"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:bg-blue-600 shrink-0" />
                                    <span className="truncate font-medium">{role.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 shrink-0">
              <span>Looking for unlisted professions? Candidates can also specify custom roles during registration.</span>
              <button
                type="button"
                onClick={() => setIsBrowseModalOpen(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-1.5 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
