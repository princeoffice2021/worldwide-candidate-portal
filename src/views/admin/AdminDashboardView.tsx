import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Layers, 
  Briefcase, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Edit3, 
  Eye, 
  Save, 
  Send, 
  ArrowLeft, 
  LogOut, 
  Plus, 
  Trash2, 
  Sparkles, 
  HelpCircle, 
  Globe, 
  FileText, 
  DollarSign, 
  GraduationCap, 
  Wrench, 
  ShieldCheck, 
  Check, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { INDUSTRIES, DEPARTMENTS } from '../../data/categoriesData';
import { JOB_ROLES } from '../../data/jobRolesList';
import { 
  careerGuidesStore, 
  calculateGuideCompleteness, 
  getBreadcrumbsForRole 
} from '../../data/careerGuidesData';
import { blogArticlesStore } from '../../data/blogData';
import { CareerGuide, ContentStatus, FAQItem, InterviewQuestionItem } from '../../types/career';
import { isUserAdmin, logoutAdmin, getCurrentAdmin } from '../../lib/adminAuth';
import { updateDocumentSEO } from '../../lib/seo';
import { AdminArticlesManagement } from './AdminArticlesManagement';

interface AdminDashboardViewProps {
  onNavigate: (view: string, slug?: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'roles' | 'articles' | 'editor'>('dashboard');
  const [selectedRole, setSelectedRole] = useState<CareerGuide | null>(null);
  const [editorSubTab, setEditorSubTab] = useState<number>(0);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Protect Admin Route
  useEffect(() => {
    updateDocumentSEO({
      title: 'Admin Console — Career Content Engine | Candidate Portal',
      description: 'Administrative Content Management System.',
      noIndex: true
    });

    if (!isUserAdmin()) {
      onNavigate('admin-login');
    }
  }, [onNavigate]);

  const admin = getCurrentAdmin();
  const stats = careerGuidesStore.getStats();

  // Filtered Job Roles List
  const filteredRoles = JOB_ROLES.filter((role) => {
    if (selectedIndustry !== 'all' && role.industry_id !== selectedIndustry) return false;
    if (selectedDepartment !== 'all' && role.department_id !== selectedDepartment) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = role.name.toLowerCase().includes(q);
      const matchesSlug = role.slug.toLowerCase().includes(q);
      if (!matchesName && !matchesSlug) return false;
    }

    if (selectedStatus !== 'all') {
      const guide = careerGuidesStore.getByRoleId(role.id);
      const status = guide?.content_status || 'draft';
      if (status !== selectedStatus) return false;
    }

    return true;
  });

  const handleOpenEditor = (roleId: string) => {
    const guide = careerGuidesStore.getByRoleId(roleId);
    if (guide) {
      // Clone to allow editing
      setSelectedRole(JSON.parse(JSON.stringify(guide)));
      setEditorSubTab(0);
      setActiveTab('editor');
      setSaveSuccessMsg('');
    }
  };

  const handleSaveGuide = (publishStatus?: ContentStatus) => {
    if (!selectedRole) return;

    const toSave: CareerGuide = {
      ...selectedRole,
      content_status: publishStatus || selectedRole.content_status,
      editor_name: admin?.name || 'Administrator'
    };

    careerGuidesStore.save(toSave);
    setSelectedRole(toSave);
    setSaveSuccessMsg(
      publishStatus === 'published' 
        ? '✓ Career guide successfully published! Live public page is now indexed.'
        : '✓ Draft changes saved to database.'
    );

    setTimeout(() => {
      setSaveSuccessMsg('');
    }, 4000);
  };

