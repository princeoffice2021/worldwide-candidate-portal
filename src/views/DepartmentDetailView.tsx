import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Layers, 
  Briefcase, 
  ChevronRight, 
  ArrowRight, 
  Search, 
  Users, 
  CheckCircle2, 
  BookOpen, 
  GraduationCap, 
  Award,
  Sparkles,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { INDUSTRIES, DEPARTMENTS } from '../data/categoriesData';
import { JOB_ROLES } from '../data/jobRolesList';
import { getRelatedBlogArticles } from '../data/careerGuidesData';
import { updateDocumentSEO } from '../lib/seo';

interface DepartmentDetailViewProps {
  industrySlug: string;
  departmentSlug: string;
  onNavigate: (view: string, slug?: string, filters?: any) => void;
}

export const DepartmentDetailView: React.FC<DepartmentDetailViewProps> = ({ 
  industrySlug, 
  departmentSlug, 
  onNavigate 
}) => {
  const [roleSearch, setRoleSearch] = useState('');

  const industry = INDUSTRIES.find(i => i.slug === industrySlug) || INDUSTRIES[0];
  const department = DEPARTMENTS.find(d => d.slug === departmentSlug && d.industry_id === industry.id) || 
                     DEPARTMENTS.find(d => d.slug === departmentSlug) || 
                     DEPARTMENTS[0];

  const departmentRoles = JOB_ROLES.filter(r => r.department_id === department.id);
  const sisterDepartments = DEPARTMENTS.filter(d => d.industry_id === industry.id && d.id !== department.id);
  const relatedArticles = getRelatedBlogArticles(industry.id, department.id);

  useEffect(() => {
    if (department && industry) {
      updateDocumentSEO({
        title: `${department.name} Careers & Job Roles: ${industry.name} | Candidate Portal`,
        description: `Explore professional career pathways in ${department.name} within ${industry.name}. Browse ${departmentRoles.length} specialized job roles, essential skills, and candidate talent.`,
        canonical: `/industry/${industry.slug}/${department.slug}`,
        noIndex: false,
        schemaJson: {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: window.location.origin
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Industries',
              item: `${window.location.origin}/industries`
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: `${industry.name}`,
              item: `${window.location.origin}/industry/${industry.slug}`
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: `${department.name}`,
              item: `${window.location.origin}/industry/${industry.slug}/${department.slug}`
            }
          ]
        }
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [industry, department, departmentRoles.length]);

  const filteredRoles = departmentRoles.filter(r => {
    if (!roleSearch.trim()) return true;
    return r.name.toLowerCase().includes(roleSearch.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Hero Header */}
      <section className="bg-slate-900 text-white border-b border-slate-800 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center flex-wrap gap-2 text-xs text-slate-400 mb-6 font-medium">
            <button 
              onClick={() => onNavigate('landing')} 
              className="hover:text-blue-400 transition cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <button 
              onClick={() => onNavigate('industries')} 
              className="hover:text-blue-400 transition cursor-pointer"
            >
              Industries
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <button 
              onClick={() => onNavigate('industry-detail', industry.slug)} 
              className="hover:text-blue-400 transition cursor-pointer"
            >
              {industry.name}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-200">{department.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <div className="lg:col-span-2">
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
                <Layers className="w-3.5 h-3.5" />
                <span>Specialized Department Overview</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {department.name} Careers
              </h1>

              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                Discover key responsibilities, required qualifications, career progression roadmaps, and candidate hiring pathways in the {department.name} sector of {industry.name}.
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigate('find-candidates', undefined, { 
                    industryId: industry.id, 
                    departmentId: department.id 
                  })}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-3 rounded-xl transition shadow-xs flex items-center space-x-2 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Find {department.name} Candidates</span>
                </button>

                <button
                  onClick={() => onNavigate('login')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-5 py-3 rounded-xl transition cursor-pointer"
                >
                  <span>Create Candidate Profile in this Field</span>
                </button>
              </div>
            </div>

            {/* Department Quick Stats */}
            <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Department Profile</h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-700/50">
                  <span className="text-slate-400">Parent Industry:</span>
                  <button 
                    onClick={() => onNavigate('industry-detail', industry.slug)}
                    className="font-bold text-blue-400 hover:underline"
                  >
                    {industry.name}
                  </button>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-700/50">
                  <span className="text-slate-400">Specialized Roles:</span>
                  <span className="font-bold text-white">{departmentRoles.length} Standardized Roles</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Classification:</span>
                  <span className="font-bold text-slate-300">Worldwide Standard</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Main Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Left: Job Roles in Department */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Roles Grid */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Standardized Job Roles in {department.name} ({filteredRoles.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Select any job role to view detailed skills, qualifications, interview questions, and career roadmaps.
                  </p>
                </div>

                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    placeholder="Search roles..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {filteredRoles.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No roles found matching &quot;{roleSearch}&quot;.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredRoles.map((role) => (
                    <div
                      key={role.id}
                      onClick={() => onNavigate('career-detail', role.slug)}
                      className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition group cursor-pointer flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        {role.is_popular && (
                          <span className="text-[10px] uppercase font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                            High Demand
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 mt-3 group-hover:text-blue-600 transition">
                        {role.name}
                      </h3>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="text-[11px]">View Career Guide</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Department Overview & What Professionals Do */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900">
                What Professionals in {department.name} Do
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Professionals in {department.name} specialize in vital operational, clinical, technical, and strategic functions within the {industry.name} ecosystem. They handle day-to-day execution, maintain strict quality and safety compliance, and collaborate with cross-functional teams to deliver reliable results for employers and clients.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-900 mb-1">Essential Skills</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Discipline-specific tools, safety standards, analytical problem solving, and effective communication.
                  </p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-900 mb-1">Career Growth</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Structured progression from entry-level trainee to senior specialist, supervisor, and department leadership.
                  </p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-900 mb-1">Global Hiring</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    High demand across verified employers in domestic and international markets worldwide.
                  </p>
                </div>
              </div>
            </section>

          </div>

          {/* Sidebar Right: Related Departments & CTAs */}
          <div className="space-y-6">
            
            {/* Find Department Candidates CTA */}
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-blue-800/50">
              <h3 className="text-base font-bold text-white mb-2">Need {department.name} Talent?</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Browse verified candidates registered in {department.name} with real experience and direct contact details.
              </p>
              <button
                onClick={() => onNavigate('find-candidates', undefined, { 
                  industryId: industry.id, 
                  departmentId: department.id 
                })}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Browse {department.name} Candidates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Related Departments */}
            {sisterDepartments.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Other {industry.name} Departments
                </h3>
                <div className="space-y-2 text-xs">
                  {sisterDepartments.slice(0, 8).map((sister) => (
                    <button
                      key={sister.id}
                      onClick={() => onNavigate('department-detail', `${industry.slug}/${sister.slug}`)}
                      className="w-full text-left py-1.5 text-slate-600 hover:text-blue-600 hover:underline flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">{sister.name}</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Related Blog Articles */}
            {relatedArticles.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Related Guides</span>
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

          </div>

        </div>
      </div>

    </div>
  );
};
