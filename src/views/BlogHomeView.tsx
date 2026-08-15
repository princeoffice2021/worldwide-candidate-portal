import React, { useState, useMemo, useEffect } from 'react';
import { blogArticlesStore } from '../data/blogData';
import { BlogArticle, BlogTopic } from '../types/blog';
import { INDUSTRIES } from '../data/categoriesData';
import { CategoryFilterParams } from '../App';
import { updateDocumentSEO } from '../lib/seo';
import { Search, BookOpen, ChevronRight, Clock, User, Tag, Compass, Zap, MessageSquare, TrendingUp, Globe, ArrowRight, Building2, Briefcase, Filter } from 'lucide-react';

interface BlogHomeViewProps {
  onNavigate: (view: string, slug?: string, filters?: CategoryFilterParams) => void;
}

export const BlogHomeView: React.FC<BlogHomeViewProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [publishedArticles, setPublishedArticles] = useState<BlogArticle[]>(() => blogArticlesStore.getPublished());
  const [topics, setTopics] = useState<BlogTopic[]>(() => blogArticlesStore.getTopics());

  useEffect(() => {
    // Initial sync
    setPublishedArticles(blogArticlesStore.getPublished());
    setTopics(blogArticlesStore.getTopics());

    // Subscribe to centralized updates
    const unsubscribe = blogArticlesStore.subscribe(() => {
      setPublishedArticles(blogArticlesStore.getPublished());
      setTopics(blogArticlesStore.getTopics());
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    updateDocumentSEO({
      title: 'Career Resources & Industry Guides | Candidate Portal',
      description: 'Expert career guides, required job skills, salary benchmarks, and interview preparation for professionals worldwide across 35+ industries.',
      canonical: '/career-resources',
      noIndex: false,
      schemaJson: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Career Resources & Industry Guides',
          description: 'Expert career guides, required job skills, salary benchmarks, and interview preparation for global professionals.',
          url: 'https://candidateportal.com/career-resources'
        },
        {
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
            }
          ]
        }
      ]
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const featuredArticles = useMemo(() => {
    return publishedArticles.filter((a) => a.is_featured);
  }, [publishedArticles]);

  const filteredArticles = useMemo(() => {
    return publishedArticles.filter((article) => {
      // Keyword search
      const matchesSearch =
        !searchQuery.trim() ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      // Topic filter
      const matchesTopic =
        selectedTopic === 'all' ||
        article.tags.some((t) => t.toLowerCase().includes(selectedTopic.replace('-', ' ')));

      // Industry filter
      const matchesIndustry =
        selectedIndustry === 'all' || article.industry_id === selectedIndustry;

      return matchesSearch && matchesTopic && matchesIndustry;
    });
  }, [publishedArticles, searchQuery, selectedTopic, selectedIndustry]);

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Hero Banner Section */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-3.5 py-1.5 rounded-full text-xs font-bold border border-blue-400/30">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Career Resources & Profession Insights</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Master Your Profession. <span className="text-blue-400">Build Your Global Career.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Practical career guides, key skill requirements, interview preparation, salary insights, and workplace advice for professionals across 35+ industries worldwide.
            </p>

            {/* Search Input Bar */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="pt-2 flex flex-col sm:flex-row gap-2 max-w-2xl"
            >
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, roles (e.g., nurse, developer, electrician, interview)..."
                  className="w-full bg-slate-800/90 text-white placeholder-slate-400 pl-11 pr-4 py-3 rounded-xl border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Quick Topic Filters */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Filter by Career Topic</span>
            </h2>
            {(selectedTopic !== 'all' || selectedIndustry !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedTopic('all');
                  setSelectedIndustry('all');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedTopic('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedTopic === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Topics
            </button>
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => setSelectedTopic(topic.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  selectedTopic === topic.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{topic.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Articles Section */}
        {featuredArticles.length > 0 && !searchQuery && selectedTopic === 'all' && selectedIndustry === 'all' && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>Featured Career Guides</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => onNavigate('article-detail', article.slug)}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition overflow-hidden group cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative h-48 sm:h-56 overflow-hidden bg-slate-100">
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-md shadow-xs">
                      Featured Guide
                    </div>
                  </div>

                  <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium">
                        <span className="flex items-center space-x-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{article.author_name}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{article.read_time}</span>
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-1 transition">
                      <span>Read Full Guide</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Browse Career Guides by Industry Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Browse Resources by Industry Sector</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              35+ Sectors Covered
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {INDUSTRIES.slice(0, 12).map((ind) => {
              const articleCount = publishedArticles.filter((a) => a.industry_id === ind.id).length;
              return (
                <button
                  key={ind.id}
                  type="button"
                  onClick={() => {
                    setSelectedIndustry(selectedIndustry === ind.id ? 'all' : ind.id);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 cursor-pointer ${
                    selectedIndustry === ind.id
                      ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="text-xs font-extrabold tracking-tight truncate">
                    {ind.name}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500">
                    {articleCount > 0 ? `${articleCount} Article${articleCount > 1 ? 's' : ''}` : 'Guides Available'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Articles List Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {selectedIndustry !== 'all'
                ? `Articles in ${INDUSTRIES.find((i) => i.id === selectedIndustry)?.name}`
                : 'All Career & Profession Guides'}
            </h2>
            <span className="text-xs font-bold text-slate-500">
              Showing {filteredArticles.length} Article{filteredArticles.length === 1 ? '' : 's'}
            </span>
          </div>

          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => onNavigate('article-detail', article.slug)}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition overflow-hidden group cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                    />
                    <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                      {article.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
                        <span>{article.author_name}</span>
                        <span>•</span>
                        <span>{article.read_time}</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                      <span>Read Article</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-2xl mx-auto">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                No matching career guides found
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                We couldn't find any articles matching your search query or selected category. You can clear your search to view all published career guides.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTopic('all');
                  setSelectedIndustry('all');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
              >
                Clear Search & Show All Articles
              </button>
            </div>
          )}
        </div>

        {/* Call to Action for Candidates and Employers */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Ready to Advance Your Global Career?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Create your verified candidate profile on Candidate Portal to get discovered by employers hiring skilled workers worldwide.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition text-center shadow-xs cursor-pointer"
            >
              Create Candidate Profile
            </button>
            <button
              type="button"
              onClick={() => onNavigate('find-candidates')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-6 py-3 rounded-xl transition text-center border border-white/20 cursor-pointer"
            >
              Find Skilled Candidates
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
