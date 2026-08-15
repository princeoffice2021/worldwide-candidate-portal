import React, { useMemo, useEffect } from 'react';
import { blogArticlesStore } from '../data/blogData';
import { BlogArticle } from '../types/blog';
import { INDUSTRIES, DEPARTMENTS, getRolesByDepartmentId } from '../data/categoriesData';
import { JOB_ROLES } from '../data/jobRolesList';
import { CategoryFilterParams } from '../App';
import { updateDocumentSEO } from '../lib/seo';
import { ArrowLeft, BookOpen, Briefcase, Calendar, CheckCircle2, ChevronRight, Clock, HelpCircle, Layers, Search, ShieldCheck, User, Users, Zap, Building2, UserPlus, Tag } from 'lucide-react';

interface ArticleDetailViewProps {
  slug: string;
  onNavigate: (view: string, slug?: string, filters?: CategoryFilterParams) => void;
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({ slug, onNavigate }) => {
  const [article, setArticle] = React.useState<BlogArticle | undefined>(() => 
    blogArticlesStore.getBySlug(slug) || blogArticlesStore.getPublished()[0]
  );

  useEffect(() => {
    const found = blogArticlesStore.getBySlug(slug) || blogArticlesStore.getPublished()[0];
    setArticle(found);

    const unsubscribe = blogArticlesStore.subscribe(() => {
      const updated = blogArticlesStore.getBySlug(slug) || blogArticlesStore.getPublished()[0];
      setArticle(updated);
    });

    return unsubscribe;
  }, [slug]);

  const industryObj = useMemo(() => {
    if (!article?.industry_id) return null;
    return INDUSTRIES.find((i) => i.id === article.industry_id);
  }, [article?.industry_id]);

  const departmentObj = useMemo(() => {
    if (!article?.department_id) return null;
    return DEPARTMENTS.find((d) => d.id === article.department_id);
  }, [article?.department_id]);

  const jobRoleObj = useMemo(() => {
    if (!article?.job_role_id) return null;
    return JOB_ROLES.find((r) => r.id === article.job_role_id);
  }, [article?.job_role_id]);

  // Set document meta title and structured JSON-LD for SEO
  useEffect(() => {
    if (article) {
      const isPublished = article.status === 'published';
      const canonicalPath = article.canonical_url || `/career-resources/${article.slug}`;

      // Build schema objects
      const schemas: any[] = [];

      if (isPublished) {
        // Article Schema
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: article.excerpt,
          image: article.featured_image,
          datePublished: article.published_at,
          dateModified: article.updated_at || article.published_at,
          author: {
            '@type': 'Person',
            name: article.author_name,
            jobTitle: article.author_role
          },
          publisher: {
            '@type': 'Organization',
            name: 'Candidate Portal',
            url: 'https://candidateportal.com'
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://candidateportal.com${canonicalPath}`
          }
        });

        // Breadcrumbs Schema
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://candidateportal.com'
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Career Resources',
              item: 'https://candidateportal.com/career-resources'
            },
            ...(industryObj ? [{
              '@type': 'ListItem',
              position: 3,
              name: industryObj.name,
              item: `https://candidateportal.com/industry/${industryObj.slug}`
            }] : []),
            {
              '@type': 'ListItem',
              position: industryObj ? 4 : 3,
              name: article.title,
              item: `https://candidateportal.com${canonicalPath}`
            }
          ]
        });

        // FAQPage Schema if interview questions are present
        if (article.interview_questions && article.interview_questions.length > 0) {
          schemas.push({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: article.interview_questions.map(q => ({
              '@type': 'Question',
              name: q.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: q.tip
              }
            }))
          });
        }
      }

      updateDocumentSEO({
        title: article.meta_title || `${article.title} | Candidate Portal`,
        description: article.meta_description || article.excerpt || `Comprehensive career guide and skill requirements for ${article.title}.`,
        canonical: canonicalPath,
        noIndex: !isPublished,
        schemaJson: isPublished ? schemas : undefined
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [article, industryObj]);

  const relatedArticles = useMemo(() => {
    if (!article) return [];
    return blogArticlesStore.getRelated(article.industry_id, article.department_id, article.job_role_id, article.id, 3);
  }, [article]);

  const relatedRolesInDept = useMemo(() => {
    if (!article?.department_id) return [];
    return getRolesByDepartmentId(article.department_id).slice(0, 8);
  }, [article?.department_id]);

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 max-w-md">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Article Not Found</h2>
          <p className="text-xs text-slate-500">The requested career guide does not exist or was removed.</p>
          <button
            type="button"
            onClick={() => onNavigate('career-resources')}
            className="bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-700 transition cursor-pointer"
          >
            Return to Career Resources
          </button>
        </div>
      </div>
    );
  }

  const isDraftOrReview = article.status === 'draft' || article.status === 'in_review';

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Editorial Notice Banner for Drafts / In-Review */}
        {isDraftOrReview && (
          <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500 text-slate-900 font-extrabold uppercase px-2 py-0.5 rounded-md text-[10px] tracking-wider">
                {article.status.toUpperCase()}
              </span>
              <span className="font-semibold">
                This article is in <strong>{article.status}</strong> mode. It is marked as <code>noindex</code> and hidden from public catalogs.
              </span>
            </div>
            <button
              onClick={() => onNavigate('admin-dashboard')}
              className="font-bold underline hover:text-amber-700 text-amber-800"
            >
              Open in Admin CMS
            </button>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <nav className="flex flex-wrap items-center space-x-2 text-xs font-medium text-slate-500">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="hover:text-blue-600 transition"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <button
            type="button"
            onClick={() => onNavigate('career-resources')}
            className="hover:text-blue-600 transition"
          >
            Career Resources
          </button>
          {industryObj && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <button
                type="button"
                onClick={() => onNavigate('industry-detail', industryObj.slug)}
                className="hover:text-blue-600 transition text-slate-700 font-semibold cursor-pointer"
              >
                {industryObj.name}
              </button>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-blue-600 font-bold truncate max-w-[200px] sm:max-w-xs">
            {article.title}
          </span>
        </nav>

        {/* Article Header & Title */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold px-3 py-1 rounded-lg"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
            {article.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal border-l-4 border-blue-600 pl-4 py-0.5">
            {article.excerpt}
          </p>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm border border-blue-200">
                {article.author_name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">{article.author_name}</div>
                <div className="text-[11px] text-slate-500">{article.author_role}</div>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-slate-500 font-medium">
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Published {article.published_at}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{article.read_time}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Featured Image Banner */}
        <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-xs max-h-96 bg-slate-100">
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Key Takeaways Box */}
        {article.key_takeaways && article.key_takeaways.length > 0 && (
          <div className="bg-blue-50/80 border border-blue-200 rounded-3xl p-6 space-y-3">
            <div className="flex items-center space-x-2 text-blue-900 font-extrabold text-sm uppercase tracking-wider">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Key Career Takeaways</span>
            </div>
            <ul className="space-y-2">
              {article.key_takeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Core Responsibilities & Required Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {article.responsibilities && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Core Responsibilities</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 font-medium">
                {article.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {article.required_skills && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>In-Demand Technical Skills</span>
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {article.required_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              {article.salary_range && (
                <div className="pt-3 border-t border-slate-100 text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="text-slate-500">Estimated Global Salary:</span>
                  <span className="text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                    {article.salary_range}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Article Content Body */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs prose prose-slate max-w-none space-y-4 text-slate-800 text-sm leading-relaxed">
          {article.content.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={idx} className="text-lg font-extrabold text-slate-900 pt-4 border-t border-slate-100">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('#### ')) {
              return (
                <h4 key={idx} className="text-base font-bold text-slate-900 pt-2">
                  {paragraph.replace('#### ', '')}
                </h4>
              );
            }
            return (
              <p key={idx} className="text-slate-700 leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Common Interview Questions Section */}
        {article.interview_questions && article.interview_questions.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <span>Common Employer Interview Questions</span>
            </h3>

            <div className="space-y-4">
              {article.interview_questions.map((iq, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">
                    Q{idx + 1}: {iq.question}
                  </div>
                  <div className="text-xs text-blue-900 bg-blue-50 p-3 rounded-xl border border-blue-200 leading-relaxed">
                    <span className="font-bold">Preparation Tip: </span>
                    {iq.tip}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contextual Calls to Action */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-lg space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Connect on Candidate Portal</span>
            </div>
            <h3 className="text-xl font-extrabold text-white">
              Are you looking for {jobRoleObj?.name || 'professionals in this sector'}?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Candidate Portal connects skilled workers with verified employers worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-3">
              <div className="text-xs font-bold text-blue-300 uppercase tracking-wider">For Job Seekers</div>
              <p className="text-xs text-slate-300">
                Publish your verified profile and get discovered by employers hiring for {jobRoleObj?.name || 'this role'}.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer shadow-xs"
              >
                Create Candidate Profile &rarr;
              </button>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-3">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">For Employers</div>
              <p className="text-xs text-slate-300">
                Search verified candidate profiles for {jobRoleObj?.name || 'this profession'} across global locations.
              </p>
              <button
                type="button"
                onClick={() =>
                  onNavigate('find-candidates', undefined, {
                    industryId: article.industry_id,
                    departmentId: article.department_id,
                    roleId: article.job_role_id,
                  })
                }
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer shadow-xs"
              >
                Find Candidates in {jobRoleObj?.name || 'this Sector'} &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Related Job Roles in Department */}
        {relatedRolesInDept.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Related Job Roles in {departmentObj?.name || 'this Department'}</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {relatedRolesInDept.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() =>
                    onNavigate('find-candidates', undefined, {
                      industryId: article.industry_id,
                      departmentId: article.department_id,
                      roleId: role.id,
                    })
                  }
                  className="bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-800 hover:text-blue-900 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                >
                  {role.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900">Related Career Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onNavigate('article-detail', rel.slug)}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 p-4 transition space-y-2 cursor-pointer group"
                >
                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{rel.read_time}</div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2">
                    {rel.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {rel.excerpt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={() => onNavigate('career-resources')}
            className="inline-flex items-center space-x-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Career Resources</span>
          </button>
        </div>

      </div>
    </div>
  );
};
