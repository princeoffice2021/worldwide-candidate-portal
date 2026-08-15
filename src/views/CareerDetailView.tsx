import React, { useEffect, useState } from 'react';
import { 
  Briefcase, 
  Building2, 
  Layers, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight, 
  Users, 
  GraduationCap, 
  Award, 
  BookOpen, 
  HelpCircle, 
  Wrench, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { INDUSTRIES, DEPARTMENTS } from '../data/categoriesData';
import { JOB_ROLES } from '../data/jobRolesList';
import { 
  careerGuidesStore, 
  getRelatedJobRoles, 
  getRelatedBlogArticles, 
  getBreadcrumbsForRole 
} from '../data/careerGuidesData';
import { CareerGuide } from '../types/career';
import { updateDocumentSEO } from '../lib/seo';

interface CareerDetailViewProps {
  roleSlug: string;
  onNavigate: (view: string, slug?: string, filters?: any) => void;
}

export const CareerDetailView: React.FC<CareerDetailViewProps> = ({ roleSlug, onNavigate }) => {
  const [guide, setGuide] = useState<CareerGuide | null>(null);

  useEffect(() => {
    const loaded = careerGuidesStore.getBySlug(roleSlug);
    setGuide(loaded);

    if (loaded) {
      const breadcrumbData = getBreadcrumbsForRole(loaded.job_role_id);
      const isPublished = loaded.content_status === 'published';

      updateDocumentSEO({
        title: loaded.seo_title || `${loaded.job_role_name} Career Guide | Skills, Qualifications & Career Path`,
        description: loaded.meta_description || loaded.short_introduction || `Learn about ${loaded.job_role_name} careers, required technical skills, qualifications, and hiring demand.`,
        canonical: `/careers/${loaded.slug}`,
        noIndex: !isPublished,
        schemaJson: isPublished ? [
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: loaded.seo_title,
            description: loaded.meta_description,
            author: {
              '@type': 'Person',
              name: loaded.author_name || 'Editorial Board'
            },
            publisher: {
              '@type': 'Organization',
              name: 'Candidate Portal'
            },
            datePublished: loaded.published_at || loaded.last_updated,
            dateModified: loaded.last_updated
          },
          ...(loaded.faq_items && loaded.faq_items.length > 0 ? [{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: loaded.faq_items.map(faq => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
              }
            }))
          }] : [])
        ] : undefined
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [roleSlug]);

  if (!guide) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md">
          <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Career Guide Not Found</h2>
          <p className="text-xs text-slate-500 mt-2">
            The requested career guide could not be located in our standardized registry.
          </p>
          <button
            onClick={() => onNavigate('industries')}
            className="mt-5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
          >
            Browse All Industries
          </button>
        </div>
      </div>
    );
  }

  const breadcrumbs = getBreadcrumbsForRole(guide.job_role_id);
  const relatedRoles = getRelatedJobRoles(guide.job_role_id, 6);
  const relatedArticles = getRelatedBlogArticles(guide.industry_id, guide.department_id, guide.job_role_id);
  const isPublished = guide.content_status === 'published';

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Draft / Partial Notice Banner */}
      {!isPublished && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center text-xs font-medium text-amber-800 flex items-center justify-center space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Editorial Status: {guide.content_status.toUpperCase()}</strong> — Full curriculum and verified regional data are being curated by our editorial board. (Page marked noindex)
          </span>
        </div>
      )}

      {/* Hero Header */}
      <section className="bg-slate-900 text-white border-b border-slate-800 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center flex-wrap gap-2 text-xs text-slate-400 mb-6 font-medium">
            <button onClick={() => onNavigate('landing')} className="hover:text-blue-400 transition cursor-pointer">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <button onClick={() => onNavigate('industries')} className="hover:text-blue-400 transition cursor-pointer">
              Industries
            </button>
            {breadcrumbs?.industry && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <button 
                  onClick={() => onNavigate('industry-detail', breadcrumbs.industry.slug)} 
                  className="hover:text-blue-400 transition cursor-pointer"
                >
                  {breadcrumbs.industry.name}
                </button>
              </>
            )}
            {breadcrumbs?.department && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <button 
                  onClick={() => onNavigate('department-detail', `${breadcrumbs.industry?.slug}/${breadcrumbs.department.slug}`)} 
                  className="hover:text-blue-400 transition cursor-pointer"
                >
                  {breadcrumbs.department.name}
                </button>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-200">{guide.job_role_name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <div className="lg:col-span-2">
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Standardized Career Profile</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {guide.job_role_name} Career Guide
              </h1>

              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                {guide.short_introduction}
              </p>

              {/* CTAs */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigate('find-candidates', undefined, { 
                    industryId: guide.industry_id, 
                    departmentId: guide.department_id,
                    roleId: guide.job_role_id
                  })}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-3 rounded-xl transition shadow-xs flex items-center space-x-2 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Find {guide.job_role_name} Candidates</span>
                </button>

                <button
                  onClick={() => onNavigate('login')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-5 py-3 rounded-xl transition cursor-pointer"
                >
                  <span>Register as a {guide.job_role_name}</span>
                </button>
              </div>
            </div>

            {/* Meta Metadata Box */}
            <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5 space-y-3 text-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Classification Details</h2>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-400">Industry:</span>
                  <span className="text-slate-200 font-medium">{breadcrumbs?.industry?.name || 'General'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-400">Department:</span>
                  <span className="text-slate-200 font-medium">{breadcrumbs?.department?.name || 'General'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-400">Last Updated:</span>
                  <span className="text-slate-200">{guide.last_updated}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Author:</span>
                  <span className="text-slate-200">{guide.author_name}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main 2-Col Content Area */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* 1. Overview & What They Do */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-slate-900">
                What Does a {guide.job_role_name} Do?
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                {guide.overview}
              </p>
            </section>

            {/* 2. Key Responsibilities & Day to Day Duties */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3">
                  Key Responsibilities
                </h2>
                <div className="space-y-2.5">
                  {guide.responsibilities?.map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {guide.day_to_day_duties && guide.day_to_day_duties.length > 0 && (
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Typical Day-to-Day Duties</span>
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc pl-5">
                    {guide.day_to_day_duties.map((duty, idx) => (
                      <li key={idx} className="leading-relaxed">{duty}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* 3. Essential Technical & Soft Skills */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-slate-900">
                Important Skills for a {guide.job_role_name}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Technical Skills */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/60">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-3 flex items-center space-x-1.5">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Technical Proficiencies</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {guide.technical_skills?.map((skill, idx) => (
                      <span key={idx} className="bg-white border border-slate-200 text-slate-800 text-xs font-medium px-2.5 py-1 rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Soft Skills */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/60">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Soft & Interpersonal Skills</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {guide.soft_skills?.map((skill, idx) => (
                      <span key={idx} className="bg-white border border-slate-200 text-slate-800 text-xs font-medium px-2.5 py-1 rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </section>

            {/* 4. Qualifications, Education & Certifications */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span>Qualifications & Education Requirements</span>
              </h2>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <p className="leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-slate-800">
                  <strong>Academic Overview:</strong> {guide.education_requirements}
                </p>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Common Baseline Qualifications
                  </h3>
                  <ul className="space-y-2 list-disc pl-5 text-slate-700">
                    {guide.qualifications?.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>

                {guide.certifications && guide.certifications.length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center space-x-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>Valued Professional Certifications</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {guide.certifications.map((c, idx) => (
                        <span key={idx} className="bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium px-2.5 py-1 rounded-md">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 5. How to Become & Career Path */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-slate-900">
                How to Become a {guide.job_role_name} & Career Progression
              </h2>

              {/* Step by step */}
              <div className="space-y-3">
                {guide.how_to_become?.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-xs sm:text-sm text-slate-700">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed pt-0.5">{step}</span>
                  </div>
                ))}
              </div>

              {/* Career Path Stages */}
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Career Hierarchy & Progression Stages</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <div className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Entry-Level</div>
                    <div className="text-xs font-bold text-slate-900 mt-1 mb-2">0 - 2 Years</div>
                    <ul className="text-[11px] text-slate-600 space-y-1">
                      {guide.entry_level_roles?.map((r, i) => (
                        <li key={i}>• {r}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-200/60">
                    <div className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">Mid-Level</div>
                    <div className="text-xs font-bold text-slate-900 mt-1 mb-2">2 - 6 Years</div>
                    <ul className="text-[11px] text-slate-600 space-y-1">
                      {guide.mid_level_roles?.map((r, i) => (
                        <li key={i}>• {r}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <div className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">Senior & Lead</div>
                    <div className="text-xs font-bold text-slate-900 mt-1 mb-2">6+ Years</div>
                    <ul className="text-[11px] text-slate-600 space-y-1">
                      {guide.senior_level_roles?.map((r, i) => (
                        <li key={i}>• {r}</li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            </section>

            {/* 6. Work Environment, Tools & Hiring Industries */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-slate-900">
                Work Environment & Hiring Sectors
              </h2>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Work Setting
                  </h3>
                  <p className="leading-relaxed text-slate-600">{guide.work_environment}</p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Key Hiring Industries
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {guide.hiring_industries?.map((ind, i) => (
                      <span key={i} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>

                {guide.tools_and_technologies && guide.tools_and_technologies.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Tools & Technologies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {guide.tools_and_technologies.map((tool, i) => (
                        <span key={i} className="bg-blue-50 text-blue-900 text-xs px-2.5 py-1 rounded-md font-medium border border-blue-100">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 7. Salary Information (Realistic & Neutral, No Fake Global Numbers) */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>Salary Information & Compensation Factors</span>
              </h2>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    {guide.salary_disclaimer}
                  </p>
                </div>
              </div>

              {guide.salary_factors && guide.salary_factors.length > 0 && (
                <div className="pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Primary Compensation Drivers
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-600 list-disc pl-5">
                    {guide.salary_factors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* 8. Interview Questions & Resume Tips */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <span>Interview Preparation & Resume Tips</span>
              </h2>

              {/* Questions */}
              {guide.interview_questions && guide.interview_questions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Common Interview Questions
                  </h3>
                  {guide.interview_questions.map((q, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1.5">
                      <div className="text-xs font-bold text-slate-900">Q: {q.question}</div>
                      <div className="text-xs text-slate-600 leading-relaxed">
                        <strong className="text-blue-600">Tip:</strong> {q.tip}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Resume Tips */}
              {guide.resume_tips && guide.resume_tips.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Resume / CV Optimization Tips</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-600 list-disc pl-5">
                    {guide.resume_tips.map((tip, idx) => (
                      <li key={idx} className="leading-relaxed">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* 9. FAQs */}
            {guide.faq_items && guide.faq_items.length > 0 && (
              <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                  {guide.faq_items.map((faq) => (
                    <div key={faq.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-1.5">
                      <h3 className="text-xs font-bold text-slate-900">{faq.question}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Sidebar Right Column */}
          <div className="space-y-6">
            
            {/* Find Candidate CTA Box */}
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-blue-800/50">
              <h3 className="text-base font-bold text-white mb-2">
                Find {guide.job_role_name} Candidates
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Search verified profiles of qualified {guide.job_role_name} professionals ready for hiring.
              </p>
              <button
                onClick={() => onNavigate('find-candidates', undefined, { 
                  industryId: guide.industry_id, 
                  departmentId: guide.department_id,
                  roleId: guide.job_role_id
                })}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Search {guide.job_role_name} Talent</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Related Job Roles */}
            {relatedRoles.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Related Job Roles
                </h3>
                <div className="space-y-2 text-xs">
                  {relatedRoles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => onNavigate('career-detail', role.slug)}
                      className="w-full text-left py-1.5 text-slate-600 hover:text-blue-600 hover:underline flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">{role.name}</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Related Guides & Articles */}
            {relatedArticles.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Related Articles & Guides</span>
                </h3>
                <div className="space-y-4">
                  {relatedArticles.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => onNavigate('article-detail', art.slug)}
                      className="group cursor-pointer border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                    >
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug">
                        {art.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {art.excerpt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hierarchy Links */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Explore Related Fields</h3>
              {breadcrumbs?.department && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Department:</span>
                  <button 
                    onClick={() => onNavigate('department-detail', `${breadcrumbs.industry?.slug}/${breadcrumbs.department.slug}`)}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    All {breadcrumbs.department.name} Roles →
                  </button>
                </div>
              )}
              {breadcrumbs?.industry && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Industry:</span>
                  <button 
                    onClick={() => onNavigate('industry-detail', breadcrumbs.industry.slug)}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    All {breadcrumbs.industry.name} Careers →
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