  const completeness = selectedRole ? calculateGuideCompleteness(selectedRole) : null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      
      {/* Admin Top Navigation Bar */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Admin Console</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded border border-blue-400/30">
                Career Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Logged in as: <strong className="text-slate-200">{admin?.username || 'admin'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setSelectedRole(null);
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => {
              setActiveTab('roles');
              setSelectedRole(null);
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'roles' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Manage Roles ({JOB_ROLES.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('articles');
              setSelectedRole(null);
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'articles' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Articles & Resources
          </button>

          <button
            onClick={() => onNavigate('landing')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold transition cursor-pointer hidden sm:inline-block"
          >
            View Live Site
          </button>

          <button
            onClick={() => {
              logoutAdmin();
              onNavigate('admin-login');
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* ======================================================== */}
        {/* 1. DASHBOARD OVERVIEW VIEW                               */}
        {/* ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Career Content SEO Engine Overview
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Manage high-quality, standardized career guides for all 1,000+ professions across 35 worldwide industries.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
                <div className="text-xs font-semibold text-slate-400">Industries</div>
                <div className="text-2xl font-extrabold text-white mt-1">{stats.totalIndustries}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">35 Standardized</div>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
                <div className="text-xs font-semibold text-slate-400">Departments</div>
                <div className="text-2xl font-extrabold text-white mt-1">{stats.totalDepartments}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">120+ Fields</div>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
                <div className="text-xs font-semibold text-slate-400">Total Job Roles</div>
                <div className="text-2xl font-extrabold text-blue-400 mt-1">{stats.totalJobRoles}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Standardized IDs</div>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="text-xs font-semibold text-emerald-400">Published</div>
                <div className="text-2xl font-extrabold text-emerald-400 mt-1">{stats.publishedGuides}</div>
                <div className="text-[10px] text-emerald-500/70 mt-0.5">Indexed (index, follow)</div>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
                <div className="text-xs font-semibold text-amber-400">Partial Content</div>
                <div className="text-2xl font-extrabold text-amber-400 mt-1">{stats.partialGuides}</div>
                <div className="text-[10px] text-amber-500/70 mt-0.5">Review in Progress</div>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
                <div className="text-xs font-semibold text-slate-400">Draft Status</div>
                <div className="text-2xl font-extrabold text-slate-300 mt-1">{stats.draftGuides}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Marked noindex</div>
              </div>

            </div>

            {/* Quick Actions & Recent Updates */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-slate-800/60 rounded-2xl border border-slate-700 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Edit3 className="w-4 h-4 text-blue-400" />
                    <span>Quick Content Management</span>
                  </h2>
                  <button
                    onClick={() => setActiveTab('roles')}
                    className="text-xs text-blue-400 hover:underline font-semibold"
                  >
                    Browse all roles →
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  The Career Engine is fully connected to the existing classification hierarchy. Open any job role to curate structured responsibilities, technical proficiencies, interview questions, and SEO titles.
                </p>

                {/* Popular Landmark Roles for quick editing */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Exemplar Career Guides:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { name: 'Staff Nurse', roleId: 'r_029' },
                      { name: 'Software Developer', roleId: 'r_090' },
                      { name: 'General Physician', roleId: 'r_001' },
                      { name: 'General Surgeon', roleId: 'r_024' },
                      { name: 'ICU Nurse', roleId: 'r_031' },
                      { name: 'Python Developer', roleId: 'r_096' }
                    ].map(item => (
                      <button
                        key={item.roleId}
                        onClick={() => handleOpenEditor(item.roleId)}
                        className="text-left p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-between transition cursor-pointer"
                      >
                        <span>{item.name}</span>
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Updates Box */}
              <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-6 space-y-3">
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Recently Modified Guides</span>
                </h2>
                <div className="space-y-2">
                  {stats.recentUpdates.map(guide => (
                    <div
                      key={guide.id}
                      onClick={() => handleOpenEditor(guide.job_role_id)}
                      className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 hover:border-blue-400 transition cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{guide.job_role_name}</div>
                        <div className="text-[10px] text-slate-400">Updated: {guide.last_updated}</div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        guide.content_status === 'published' 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {guide.content_status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Articles & Resources Quick Management Box */}
            <div className="bg-gradient-to-r from-slate-800/90 via-slate-800/70 to-slate-800/90 rounded-2xl border border-blue-500/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <span>Career Resources & Blog System ({blogArticlesStore.getAll().length} Articles)</span>
                </h3>
                <p className="text-xs text-slate-300">
                  {blogArticlesStore.getPublished().length} Published & Indexed • {blogArticlesStore.getAll().filter(a => a.status === 'draft').length} Drafts • Linked across 35+ Industry Portals
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('articles');
                  setSelectedRole(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
              >
                Manage All Articles &rarr;
              </button>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* 2. ARTICLES & BLOG MANAGEMENT VIEW                       */}
        {/* ======================================================== */}
        {activeTab === 'articles' && (
          <AdminArticlesManagement onNavigate={onNavigate} />
        )}

        {/* ======================================================== */}
        {/* 3. JOB ROLES CATALOG & SEARCH VIEW                       */}
        {/* ======================================================== */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Career Content Repository ({filteredRoles.length} Roles)
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select any standardized profession to draft, edit, or publish its dedicated SEO Career Guide.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedIndustry('all');
                    setSelectedDepartment('all');
                    setSelectedStatus('all');
                  }}
                  className="text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-2 rounded-xl transition"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 1,050+ job roles..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Industry Filter */}
              <div>
                <select
                  value={selectedIndustry}
                  onChange={(e) => {
                    setSelectedIndustry(e.target.value);
                    setSelectedDepartment('all');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Industries (35)</option>
                  {INDUSTRIES.map(i => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Departments</option>
                  {DEPARTMENTS
                    .filter(d => selectedIndustry === 'all' || d.industry_id === selectedIndustry)
                    .map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
              </div>

              {/* Content Status Filter */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Content Statuses</option>
                  <option value="published">Published Only</option>
                  <option value="partial">Partial Content</option>
                  <option value="draft">Draft / Template</option>
                </select>
              </div>

            </div>

            {/* Roles Table */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-700 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Job Role / Slug</th>
                      <th className="py-3.5 px-4">Classification Hierarchy</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Completeness</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredRoles.slice(0, 50).map((role) => {
                      const guide = careerGuidesStore.getByRoleId(role.id);
                      const status = guide?.content_status || 'draft';
                      const comp = guide ? calculateGuideCompleteness(guide) : { percentage: 20 };
                      const ind = INDUSTRIES.find(i => i.id === role.industry_id);
                      const dept = DEPARTMENTS.find(d => d.id === role.department_id);

                      return (
                        <tr key={role.id} className="hover:bg-slate-700/40 transition">
                          
                          <td className="py-3 px-4 font-semibold text-white">
                            <div>{role.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">/careers/{role.slug}</div>
                          </td>

                          <td className="py-3 px-4 text-slate-300">
                            <div className="truncate max-w-[240px] text-slate-200 font-medium">{dept?.name}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[240px]">{ind?.name}</div>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              status === 'published' 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                : status === 'partial'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-700 text-slate-400'
                            }`}>
                              {status}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    comp.percentage >= 80 ? 'bg-emerald-500' : comp.percentage >= 50 ? 'bg-amber-500' : 'bg-blue-500'
                                  }`} 
                                  style={{ width: `${comp.percentage}%` }} 
                                />
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">{comp.percentage}%</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditor(role.id)}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                            >
                              Edit Guide
                            </button>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredRoles.length > 50 && (
                <div className="p-3 text-center text-xs text-slate-400 bg-slate-900/80 border-t border-slate-700">
                  Showing top 50 of {filteredRoles.length} matching job roles. Use search or industry filters to narrow down.
                </div>
              )}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* 3. STRUCTURED TABBED CAREER EDITOR VIEW                  */}
        {/* ======================================================== */}
        {activeTab === 'editor' && selectedRole && (
          <div className="space-y-6">
            
            {/* Header & Hierarchy Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/90 p-5 rounded-2xl border border-slate-700">
              <div>
                <button
                  onClick={() => setActiveTab('roles')}
                  className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-white mb-2 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Roles List</span>
                </button>

                <div className="text-xs text-slate-400 flex items-center space-x-1.5">
                  <span>{INDUSTRIES.find(i => i.id === selectedRole.industry_id)?.name}</span>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>{DEPARTMENTS.find(d => d.id === selectedRole.department_id)?.name}</span>
                </div>

                <h1 className="text-xl font-extrabold text-white mt-1">
                  Editing: {selectedRole.job_role_name}
                </h1>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                
                {saveSuccessMsg && (
                  <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    {saveSuccessMsg}
                  </span>
                )}

                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <button
                  onClick={() => handleSaveGuide('draft')}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Draft</span>
                </button>

                {selectedRole.content_status === 'published' ? (
                  <button
                    onClick={() => handleSaveGuide('draft')}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Unpublish (Set Draft)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSaveGuide('published')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish to Live Site</span>
                  </button>
                )}

                <button
                  onClick={() => onNavigate('career-detail', selectedRole.slug)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
                  title="View Public Page"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Public View</span>
                </button>
              </div>
            </div>

            {/* Completeness & Quality Bar */}
            {completeness && (
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-sm">
                    {completeness.percentage}%
                  </div>
                  <div>
                    <div className="font-bold text-white">Content Quality & Completeness</div>
                    <div className="text-[11px] text-slate-400">
                      {completeness.percentage >= 80 
                        ? 'High-quality editorial coverage. Recommended for indexing.' 
                        : 'Partial coverage. Please fill responsibilities, skills, and qualifications before publishing.'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 font-medium">Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    selectedRole.content_status === 'published' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {selectedRole.content_status}
                  </span>
                </div>
              </div>
            )}

            {/* Sub-Tabs Selector */}
            <div className="flex items-center space-x-1 border-b border-slate-700 overflow-x-auto pb-1 text-xs">
              {[
                { id: 0, label: '1. Overview & Intro', icon: FileText },
                { id: 1, label: '2. Responsibilities', icon: CheckCircle2 },
                { id: 2, label: '3. Technical & Soft Skills', icon: Wrench },
                { id: 3, label: '4. Qualifications & Path', icon: GraduationCap },
                { id: 4, label: '5. Work Environment & Salary', icon: DollarSign },
                { id: 5, label: '6. Interview & Resume', icon: HelpCircle },
                { id: 6, label: '7. FAQ & Taxonomies', icon: Sparkles },
                { id: 7, label: '8. SEO Settings & Metadata', icon: Globe }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setEditorSubTab(tab.id)}
                    className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-t-xl font-semibold whitespace-nowrap transition cursor-pointer ${
                      editorSubTab === tab.id
                        ? 'bg-slate-800 text-blue-400 border-t-2 border-blue-500'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sub-Tab 0: Overview & Intro */}
            {editorSubTab === 0 && (
              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Job Role Display Name
                  </label>
                  <input
                    type="text"
                    value={selectedRole.job_role_name}
                    onChange={(e) => setSelectedRole({ ...selectedRole, job_role_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Short Introduction (Hero Excerpt)
                  </label>
                  <textarea
                    rows={3}
                    value={selectedRole.short_introduction}
                    onChange={(e) => setSelectedRole({ ...selectedRole, short_introduction: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Detailed Role Overview (What Does This Professional Do?)
                  </label>
                  <textarea
                    rows={6}
                    value={selectedRole.overview}
                    onChange={(e) => setSelectedRole({ ...selectedRole, overview: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Sub-Tab 1: Responsibilities */}
            {editorSubTab === 1 && (
              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-300">
                      Key Responsibilities (Bullet points)
                    </label>
                    <button
                      type="button"
                      onClick={() => setSelectedRole({
                        ...selectedRole,
                        responsibilities: [...(selectedRole.responsibilities || []), '']
                      })}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Responsibility</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedRole.responsibilities?.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const updated = [...selectedRole.responsibilities];
                            updated[idx] = e.target.value;
                            setSelectedRole({ ...selectedRole, responsibilities: updated });
                          }}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = selectedRole.responsibilities.filter((_, i) => i !== idx);
                            setSelectedRole({ ...selectedRole, responsibilities: updated });
                          }}
                          className="p-2 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-300">
                      Day-to-Day Duties
                    </label>
                    <button
                      type="button"
                      onClick={() => setSelectedRole({
                        ...selectedRole,
                        day_to_day_duties: [...(selectedRole.day_to_day_duties || []), '']
                      })}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Daily Duty</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedRole.day_to_day_duties?.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const updated = [...selectedRole.day_to_day_duties];
                            updated[idx] = e.target.value;
                            setSelectedRole({ ...selectedRole, day_to_day_duties: updated });
                          }}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = selectedRole.day_to_day_duties.filter((_, i) => i !== idx);
                            setSelectedRole({ ...selectedRole, day_to_day_duties: updated });
                          }}
                          className="p-2 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Skills */}
            {editorSubTab === 2 && (
              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Technical Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={selectedRole.technical_skills?.join(', ')}
                    onChange={(e) => {
                      const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setSelectedRole({ ...selectedRole, technical_skills: list });
                    }}
                    placeholder="e.g. IV Cannulation, Vital Signs Monitoring, EHR Systems"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Soft Skills & Interpersonal Competencies (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={selectedRole.soft_skills?.join(', ')}
                    onChange={(e) => {
                      const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setSelectedRole({ ...selectedRole, soft_skills: list });
                    }}
                    placeholder="e.g. Empathy, Composure under pressure, Communication"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Sub-Tab 3: Qualifications & How to Become */}
            {editorSubTab === 3 && (
              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Education Overview
                  </label>
                  <textarea
                    rows={3}
                    value={selectedRole.education_requirements}
                    onChange={(e) => setSelectedRole({ ...selectedRole, education_requirements: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Certifications (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={selectedRole.certifications?.join(', ')}
                    onChange={(e) => {
                      const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setSelectedRole({ ...selectedRole, certifications: list });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    How to Become (Step-by-step guidance)
                  </label>
                  <div className="space-y-2">
                    {selectedRole.how_to_become?.map((step, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <span className="text-xs text-blue-400 font-bold w-6">{idx + 1}.</span>
                        <input
                          type="text"
                          value={step}
                          onChange={(e) => {
                            const updated = [...selectedRole.how_to_become];
                            updated[idx] = e.target.value;
                            setSelectedRole({ ...selectedRole, how_to_become: updated });
                          }}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 4: Environment & Salary */}
            {editorSubTab === 4 && (
              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Work Environment Description
                  </label>
                  <textarea
                    rows={3}
                    value={selectedRole.work_environment}
                    onChange={(e) => setSelectedRole({ ...selectedRole, work_environment: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Salary Disclaimer / Neutral Guidance (No fake global figures)
                  </label>
                  <textarea
                    rows={2}
                    value={selectedRole.salary_disclaimer}
                    onChange={(e) => setSelectedRole({ ...selectedRole, salary_disclaimer: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Tools & Technologies (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={selectedRole.tools_and_technologies?.join(', ')}
                    onChange={(e) => {
                      const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setSelectedRole({ ...selectedRole, tools_and_technologies: list });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Sub-Tab 5: Interview & Resume */}
            {editorSubTab === 5 && (
              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-300">
                      Interview Questions & Tips
                    </label>
                    <button
                      type="button"
                      onClick={() => setSelectedRole({
                        ...selectedRole,
                        interview_questions: [
                          ...(selectedRole.interview_questions || []),
                          { question: '', tip: '' }
                        ]
                      })}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Question</span>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {selectedRole.interview_questions?.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-2">
                        <input
                          type="text"
                          value={item.question}
                          placeholder="Interview Question"
                          onChange={(e) => {
                            const updated = [...selectedRole.interview_questions];
                            updated[idx].question = e.target.value;
                            setSelectedRole({ ...selectedRole, interview_questions: updated });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={item.tip}
                          placeholder="Answer strategy tip"
                          onChange={(e) => {
                            const updated = [...selectedRole.interview_questions];
                            updated[idx].tip = e.target.value;
                            setSelectedRole({ ...selectedRole, interview_questions: updated });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Hiring Outlook
                  </label>
                  <textarea
                    rows={2}
                    value={selectedRole.job_outlook}
                    onChange={(e) => setSelectedRole({ ...selectedRole, job_outlook: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Sub-Tab 6: FAQs */}
            {editorSubTab === 6 && (
              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300">
                    Frequently Asked Questions (FAQ)
                  </label>
                  <button
                    type="button"
                    onClick={() => setSelectedRole({
                      ...selectedRole,
                      faq_items: [
                        ...(selectedRole.faq_items || []),
                        { id: `faq-${Date.now()}`, question: '', answer: '' }
                      ]
                    })}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add FAQ Item</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {selectedRole.faq_items?.map((item, idx) => (
                    <div key={item.id || idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-2">
                      <input
                        type="text"
                        value={item.question}
                        placeholder="Question"
                        onChange={(e) => {
                          const updated = [...selectedRole.faq_items];
                          updated[idx].question = e.target.value;
                          setSelectedRole({ ...selectedRole, faq_items: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                      />
                      <textarea
                        rows={2}
                        value={item.answer}
                        placeholder="Answer"
                        onChange={(e) => {
                          const updated = [...selectedRole.faq_items];
                          updated[idx].answer = e.target.value;
                          setSelectedRole({ ...selectedRole, faq_items: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Tab 7: SEO Settings */}
            {editorSubTab === 7 && (
              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Custom SEO Title Tag
                  </label>
                  <input
                    type="text"
                    value={selectedRole.seo_title}
                    onChange={(e) => setSelectedRole({ ...selectedRole, seo_title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Recommended: 50-60 characters. Current length: {selectedRole.seo_title?.length || 0}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={selectedRole.meta_description}
                    onChange={(e) => setSelectedRole({ ...selectedRole, meta_description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Recommended: 120-160 characters. Current length: {selectedRole.meta_description?.length || 0}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={selectedRole.slug}
                      onChange={(e) => setSelectedRole({ ...selectedRole, slug: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Author Attribution
                    </label>
                    <input
                      type="text"
                      value={selectedRole.author_name}
                      onChange={(e) => setSelectedRole({ ...selectedRole, author_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Live Preview Modal */}
      {showPreviewModal && selectedRole && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Live Editorial Preview: {selectedRole.job_role_name}</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-xs text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded"
              >
                Close Preview
              </button>
            </div>
            
            <div className="bg-white text-slate-900 p-6 rounded-xl space-y-4 text-xs">
              <div className="text-xl font-extrabold text-slate-900">{selectedRole.job_role_name} Career Guide</div>
              <p className="text-slate-600 leading-relaxed">{selectedRole.short_introduction}</p>
              <div className="text-sm font-bold text-slate-800 mt-3">What Does This Role Do?</div>
              <p className="text-slate-600">{selectedRole.overview}</p>
              <div className="text-sm font-bold text-slate-800 mt-3">Core Responsibilities</div>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                {selectedRole.responsibilities?.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
