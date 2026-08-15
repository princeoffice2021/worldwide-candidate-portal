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
  ArrowUpRight
} from 'lucide-react';
import { INDUSTRIES, DEPARTMENTS } from '../data/categoriesData';
import { JOB_ROLES } from '../data/jobRolesList';
import { getRelatedBlogArticles } from '../data/careerGuidesData';
import { updateDocumentSEO } from '../lib/seo';

interface IndustryDetailViewProps {
  industrySlug: string;
  onNavigate: (view: string, slug?: string, filters?: any) => void;
}

export const IndustryDetailView: React.FC<IndustryDetailViewProps> = ({ industrySlug, onNavigate }) => {
  const [roleSearch, setRoleSearch] = useState('');
  const [visibleRoleCount, setVisibleRoleCount] = useState(24);

  const industry = INDUSTRIES.find(i => i.slug === industrySlug) || INDUSTRIES[0];
  const departments = DEPARTMENTS.filter(d => d.industry_id === industry.id);
  const allIndustryRoles = JOB_ROLES.filter(r => r.industry_id === industry.id);
  const relatedArticles = getRelatedBlogArticles(industry.id);

  useEffect(() => {
    if (industry) {
      updateDocumentSEO({
        title: `${industry.name} Careers: Departments, Job Roles & Guides | Candidate Portal`,
        description: `Explore career opportunities in ${industry.name}. Browse ${departments.length} departments, ${allIndustryRoles.length} specialized job roles, required skills, and find qualified candidates.`,
        canonical: `/industry/${industry.slug}`,
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
              name: `${industry.name} Careers`,
              item: `${window.location.origin}/industry/${industry.slug}`
            }
          ]
        }
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [industry, departments.length, allIndustryRoles.length]);

  const filteredRoles = allIndustryRoles.filter(r => {
    if (!roleSearch.trim()) return true;
    return r.name.toLowerCase().includes(roleSearch.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Hero Header */}
      <section className="bg-slate-900 text-white border-b border-slate-800 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-xs text-slate-400 mb-6 font-medium">
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
            <span className="text-slate-200">{industry.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <div className="lg:col-span-2">
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
                <Building2 className="w-3.5 h-3.5" />
                <span>Industry Career Overview</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {industry.name} Careers
              </h1>

              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                {industry.description || `Explore comprehensive career opportunities, departmental pathways, essential technical skills, and candidate talent across the ${industry.name} sector worldwide.`}
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigate('find-candidates', undefined, { industryId: industry.id })}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-3 rounded-xl transition shadow-xs flex items-center space-x-2 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Find {industry.name} Candidates</span>
                </button>

                <button
                  onClick={() => onNavigate('login')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-5 py-3 rounded-xl transition flex items-center space-x-2 cursor-pointer"
                >
                  <span>Register as a Candidate in this Field</span>
                </button>
              </div>
            </div>

            {/* Quick Industry Stats Card */}
            <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Industry Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                  <div className="text-2xl font-extrabold text-white">{departments.length}</div>
                  <div className="text-xs text-slate-400 mt-0.5">Departments</div>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                  <div className="text-2xl font-extrabold text-blue-400">{allIndustryRoles.length}</div>
                  <div className="text-xs text-slate-400 mt-0.5">Job Roles</div>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-700">
                All roles follow standardized international classifications for transparent employer hiring and candidate discovery.
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Left Col: Departments & Roles */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Section: Departments */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Browse Departments in {industry.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Select a specialized field to view specialized roles, skills, and career progressions.
                  </p>
                </div>
                <Layers className="w-5 h-5 text-blue-600 hidden sm:block" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {departments.map((dept) => {
                  const deptRoleCount = JOB_ROLES.filter(r => r.department_id === dept.id).length;
                  return (
                    <div
                      key={dept.id}
                      onClick={() => onNavigate('department-detail', `${industry.slug}/${dept.slug}`)}
                      className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition group cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                          {dept.name}
                        </h3>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {deptRoleCount} Professional Roles
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Section: All Job Roles in Industry */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Standardized Job Roles ({filteredRoles.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Click any role to view its dedicated career guide, skills, and roadmap.
                  </p>
                </div>

                <div className="relative min-w-[220px]">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredRoles.slice(0, visibleRoleCount).map((role) => (
                    <button
                      key={role.id}
                      onClick={() => onNavigate('career-detail', role.slug)}
                      className="text-left p-3 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-slate-50 transition text-xs font-semibold text-slate-800 hover:text-blue-600 flex items-center justify-between group cursor-pointer"
                    >
                      <span className="truncate mr-2">{role.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {filteredRoles.length > visibleRoleCount && (
                <div className="mt-6 text-center pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setVisibleRoleCount(prev => prev + 24)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    View More Roles ({filteredRoles.length - visibleRoleCount} remaining)
                  </button>
                </div>
              )}
            </section>

          </div>

          {/* Sidebar Right Col: Related Articles & Actions */}
          <div className="space-y-6">
            
            {/* Find Candidates CTA Box */}
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-blue-800/50">
              <h3 className="text-base font-bold text-white mb-2">Hiring in {industry.name}?</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Access verified candidate profiles with skills, experience, and direct contact unlocking capabilities.
              </p>
              <button
                onClick={() => onNavigate('find-candidates', undefined, { industryId: industry.id })}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Search {industry.name} Talent</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Related Career Guides / Articles */}
            {relatedArticles.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Related Career Resources</span>
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

            {/* Other Major Industries */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Other Major Industries</h3>
              <div className="space-y-2 text-xs">
                {INDUSTRIES.filter(i => i.id !== industry.id).slice(0, 6).map((otherInd) => (
                  <button
                    key={otherInd.id}
                    onClick={() => onNavigate('industry-detail', otherInd.slug)}
                    className="w-full text-left py-1.5 text-slate-600 hover:text-blue-600 hover:underline flex items-center justify-between cursor-pointer"
                  >
                    <span className="truncate">{otherInd.name}</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
              <button
                onClick={() => onNavigate('industries')}
                className="mt-4 w-full text-center text-xs font-bold text-blue-600 hover:underline pt-3 border-t border-slate-100 block"
              >
                View All 35+ Industries →
              </button>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
