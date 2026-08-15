import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Building2, 
  Layers, 
  Briefcase, 
  ChevronRight, 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { INDUSTRIES, DEPARTMENTS } from '../data/categoriesData';
import { JOB_ROLES } from '../data/jobRolesList';
import { careerGuidesStore } from '../data/careerGuidesData';
import { blogArticlesStore } from '../data/blogData';
import { updateDocumentSEO } from '../lib/seo';

interface SitemapViewProps {
  onNavigate: (view: string, slug?: string) => void;
}

export const SitemapView: React.FC<SitemapViewProps> = ({ onNavigate }) => {
  const [activeFormat, setActiveFormat] = useState<'visual' | 'xml'>('visual');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    updateDocumentSEO({
      title: 'HTML & XML Sitemap | Candidate Portal',
      description: 'Comprehensive directory of all published career guides, industry sectors, departments, and platform resources.',
      canonical: '/sitemap',
      noIndex: false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const allGuides = careerGuidesStore.getAll();
  const publishedGuides = allGuides.filter(g => g.content_status === 'published');
  const publishedArticles = blogArticlesStore.getPublished();

  // Generate valid XML sitemap string
  const generateXmlSitemap = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://candidateportal.com';
    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Core static URLs
    const corePages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/industries', priority: '0.9', changefreq: 'daily' },
      { loc: '/find-candidates', priority: '0.9', changefreq: 'daily' },
      { loc: '/career-resources', priority: '0.8', changefreq: 'weekly' },
      { loc: '/pricing', priority: '0.7', changefreq: 'weekly' },
      { loc: '/about', priority: '0.6', changefreq: 'monthly' },
      { loc: '/terms', priority: '0.5', changefreq: 'yearly' },
      { loc: '/privacy', priority: '0.5', changefreq: 'yearly' }
    ];

    corePages.forEach(p => {
      xml += `  <url>\n    <loc>${origin}${p.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
    });

    // 35+ Industries
    INDUSTRIES.forEach(ind => {
      xml += `  <url>\n    <loc>${origin}/industry/${ind.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // 120+ Departments
    DEPARTMENTS.forEach(dept => {
      const ind = INDUSTRIES.find(i => i.id === dept.industry_id);
      if (ind) {
        xml += `  <url>\n    <loc>${origin}/industry/${ind.slug}/${dept.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      }
    });

    // Published Career Guides only (Strict indexing policy)
    publishedGuides.forEach(guide => {
      xml += `  <url>\n    <loc>${origin}/careers/${guide.slug}</loc>\n    <lastmod>${guide.last_updated || today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Published Blog articles only
    publishedArticles.forEach(art => {
      xml += `  <url>\n    <loc>${origin}/career-resources/${art.slug}</loc>\n    <lastmod>${(art.updated_at || art.published_at).split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;
    return xml;
  };

  const xmlContent = generateXmlSitemap();

  const handleCopyXml = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadXml = () => {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Header */}
      <section className="bg-slate-900 text-white border-b border-slate-800 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <nav className="flex items-center space-x-2 text-xs text-slate-400 mb-6 font-medium">
            <button onClick={() => onNavigate('landing')} className="hover:text-blue-400 transition cursor-pointer">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-200">Sitemap</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
                <Compass className="w-3.5 h-3.5" />
                <span>Search Engine & Content Index</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Candidate Portal Sitemap
              </h1>
              <p className="mt-2 text-slate-300 text-xs sm:text-sm">
                Explore the complete index of 35+ industries, 120+ departments, standardized career paths, and candidate resources.
              </p>
            </div>

            {/* Toggle format */}
            <div className="flex items-center space-x-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
              <button
                onClick={() => setActiveFormat('visual')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeFormat === 'visual' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Visual Directory
              </button>
              <button
                onClick={() => setActiveFormat('xml')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                  activeFormat === 'xml' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>XML Format</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {activeFormat === 'xml' ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-300">
                Generated XML Sitemap ({publishedGuides.length} published guides indexed)
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyXml}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center space-x-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy XML'}</span>
                </button>
                <button
                  onClick={handleDownloadXml}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download sitemap.xml</span>
                </button>
              </div>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[600px] leading-relaxed border border-slate-800">
              {xmlContent}
            </pre>
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* Core Portals */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Core Portal Pages</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { label: 'Home Page', view: 'landing' },
                  { label: 'Industries Directory', view: 'industries' },
                  { label: 'Candidate Search', view: 'find-candidates' },
                  { label: 'Career Resources', view: 'career-resources' },
                  { label: 'Employer Subscriptions', view: 'pricing' },
                  { label: 'About Us', view: 'about' },
                  { label: 'Terms of Use', view: 'terms' },
                  { label: 'Privacy Policy', view: 'privacy' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigate(item.view)}
                    className="text-left p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition text-slate-700 hover:text-blue-600 font-semibold cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Published Career Resources / Articles */}
            {publishedArticles.length > 0 && (
              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>Published Career Resources & Articles ({publishedArticles.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {publishedArticles.map((art) => (
                    <button
                      key={art.id}
                      onClick={() => onNavigate('article-detail', art.slug)}
                      className="text-left p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition text-slate-800 hover:text-blue-600 font-semibold flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate mr-2">{art.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Published Career Guides */}
            {publishedGuides.length > 0 && (
              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>Curated & Published Career Guides ({publishedGuides.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {publishedGuides.map((guide) => (
                    <button
                      key={guide.id}
                      onClick={() => onNavigate('career-detail', guide.slug)}
                      className="text-left p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition text-slate-800 hover:text-blue-600 font-semibold flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate mr-2">{guide.job_role_name}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* 35+ Industries & Departments Hierarchy */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Industry & Department Index (35 Industries)</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {INDUSTRIES.map((ind) => {
                  const depts = DEPARTMENTS.filter(d => d.industry_id === ind.id);
                  return (
                    <div key={ind.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                      <button
                        onClick={() => onNavigate('industry-detail', ind.slug)}
                        className="text-sm font-bold text-slate-900 hover:text-blue-600 hover:underline flex items-center justify-between w-full cursor-pointer"
                      >
                        <span>{ind.name}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>

                      <div className="mt-3 pl-3 border-l-2 border-slate-200 space-y-1.5">
                        {depts.map((d) => (
                          <button
                            key={d.id}
                            onClick={() => onNavigate('department-detail', `${ind.slug}/${d.slug}`)}
                            className="text-left text-xs text-slate-600 hover:text-blue-600 hover:underline block py-0.5"
                          >
                            • {d.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

          </div>
        )}

      </div>

    </div>
  );
};
