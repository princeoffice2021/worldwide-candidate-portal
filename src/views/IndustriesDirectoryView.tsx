import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  ArrowRight, 
  Briefcase, 
  Layers, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  Users,
  Compass
} from 'lucide-react';
import { INDUSTRIES, DEPARTMENTS } from '../data/categoriesData';
import { JOB_ROLES } from '../data/jobRolesList';
import { updateDocumentSEO } from '../lib/seo';

interface IndustriesDirectoryViewProps {
  onNavigate: (view: string, slug?: string, filters?: any) => void;
}

export const IndustriesDirectoryView: React.FC<IndustriesDirectoryViewProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    updateDocumentSEO({
      title: 'Explore 35+ Industries & 1,000+ Career Paths | Candidate Portal',
      description: 'Browse careers across 35 major worldwide industries, 120+ specialized departments, and 1,000+ job roles. Find career guides, required skills, and hiring insights.',
      canonical: '/industries',
      noIndex: false,
      schemaJson: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Worldwide Industry Career Directory',
        description: 'Explore all 35+ industries and career paths on Candidate Portal.',
        url: window.location.href
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Filter industries
  const filteredIndustries = INDUSTRIES.filter(ind => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      ind.name.toLowerCase().includes(query) ||
      ind.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Hero / Header Section */}
      <section className="bg-slate-900 text-white border-b border-slate-800 pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-xs text-slate-400 mb-6 font-medium">
            <button 
              onClick={() => onNavigate('landing')} 
              className="hover:text-blue-400 transition cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-200">Industries Directory</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Compass className="w-3.5 h-3.5" />
              <span>Worldwide Career Directory</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Explore 35+ Major Industries & Career Paths
            </h1>
            
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              Discover verified career information, required competencies, department structures, and candidate talent across 1,000+ standardized global professions.
            </p>
          </div>

          {/* Search Input Bar */}
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search industries (e.g., Healthcare, Software, Construction, Hospitality)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-3.5 text-xs text-slate-400 hover:text-white bg-slate-700 px-2 py-1 rounded"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Aggregate Stats */}
          <div className="mt-6 flex flex-wrap gap-4 sm:gap-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span><strong className="text-white">35</strong> Major Industries</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-blue-400" />
              <span><strong className="text-white">120+</strong> Specialized Departments</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span><strong className="text-white">1,050+</strong> Standardized Job Roles</span>
            </div>
          </div>

        </div>
      </section>

      {/* Directory Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span>All Industry Sectors</span>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
              {filteredIndustries.length}
            </span>
          </h2>

          <button
            onClick={() => onNavigate('find-candidates')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center space-x-1"
          >
            <span>Search all candidate profiles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {filteredIndustries.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-sm text-slate-500">No industries match your search criteria &quot;{searchQuery}&quot;.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-xs font-bold text-blue-600 hover:underline"
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIndustries.map((ind) => {
              const deptCount = DEPARTMENTS.filter(d => d.industry_id === ind.id).length;
              const roleCount = JOB_ROLES.filter(r => r.industry_id === ind.id).length;

              return (
                <div
                  key={ind.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
                  onClick={() => onNavigate('industry-detail', ind.slug)}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {roleCount} Roles
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-4 group-hover:text-blue-600 transition">
                      {ind.name}
                    </h3>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                      {ind.description || `Explore standardized career guides, skills, departments, and candidate profiles in ${ind.name}.`}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      {deptCount} Departments
                    </span>
                    <span className="font-bold text-blue-600 group-hover:translate-x-1 transition flex items-center space-x-1">
                      <span>Explore Careers</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

    </div>
  );
};
