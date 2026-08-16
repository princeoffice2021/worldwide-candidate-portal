import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Eye, 
  CheckCircle2, 
  Save, 
  ArrowLeft, 
  Layers, 
  Building2, 
  Briefcase, 
  Sparkles, 
  ExternalLink,
  Trash2,
  X,
  RefreshCw
} from 'lucide-react';
import { INDUSTRIES, DEPARTMENTS } from '../../../data/categoriesData';
import { JOB_ROLES } from '../../../data/jobRolesList';
import { JobRoleGuide, GuideStatus } from '../../../types/career';
import { apiClient } from '../../../lib/apiClient';

interface AdminJobRoleGuidesTabProps {
  onNavigate: (view: string, slug?: string) => void;
}

export const AdminJobRoleGuidesTab: React.FC<AdminJobRoleGuidesTabProps> = ({ onNavigate }) => {
  const [guides, setGuides] = useState<JobRoleGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Editor View
  const [isEditing, setIsEditing] = useState(false);
  const [activeGuide, setActiveGuide] = useState<Partial<JobRoleGuide> | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Temp tag additions
  const [tempSkill, setTempSkill] = useState('');
  const [tempCertification, setTempCertification] = useState('');
  const [tempTool, setTempTool] = useState('');
  const [tempKeyResp, setTempKeyResp] = useState('');
  const [tempInterviewQ, setTempInterviewQ] = useState({ question: '', answer: '', category: 'technical' });

  const loadGuides = async () => {
    setLoading(true);
    const data = await apiClient.getAdminJobRoleGuides();
    if (data && data.length > 0) {
      setGuides(data);
    } else {
      // Fallback seed with some JOB_ROLES
      const initialGuides: JobRoleGuide[] = JOB_ROLES.slice(0, 30).map((role) => {
        const ind = INDUSTRIES.find(i => i.id === role.industry_id);
        const dept = DEPARTMENTS.find(d => d.id === role.department_id);
        return {
          id: role.id,
          roleSlug: role.slug || role.id,
          roleTitle: role.name,
          industryId: role.industry_id,
          industryName: ind?.name || 'General Industry',
          departmentId: role.department_id,
          departmentName: dept?.name || 'General Department',
          status: 'published',
          metaTitle: `${role.name} Career Guide, Salary Trends & Top Skills`,
          metaDescription: `Discover key responsibilities, salary ranges, required certifications, and interview preparation for ${role.name}.`,
          overview: `A complete comprehensive professional career guide and roadmap for becoming a top ${role.name}.`,
          salaryInsights: {
            entryLevel: '$45,000 - $65,000',
            midLevel: '$70,000 - $95,000',
            seniorLevel: '$105,000 - $150,000+',
            currency: 'USD',
            hourlyRate: '$35 - $80/hr'
          },
          coreSkills: ['Strategic Analysis', 'Domain Expertise', 'Cross-functional Collaboration', 'Problem Solving'],
          trendingTools: ['Jira', 'Modern Cloud Stack', 'Slack', 'Analytics Tools'],
          certifications: ['Industry Accredited Specialist', 'Professional Level 1'],
          keyResponsibilities: [
            'Lead domain operations and key project execution.',
            'Maintain compliance and high delivery standards.',
            'Collaborate with global teams to streamline operations.'
          ],
          interviewQuestions: [
            {
              question: `What is your primary approach to solving high-stakes challenges in ${role.name}?`,
              suggestedAnswer: 'Explain structured prioritization, stakeholder communication, and iterative refinement.',
              category: 'situational'
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          authorName: 'Global Editorial Board'
        };
      });
      setGuides(initialGuides);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadGuides();
  }, []);

  const filteredGuides = guides.filter(g => {
    const matchesSearch = !search || 
      g.roleTitle.toLowerCase().includes(search.toLowerCase()) || 
      g.industryName.toLowerCase().includes(search.toLowerCase()) ||
      g.departmentName.toLowerCase().includes(search.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || g.industryId === selectedIndustry;
    const matchesStatus = selectedStatus === 'all' || g.status === selectedStatus;
    return matchesSearch && matchesIndustry && matchesStatus;
  });

  const handleCreateNew = () => {
    const firstRole = JOB_ROLES[0];
    const ind = INDUSTRIES.find(i => i.id === firstRole.industry_id);
    const dept = DEPARTMENTS.find(d => d.id === firstRole.department_id);

    setActiveGuide({
      id: 'guide_' + Date.now(),
      roleSlug: firstRole.slug || firstRole.id,
      roleTitle: firstRole.name,
      industryId: firstRole.industry_id,
      industryName: ind?.name || '',
      departmentId: firstRole.department_id,
      departmentName: dept?.name || '',
      status: 'draft',
      metaTitle: `${firstRole.name} Career Guide & Salary`,
      metaDescription: `Career path overview for ${firstRole.name}`,
      overview: '',
      salaryInsights: {
        entryLevel: '$50,000 - $70,000',
        midLevel: '$75,000 - $100,000',
        seniorLevel: '$110,000+',
        currency: 'USD',
        hourlyRate: '$40 - $75/hr'
      },
      coreSkills: ['Leadership', 'Analysis'],
      trendingTools: [],
      certifications: [],
      keyResponsibilities: [],
      interviewQuestions: [],
      authorName: 'Staff Editor'
    });
    setIsEditing(true);
  };

  const handleEditGuide = (guide: JobRoleGuide) => {
    setActiveGuide({ ...guide });
    setIsEditing(true);
  };

  const handleSaveGuide = async () => {
    if (!activeGuide || !activeGuide.roleTitle) return;
    setSaveLoading(true);

    const guideToSave: JobRoleGuide = {
      id: activeGuide.id || 'guide_' + Date.now(),
      roleSlug: activeGuide.roleSlug || activeGuide.roleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      roleTitle: activeGuide.roleTitle,
      industryId: activeGuide.industryId || 'technology',
      industryName: activeGuide.industryName || 'Technology',
      departmentId: activeGuide.departmentId || 'software_engineering',
      departmentName: activeGuide.departmentName || 'Software Engineering',
      status: activeGuide.status || 'published',
      metaTitle: activeGuide.metaTitle || `${activeGuide.roleTitle} Career Guide`,
      metaDescription: activeGuide.metaDescription || '',
      overview: activeGuide.overview || '',
      salaryInsights: activeGuide.salaryInsights || {
        entryLevel: '$50,000 - $70,000',
        midLevel: '$75,000 - $100,000',
        seniorLevel: '$110,000+',
        currency: 'USD',
        hourlyRate: '$40 - $75/hr'
      },
      coreSkills: activeGuide.coreSkills || [],
      trendingTools: activeGuide.trendingTools || [],
      certifications: activeGuide.certifications || [],
      keyResponsibilities: activeGuide.keyResponsibilities || [],
      interviewQuestions: activeGuide.interviewQuestions || [],
      createdAt: activeGuide.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorName: activeGuide.authorName || 'Editorial Team'
    };

    const res = await apiClient.saveAdminJobRoleGuide(guideToSave);
    setSaveLoading(false);
    if (res.success) {
      setGuides(prev => {
        const idx = prev.findIndex(g => g.id === guideToSave.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = guideToSave;
          return next;
        }
        return [guideToSave, ...prev];
      });
      setIsEditing(false);
      setActiveGuide(null);
    } else {
      alert(res.error || 'Failed to save guide.');
    }
  };

  return (
    <div className="space-y-6">
      {!isEditing ? (
        <>
          {/* List Header & Filters */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  <span>Job Role Guides CMS & SEO Engine</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Manage in-depth career guides, salary analytics, and role roadmaps mapped across 1,000+ positions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadGuides}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Refresh Guides"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
                </button>
                <button
                  onClick={handleCreateNew}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Career Guide</span>
                </button>
              </div>
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-900">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by job role title or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="all">All Industries ({INDUSTRIES.length})</option>
                  {INDUSTRIES.map(i => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Role Title & Slug</th>
                    <th className="py-3 px-4">Industry & Department</th>
                    <th className="py-3 px-4">Salary Range (Mid)</th>
                    <th className="py-3 px-4">Skills / Tools</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        Loading career guide repository...
                      </td>
                    </tr>
                  ) : filteredGuides.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No career guides found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredGuides.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-900/50 transition">
                        <td className="py-3 px-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-emerald-400" />
                            <span>{g.roleTitle}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">/career-guide/{g.roleSlug}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-slate-200">{g.industryName}</div>
                          <div className="text-[11px] text-slate-400">{g.departmentName}</div>
                        </td>

                        <td className="py-3 px-4 font-mono text-emerald-400">
                          {g.salaryInsights?.midLevel || '$75k - $100k'}
                        </td>

                        <td className="py-3 px-4 text-[11px] text-slate-400">
                          <span>{g.coreSkills?.length || 0} Core Skills</span> &bull; <span>{g.interviewQuestions?.length || 0} Interview Qs</span>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            g.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {g.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => onNavigate('career-guide', g.roleSlug)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Preview Guide Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEditGuide(g)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition"
                            title="Edit Guide Content"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Full Career Guide Editor */
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-base font-bold text-white">
                  {activeGuide?.roleTitle ? `Editing Career Guide: ${activeGuide.roleTitle}` : 'Create Career Guide'}
                </h3>
                <p className="text-xs text-slate-400">Configure role requirements, salary levels, interview Q&As, and SEO metadata.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={activeGuide?.status || 'published'}
                onChange={(e) => setActiveGuide(prev => ({ ...prev!, status: e.target.value as GuideStatus }))}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>

              <button
                onClick={handleSaveGuide}
                disabled={saveLoading}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saveLoading ? 'Saving...' : 'Save Guide'}</span>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Job Role Title</label>
              <input
                type="text"
                value={activeGuide?.roleTitle || ''}
                onChange={(e) => setActiveGuide(prev => ({ ...prev!, roleTitle: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">URL Slug</label>
              <input
                type="text"
                value={activeGuide?.roleSlug || ''}
                onChange={(e) => setActiveGuide(prev => ({ ...prev!, roleSlug: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Industry & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Industry</label>
              <select
                value={activeGuide?.industryId || ''}
                onChange={(e) => {
                  const ind = INDUSTRIES.find(i => i.id === e.target.value);
                  setActiveGuide(prev => ({ ...prev!, industryId: e.target.value, industryName: ind?.name || '' }));
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
              >
                {INDUSTRIES.map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Department</label>
              <select
                value={activeGuide?.departmentId || ''}
                onChange={(e) => {
                  const dept = DEPARTMENTS.find(d => d.id === e.target.value);
                  setActiveGuide(prev => ({ ...prev!, departmentId: e.target.value, departmentName: dept?.name || '' }));
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Overview Bio */}
          <div className="text-xs">
            <label className="text-slate-400 block mb-1">Role Overview & Roadmap Description</label>
            <textarea
              rows={4}
              value={activeGuide?.overview || ''}
              onChange={(e) => setActiveGuide(prev => ({ ...prev!, overview: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white text-xs focus:border-emerald-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Salary Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
            <div className="font-bold text-white">Global Salary Intelligence</div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Entry Level</label>
                <input
                  type="text"
                  value={activeGuide?.salaryInsights?.entryLevel || ''}
                  onChange={(e) => setActiveGuide(prev => ({
                    ...prev!,
                    salaryInsights: { ...prev!.salaryInsights!, entryLevel: e.target.value }
                  }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Mid Level</label>
                <input
                  type="text"
                  value={activeGuide?.salaryInsights?.midLevel || ''}
                  onChange={(e) => setActiveGuide(prev => ({
                    ...prev!,
                    salaryInsights: { ...prev!.salaryInsights!, midLevel: e.target.value }
                  }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Senior / Lead</label>
                <input
                  type="text"
                  value={activeGuide?.salaryInsights?.seniorLevel || ''}
                  onChange={(e) => setActiveGuide(prev => ({
                    ...prev!,
                    salaryInsights: { ...prev!.salaryInsights!, seniorLevel: e.target.value }
                  }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Hourly / Contract</label>
                <input
                  type="text"
                  value={activeGuide?.salaryInsights?.hourlyRate || ''}
                  onChange={(e) => setActiveGuide(prev => ({
                    ...prev!,
                    salaryInsights: { ...prev!.salaryInsights!, hourlyRate: e.target.value }
                  }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Skills Array */}
          <div className="space-y-2 text-xs">
            <label className="text-slate-400 block font-bold">Core Skills</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill (e.g. Distributed Systems)..."
                value={tempSkill}
                onChange={(e) => setTempSkill(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (!tempSkill.trim()) return;
                  setActiveGuide(prev => ({
                    ...prev!,
                    coreSkills: [...(prev?.coreSkills || []), tempSkill.trim()]
                  }));
                  setTempSkill('');
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {activeGuide?.coreSkills?.map((skill, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-slate-200 text-xs">
                  {skill}
                  <button
                    type="button"
                    onClick={() => setActiveGuide(prev => ({
                      ...prev!,
                      coreSkills: prev!.coreSkills!.filter((_, i) => i !== idx)
                    }))}
                    className="text-slate-500 hover:text-red-400 ml-1"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
