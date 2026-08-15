import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Save, 
  Send, 
  ArrowLeft, 
  Sparkles, 
  Zap, 
  ExternalLink,
  Layers,
  Building2,
  Briefcase,
  User,
  Calendar,
  Tag,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { BlogArticle, ArticleStatus, BlogTopic } from '../../types/blog';
import { blogArticlesStore } from '../../data/blogData';
import { INDUSTRIES, DEPARTMENTS } from '../../data/categoriesData';
import { JOB_ROLES } from '../../data/jobRolesList';
import { getCurrentAdmin } from '../../lib/adminAuth';

interface AdminArticlesManagementProps {
  onNavigate: (view: string, slug?: string) => void;
}

export const AdminArticlesManagement: React.FC<AdminArticlesManagementProps> = ({ onNavigate }) => {
  const [articles, setArticles] = useState<BlogArticle[]>(() => blogArticlesStore.getAll());
  const [activeView, setActiveView] = useState<'list' | 'editor'>('list');
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');

  // Preview & Notification State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Editor temp states for arrays
  const [tempTag, setTempTag] = useState('');
  const [tempTakeaway, setTempTakeaway] = useState('');
  const [tempSkill, setTempSkill] = useState('');
  const [tempResp, setTempResp] = useState('');
  const [tempIQQuestion, setTempIQQuestion] = useState('');
  const [tempIQTip, setTempIQTip] = useState('');

  const admin = getCurrentAdmin();

  const refreshArticles = () => {
    setArticles(blogArticlesStore.getAll());
  };

  useEffect(() => {
    refreshArticles();
    const unsubscribe = blogArticlesStore.subscribe(refreshArticles);
    return unsubscribe;
  }, []);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotificationMsg({ text, type });
    setTimeout(() => {
      setNotificationMsg(null);
    }, 4000);
  };

  // Filtered list of articles
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      if (statusFilter !== 'all' && art.status !== statusFilter) return false;
      if (industryFilter !== 'all' && art.industry_id !== industryFilter) return false;
      if (topicFilter !== 'all' && !art.tags?.some(t => t.toLowerCase().includes(topicFilter.replace('-', ' ')))) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = art.title.toLowerCase().includes(q);
        const matchesSlug = art.slug.toLowerCase().includes(q);
        const matchesAuthor = art.author_name?.toLowerCase().includes(q);
        const matchesExcerpt = art.excerpt?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSlug && !matchesAuthor && !matchesExcerpt) return false;
      }

      return true;
    });
  }, [articles, statusFilter, industryFilter, topicFilter, searchQuery]);

  const handleCreateNew = () => {
    const newArt: BlogArticle = {
      id: `art-${Date.now()}`,
      slug: '',
      title: '',
      excerpt: '',
      content: '### Introduction\n\nProvide an engaging overview of this profession, key industry trends, and global career opportunities.\n\n### Career Progression & Requirements\n\nDetail the standard entry qualifications, daily responsibilities, and long-term trajectory.',
      featured_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      author_name: admin?.name || 'Editorial Team',
      author_role: 'Senior Career Strategist',
      published_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
      read_time: '5 min read',
      tags: ['Career Guide', 'Skills'],
      status: 'draft',
      is_featured: false,
      key_takeaways: [
        'High global demand across technology and industrial sectors',
        'Strong emphasis on continuous certification and practical problem-solving',
        'Clear career trajectory from junior to team leadership'
      ],
      responsibilities: [
        'Analyze project specifications and technical requirements',
        'Collaborate with cross-functional teams to execute core deliverables',
        'Ensure quality standards, safety protocols, and regulatory compliance'
      ],
      required_skills: ['Analytical Thinking', 'Communication', 'Technical Proficiency'],
      interview_questions: [
        {
          question: 'How do you prioritize competing deadlines in a fast-paced environment?',
          tip: 'Highlight structured workflow management frameworks (e.g. Agile/Kanban) and clear stakeholder communication.'
        }
      ],
      salary_range: '$65,000 - $110,000 / year',
      meta_title: '',
      meta_description: ''
    };

    setSelectedArticle(newArt);
    setActiveView('editor');
  };

  const handleEditArticle = (art: BlogArticle) => {
    setSelectedArticle(JSON.parse(JSON.stringify(art)));
    setActiveView('editor');
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the article "${title}"? This cannot be undone.`)) {
      try {
        const res = await blogArticlesStore.deleteAsync(id);
        if (res.success) {
          refreshArticles();
          showNotification(`Article "${title}" deleted successfully.`);
          if (selectedArticle?.id === id) {
            setActiveView('list');
            setSelectedArticle(null);
          }
        } else {
          showNotification(res.error || 'Failed to delete article.', 'error');
        }
      } catch {
        blogArticlesStore.delete(id);
        refreshArticles();
        showNotification(`Article "${title}" deleted.`);
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: ArticleStatus) => {
    try {
      const res = await blogArticlesStore.updateStatusAsync(id, newStatus);
      if (res.success) {
        refreshArticles();
        showNotification(`Status updated to "${newStatus}".`);
      } else {
        showNotification(res.error || 'Failed to update status.', 'error');
      }
    } catch {
      const art = blogArticlesStore.getById(id);
      if (art) {
        art.status = newStatus;
        blogArticlesStore.save(art);
        refreshArticles();
        showNotification(`Status updated to "${newStatus}".`);
      }
    }
  };

  const handleSaveArticle = async (newStatus?: ArticleStatus) => {
    if (!selectedArticle) return;

    if (!selectedArticle.title.trim()) {
      showNotification('Please enter an article title before saving.', 'error');
      return;
    }

    // Auto-generate slug if empty
    let slug = selectedArticle.slug.trim();
    if (!slug) {
      slug = selectedArticle.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const toSave: BlogArticle = {
      ...selectedArticle,
      slug,
      status: newStatus || selectedArticle.status,
      updated_at: new Date().toISOString().split('T')[0],
      meta_title: selectedArticle.meta_title?.trim() || `${selectedArticle.title} | Candidate Portal`,
      meta_description: selectedArticle.meta_description?.trim() || selectedArticle.excerpt
    };

    setIsSaving(true);
    try {
      const res = await blogArticlesStore.saveAsync(toSave);
      if (res.success && res.article) {
        setSelectedArticle(res.article);
        refreshArticles();
        showNotification(
          res.article.status === 'published'
            ? '✓ Article published live and stored in central database!'
            : '✓ Article saved successfully to central database.'
        );
      } else {
        // Fallback save
        blogArticlesStore.save(toSave);
        setSelectedArticle(toSave);
        refreshArticles();
        showNotification('✓ Article saved locally (will sync with database).');
      }
    } catch (err: any) {
      blogArticlesStore.save(toSave);
      setSelectedArticle(toSave);
      refreshArticles();
      showNotification('✓ Article saved.', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  // Sub-tab / field helpers for editor
  const handleAddTag = () => {
    if (!tempTag.trim() || !selectedArticle) return;
    if (!selectedArticle.tags.includes(tempTag.trim())) {
      setSelectedArticle({
        ...selectedArticle,
        tags: [...selectedArticle.tags, tempTag.trim()]
      });
    }
    setTempTag('');
  };

  const handleRemoveTag = (t: string) => {
    if (!selectedArticle) return;
    setSelectedArticle({
      ...selectedArticle,
      tags: selectedArticle.tags.filter(tag => tag !== t)
    });
  };

  const handleAddTakeaway = () => {
    if (!tempTakeaway.trim() || !selectedArticle) return;
    setSelectedArticle({
      ...selectedArticle,
      key_takeaways: [...(selectedArticle.key_takeaways || []), tempTakeaway.trim()]
    });
    setTempTakeaway('');
  };

  const handleRemoveTakeaway = (index: number) => {
    if (!selectedArticle || !selectedArticle.key_takeaways) return;
    const updated = [...selectedArticle.key_takeaways];
    updated.splice(index, 1);
    setSelectedArticle({ ...selectedArticle, key_takeaways: updated });
  };

  const handleAddSkill = () => {
    if (!tempSkill.trim() || !selectedArticle) return;
    setSelectedArticle({
      ...selectedArticle,
      required_skills: [...(selectedArticle.required_skills || []), tempSkill.trim()]
    });
    setTempSkill('');
  };

  const handleRemoveSkill = (index: number) => {
    if (!selectedArticle || !selectedArticle.required_skills) return;
    const updated = [...selectedArticle.required_skills];
    updated.splice(index, 1);
    setSelectedArticle({ ...selectedArticle, required_skills: updated });
  };

  const handleAddResp = () => {
    if (!tempResp.trim() || !selectedArticle) return;
    setSelectedArticle({
      ...selectedArticle,
      responsibilities: [...(selectedArticle.responsibilities || []), tempResp.trim()]
    });
    setTempResp('');
  };

  const handleRemoveResp = (index: number) => {
    if (!selectedArticle || !selectedArticle.responsibilities) return;
    const updated = [...selectedArticle.responsibilities];
    updated.splice(index, 1);
    setSelectedArticle({ ...selectedArticle, responsibilities: updated });
  };

  const handleAddInterviewQuestion = () => {
    if (!tempIQQuestion.trim() || !selectedArticle) return;
    setSelectedArticle({
      ...selectedArticle,
      interview_questions: [
        ...(selectedArticle.interview_questions || []),
        { question: tempIQQuestion.trim(), tip: tempIQTip.trim() || 'Provide concrete examples and metrics from previous roles.' }
      ]
    });
    setTempIQQuestion('');
    setTempIQTip('');
  };

  const handleRemoveInterviewQuestion = (index: number) => {
    if (!selectedArticle || !selectedArticle.interview_questions) return;
    const updated = [...selectedArticle.interview_questions];
    updated.splice(index, 1);
    setSelectedArticle({ ...selectedArticle, interview_questions: updated });
  };

  const topicsList = blogArticlesStore.getTopics();

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {notificationMsg && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between border shadow-lg transition animate-in fade-in ${
          notificationMsg.type === 'success' 
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
            : 'bg-red-500/20 text-red-300 border-red-500/40'
        }`}>
          <div className="flex items-center space-x-2">
            {notificationMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
            <span>{notificationMsg.text}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. LIST VIEW                                             */}
      {/* ======================================================== */}
      {activeView === 'list' && (
        <div className="space-y-6">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span>Career Resources & Articles Management</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Author, edit, review, and publish industry articles and career guidance pieces for the worldwide candidate portal.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => onNavigate('resources')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span>Live Resources View</span>
              </button>

              <button
                onClick={handleCreateNew}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Article</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
              <div className="text-[11px] font-semibold text-slate-400">Total Articles</div>
              <div className="text-xl font-extrabold text-white mt-0.5">{articles.length}</div>
            </div>
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <div className="text-[11px] font-semibold text-emerald-400">Published (Indexed)</div>
              <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
                {articles.filter(a => a.status === 'published').length}
              </div>
            </div>
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5">
              <div className="text-[11px] font-semibold text-amber-400">In Review</div>
              <div className="text-xl font-extrabold text-amber-400 mt-0.5">
                {articles.filter(a => a.status === 'in_review').length}
              </div>
            </div>
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
              <div className="text-[11px] font-semibold text-slate-400">Drafts</div>
              <div className="text-xl font-extrabold text-slate-300 mt-0.5">
                {articles.filter(a => a.status === 'draft').length}
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles by title, slug, author, tags..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="in_review">In Review</option>
                <option value="draft">Draft</option>
              </select>

              {/* Industry Filter */}
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
              >
                <option value="all">All Industries (35+)</option>
                {INDUSTRIES.map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>

              {/* Topic Filter */}
              <select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
              >
                <option value="all">All Topics</option>
                {topicsList.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Articles Table */}
          <div className="bg-slate-800/90 rounded-2xl border border-slate-700 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Article</th>
                    <th className="py-3 px-4">Industry / Field</th>
                    <th className="py-3 px-4">Author</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredArticles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No articles match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredArticles.map((art) => {
                      const industry = INDUSTRIES.find(i => i.id === art.industry_id);
                      return (
                        <tr key={art.id} className="hover:bg-slate-750 transition">
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-bold text-white leading-snug line-clamp-1">{art.title}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{art.excerpt}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {art.is_featured && (
                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                                  Featured
                                </span>
                              )}
                              {art.tags?.slice(0, 2).map((t, idx) => (
                                <span key={idx} className="bg-slate-700 text-slate-300 text-[9px] px-1.5 py-0.2 rounded">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {industry ? (
                              <span className="font-medium text-slate-200">{industry.name}</span>
                            ) : (
                              <span className="text-slate-500">General / Global</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            <div className="font-semibold text-slate-200">{art.author_name}</div>
                            <div className="text-[10px] text-slate-500">{art.read_time}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              art.status === 'published'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : art.status === 'in_review'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-700 text-slate-300 border border-slate-600'
                            }`}>
                              {art.status === 'published' ? 'Published' : art.status === 'in_review' ? 'In Review' : 'Draft'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                            {art.updated_at || art.published_at}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => handleEditArticle(art)}
                                className="p-1.5 rounded-lg bg-slate-700 hover:bg-blue-600 text-slate-200 hover:text-white transition cursor-pointer"
                                title="Edit Article"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => onNavigate('article-detail', art.slug)}
                                className="p-1.5 rounded-lg bg-slate-700 hover:bg-emerald-600 text-slate-200 hover:text-white transition cursor-pointer"
                                title="View Live Article"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteArticle(art.id, art.title)}
                                className="p-1.5 rounded-lg bg-slate-700 hover:bg-red-600 text-slate-200 hover:text-white transition cursor-pointer"
                                title="Delete Article"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 2. EDITOR VIEW                                           */}
      {/* ======================================================== */}
      {activeView === 'editor' && selectedArticle && (
        <div className="space-y-6">
          
          {/* Top action bar */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-16 z-30 shadow-lg">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveView('list')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">
                  {selectedArticle.title || 'New Untitled Article'}
                </h3>
                <span className="text-[11px] text-slate-400">
                  Slug: <code className="text-blue-400">/career-resources/{selectedArticle.slug || 'untitled-slug'}</code>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPreviewModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center space-x-1 cursor-pointer border border-slate-700"
              >
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>Live Preview</span>
              </button>

              <button
                disabled={isSaving}
                onClick={() => handleSaveArticle('draft')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-300" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Draft</span>
              </button>

              <button
                disabled={isSaving}
                onClick={() => handleSaveArticle('in_review')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Clock className="w-3.5 h-3.5" />}
                <span>Mark In Review</span>
              </button>

              <button
                disabled={isSaving}
                onClick={() => handleSaveArticle('published')}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Send className="w-3.5 h-3.5" />}
                <span>Publish Live</span>
              </button>
            </div>
          </div>

          {/* Main 2-column Editor form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col (2 cols): Main Content Fields */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Basic Details Box */}
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                  <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Article Title & Overview</span>
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    value={selectedArticle.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setSelectedArticle({
                        ...selectedArticle,
                        title: newTitle,
                        slug: selectedArticle.slug ? selectedArticle.slug : newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                      });
                    }}
                    placeholder="e.g., The Ultimate Guide to Global Software Engineering Careers"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    URL Slug (Canonical Path)
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500">/resources/</span>
                    <input
                      type="text"
                      value={selectedArticle.slug}
                      onChange={(e) => setSelectedArticle({ ...selectedArticle, slug: e.target.value })}
                      placeholder="software-engineer-career-pathway"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Short Excerpt / Lead Summary
                  </label>
                  <textarea
                    rows={2}
                    value={selectedArticle.excerpt}
                    onChange={(e) => setSelectedArticle({ ...selectedArticle, excerpt: e.target.value })}
                    placeholder="Concise overview summarizing the article for card previews and search results..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Main Content Body */}
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    <span>Main Content Body (Markdown / Headings supported)</span>
                  </h4>
                  <span className="text-[10px] text-slate-500">Use ### for section headings</span>
                </div>

                <textarea
                  rows={14}
                  value={selectedArticle.content}
                  onChange={(e) => setSelectedArticle({ ...selectedArticle, content: e.target.value })}
                  placeholder="### Introduction&#10;&#10;Write comprehensive article content..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              {/* Key Takeaways & Responsibilities */}
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Key Takeaways & Core Responsibilities</span>
                </h4>

                {/* Key Takeaways */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Key Career Takeaways (Bulleted Highlights)
                  </label>
                  <div className="space-y-2 mb-2">
                    {selectedArticle.key_takeaways?.map((takeaway, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-700 text-xs">
                        <span className="text-slate-200">{takeaway}</span>
                        <button
                          onClick={() => handleRemoveTakeaway(idx)}
                          className="text-slate-400 hover:text-red-400 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempTakeaway}
                      onChange={(e) => setTempTakeaway(e.target.value)}
                      placeholder="Add key takeaway..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTakeaway())}
                    />
                    <button
                      onClick={handleAddTakeaway}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Responsibilities */}
                <div className="pt-3 border-t border-slate-700/60">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Core Responsibilities List
                  </label>
                  <div className="space-y-2 mb-2">
                    {selectedArticle.responsibilities?.map((resp, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-700 text-xs">
                        <span className="text-slate-200">{resp}</span>
                        <button
                          onClick={() => handleRemoveResp(idx)}
                          className="text-slate-400 hover:text-red-400 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempResp}
                      onChange={(e) => setTempResp(e.target.value)}
                      placeholder="Add daily responsibility..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddResp())}
                    />
                    <button
                      onClick={handleAddResp}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

              </div>

              {/* Common Interview Questions */}
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Interview Questions & Candidate Preparation Tips</span>
                </h4>

                <div className="space-y-3 mb-3">
                  {selectedArticle.interview_questions?.map((iq, idx) => (
                    <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-700 space-y-1 relative">
                      <button
                        onClick={() => handleRemoveInterviewQuestion(idx)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-red-400 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-xs font-bold text-slate-200 pr-6">Q: {iq.question}</div>
                      <div className="text-[11px] text-blue-300 bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                        Tip: {iq.tip}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={tempIQQuestion}
                    onChange={(e) => setTempIQQuestion(e.target.value)}
                    placeholder="Interview Question (e.g. Describe how you debug a complex bottleneck...)"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={tempIQTip}
                    onChange={(e) => setTempIQTip(e.target.value)}
                    placeholder="Preparation Tip for candidates..."
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                  <button
                    onClick={handleAddInterviewQuestion}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Add Interview Question
                  </button>
                </div>

              </div>

            </div>

            {/* Right Col (1 col): Metadata, Taxonomy & Publishing Settings */}
            <div className="space-y-6">
              
              {/* Publishing Status Card */}
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Publishing & Visibility
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Current Status
                  </label>
                  <select
                    value={selectedArticle.status}
                    onChange={(e) => setSelectedArticle({ ...selectedArticle, status: e.target.value as ArticleStatus })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-semibold"
                  >
                    <option value="draft">Draft (Private / Not Indexed)</option>
                    <option value="in_review">In Review (Editorial Pending)</option>
                    <option value="published">Published (Live & Indexed)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={selectedArticle.is_featured}
                    onChange={(e) => setSelectedArticle({ ...selectedArticle, is_featured: e.target.checked })}
                    className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="is_featured" className="text-xs font-medium text-slate-200 cursor-pointer">
                    Pin as Featured Resource
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Estimated Global Salary Range
                  </label>
                  <input
                    type="text"
                    value={selectedArticle.salary_range || ''}
                    onChange={(e) => setSelectedArticle({ ...selectedArticle, salary_range: e.target.value })}
                    placeholder="e.g. $80,000 - $140,000 / year"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              {/* Taxonomy Association Card */}
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Hierarchy & Category Linking</span>
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Industry Sector (35+ Options)
                  </label>
                  <select
                    value={selectedArticle.industry_id || ''}
                    onChange={(e) => {
                      const newInd = e.target.value;
                      setSelectedArticle({
                        ...selectedArticle,
                        industry_id: newInd || undefined,
                        department_id: undefined,
                        job_role_id: undefined
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="">-- No specific industry (Global) --</option>
                    {INDUSTRIES.map(i => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                </div>

                {selectedArticle.industry_id && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Department / Field
                    </label>
                    <select
                      value={selectedArticle.department_id || ''}
                      onChange={(e) => {
                        const newDept = e.target.value;
                        setSelectedArticle({
                          ...selectedArticle,
                          department_id: newDept || undefined,
                          job_role_id: undefined
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    >
                      <option value="">-- All Departments in Industry --</option>
                      {DEPARTMENTS.filter(d => d.industry_id === selectedArticle.industry_id).map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedArticle.department_id && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Specific Job Role Association
                    </label>
                    <select
                      value={selectedArticle.job_role_id || ''}
                      onChange={(e) => setSelectedArticle({ ...selectedArticle, job_role_id: e.target.value || undefined })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    >
                      <option value="">-- General Department Guide --</option>
                      {JOB_ROLES.filter(r => r.department_id === selectedArticle.department_id).map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Tags & Skills Card */}
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                  <Tag className="w-3.5 h-3.5 text-blue-400" />
                  <span>Tags & Technical Skills</span>
                </h4>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tags / Topics</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedArticle.tags?.map((t, idx) => (
                      <span key={idx} className="bg-slate-900 text-slate-200 text-[11px] px-2 py-0.5 rounded-lg border border-slate-700 flex items-center space-x-1">
                        <span>{t}</span>
                        <button onClick={() => handleRemoveTag(t)} className="text-slate-400 hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={tempTag}
                      onChange={(e) => setTempTag(e.target.value)}
                      placeholder="Add tag..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Required Skills */}
                <div className="pt-3 border-t border-slate-700/60">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">In-Demand Skills</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedArticle.required_skills?.map((skill, idx) => (
                      <span key={idx} className="bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[11px] px-2 py-0.5 rounded-lg flex items-center space-x-1">
                        <span>{skill}</span>
                        <button onClick={() => handleRemoveSkill(idx)} className="text-blue-400 hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={tempSkill}
                      onChange={(e) => setTempSkill(e.target.value)}
                      placeholder="Add technical skill..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    />
                    <button
                      onClick={handleAddSkill}
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

              </div>

              {/* Author & Image Settings */}
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Author & Media</span>
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={selectedArticle.author_name}
                    onChange={(e) => setSelectedArticle({ ...selectedArticle, author_name: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Author Title / Role</label>
                  <input
                    type="text"
                    value={selectedArticle.author_role}
                    onChange={(e) => setSelectedArticle({ ...selectedArticle, author_role: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Read Time Estimate</label>
                  <input
                    type="text"
                    value={selectedArticle.read_time}
                    onChange={(e) => setSelectedArticle({ ...selectedArticle, read_time: e.target.value })}
                    placeholder="6 min read"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Featured Image URL</label>
                  <input
                    type="text"
                    value={selectedArticle.featured_image}
                    onChange={(e) => setSelectedArticle({ ...selectedArticle, featured_image: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                  />
                  {selectedArticle.featured_image && (
                    <img
                      src={selectedArticle.featured_image}
                      alt="Preview"
                      className="mt-2 w-full h-24 object-cover rounded-lg border border-slate-700"
                    />
                  )}
                </div>
              </div>

              {/* SEO Meta Tags */}
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  SEO & Search Metadata
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Custom Meta Title</label>
                  <input
                    type="text"
                    value={selectedArticle.meta_title || ''}
                    onChange={(e) => setSelectedArticle({ ...selectedArticle, meta_title: e.target.value })}
                    placeholder="Defaults to Title | Candidate Portal"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Meta Description</label>
                  <textarea
                    rows={2}
                    value={selectedArticle.meta_description || ''}
                    onChange={(e) => setSelectedArticle({ ...selectedArticle, meta_description: e.target.value })}
                    placeholder="Defaults to excerpt"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 3. LIVE PREVIEW MODAL                                    */}
      {/* ======================================================== */}
      {showPreviewModal && selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-10 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
                <Eye className="w-4 h-4" />
                <span>Live Article Preview</span>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview Banner */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {selectedArticle.tags?.map((tag, idx) => (
                  <span key={idx} className="bg-blue-50 text-blue-900 text-xs font-bold px-3 py-1 rounded-lg">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {selectedArticle.title || 'Untitled Article'}
              </h1>
              <p className="text-sm text-slate-600 border-l-4 border-blue-600 pl-3">
                {selectedArticle.excerpt}
              </p>
              <div className="flex items-center space-x-3 text-xs text-slate-500">
                <span>By <strong>{selectedArticle.author_name}</strong> ({selectedArticle.author_role})</span>
                <span>•</span>
                <span>{selectedArticle.read_time}</span>
              </div>
            </div>

            {/* Image */}
            {selectedArticle.featured_image && (
              <img
                src={selectedArticle.featured_image}
                alt={selectedArticle.title}
                className="w-full h-64 object-cover rounded-2xl border border-slate-100"
              />
            )}

            {/* Key Takeaways */}
            {selectedArticle.key_takeaways && selectedArticle.key_takeaways.length > 0 && (
              <div className="bg-blue-50 p-5 rounded-2xl space-y-2">
                <div className="text-xs font-bold text-blue-900 uppercase">Key Takeaways</div>
                <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                  {selectedArticle.key_takeaways.map((t, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Content preview */}
            <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-800 space-y-3 leading-relaxed">
              {selectedArticle.content?.split('\n\n').map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  handleSaveArticle('published');
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
              >
                Publish Live Now
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
