import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Ban, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Unlock, 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  ShieldAlert, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  X,
  ExternalLink,
  Save,
  Trash2,
  Lock,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';
import { INDUSTRIES, DEPARTMENTS } from '../../../data/categoriesData';

interface AdminCandidatesTabProps {
  onNavigate: (view: string, slug?: string) => void;
}

export const AdminCandidatesTab: React.FC<AdminCandidatesTabProps> = ({ onNavigate }) => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [industryId, setIndustryId] = useState('all');
  const [departmentId, setDepartmentId] = useState('all');
  const [hasResume, setHasResume] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Selected candidate for detail modal or edit modal
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Edit State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCandidateData, setEditCandidateData] = useState<any | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Status Action Modal (Suspend / Hide / Delete / Activate)
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    candidate: any | null;
    targetStatus: 'active' | 'suspended' | 'hidden' | 'soft_deleted';
    reason: string;
  }>({
    isOpen: false,
    candidate: null,
    targetStatus: 'suspended',
    reason: ''
  });

  const loadCandidates = async () => {
    setLoading(true);
    const res = await apiClient.getAdminCandidates({
      page,
      limit,
      search,
      status,
      industry_id: industryId,
      department_id: departmentId,
      has_resume: hasResume,
      sort_by: sortBy
    });
    setCandidates(res.candidates);
    setTotal(res.total);
    setLoading(false);
  };

  useEffect(() => {
    loadCandidates();
  }, [page, status, industryId, departmentId, hasResume, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadCandidates();
  };

  const handleOpenDetail = async (id: string) => {
    setSelectedCandidateId(id);
    setLoadingDetail(true);
    const data = await apiClient.getAdminCandidateDetail(id);
    setDetailData(data);
    setLoadingDetail(false);
  };

  const handleOpenEdit = (cand: any) => {
    setEditCandidateData({
      id: cand.id,
      full_name: cand.full_name || '',
      phone_number: cand.phone_number || '',
      email: cand.email || '',
      country: cand.country || '',
      headline: cand.headline || '',
      job_role_name: cand.job_role_name || '',
      summary: cand.summary || '',
      experience_years: cand.experience_years || 0,
      current_salary: cand.current_salary || '',
      expected_salary: cand.expected_salary || '',
      notice_period: cand.notice_period || '',
      city: cand.city || '',
      state: cand.state || ''
    });
    setEditModalOpen(true);
    setActionMsg(null);
  };

  const handleSaveCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCandidateData) return;
    setSaveLoading(true);
    setActionMsg(null);

    const res = await apiClient.updateAdminCandidate(editCandidateData.id, editCandidateData, 'Admin edited candidate profile');
    setSaveLoading(false);
    if (res.success) {
      setActionMsg({ type: 'success', text: 'Candidate profile updated successfully.' });
      setCandidates(prev => prev.map(c => c.id === editCandidateData.id ? { ...c, ...editCandidateData } : c));
      if (detailData && detailData.candidate.id === editCandidateData.id) {
        setDetailData((prev: any) => ({ ...prev, candidate: { ...prev.candidate, ...editCandidateData } }));
      }
      setTimeout(() => setEditModalOpen(false), 1200);
    } else {
      setActionMsg({ type: 'error', text: res.error || 'Failed to update candidate.' });
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!statusModal.candidate) return;
    setSaveLoading(true);
    const res = await apiClient.setAdminCandidateStatus(
      statusModal.candidate.id,
      statusModal.targetStatus,
      statusModal.reason
    );
    setSaveLoading(false);
    if (res.success) {
      setCandidates(prev => prev.map(c => c.id === statusModal.candidate.id ? { ...c, status: statusModal.targetStatus } : c));
      if (detailData && detailData.candidate.id === statusModal.candidate.id) {
        setDetailData((prev: any) => ({ ...prev, candidate: { ...prev.candidate, status: statusModal.targetStatus } }));
      }
      setStatusModal({ isOpen: false, candidate: null, targetStatus: 'suspended', reason: '' });
    } else {
      alert(res.error || 'Failed to change status.');
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Candidate Directory & Moderation</h2>
            <p className="text-xs text-slate-400">Manage candidate profiles, review privacy statuses, and inspect unlock history.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Total Found: <b className="text-white">{total}</b></span>
            <button
              onClick={loadCandidates}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Refresh List"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by candidate name, phone, headline, job role, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-900 text-xs">
          {/* Status */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active & Visible</option>
              <option value="suspended">Suspended</option>
              <option value="hidden">Private / Hidden</option>
              <option value="soft_deleted">Soft Deleted</option>
            </select>
          </div>

          {/* Industry */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Industry</label>
            <select
              value={industryId}
              onChange={(e) => { setIndustryId(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Industries</option>
              {INDUSTRIES.map(ind => (
                <option key={ind.id} value={ind.id}>{ind.name}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Department</label>
            <select
              value={departmentId}
              onChange={(e) => { setDepartmentId(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Resume */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Resume Attached</label>
            <select
              value={hasResume}
              onChange={(e) => { setHasResume(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="true">Has CV Document</option>
              <option value="false">No CV Document</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Sort Order</label>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="recent">Recently Created</option>
              <option value="name">Name (A-Z)</option>
              <option value="completion">Profile Completeness</option>
              <option value="views">Most Profile Views</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidate Records Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Job Role / Industry</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Completeness</th>
                <th className="py-3 px-4">Unlocks</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                      <span>Loading candidate records...</span>
                    </div>
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No candidates found matching the selected filters.
                  </td>
                </tr>
              ) : (
                candidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-900/50 transition">
                    {/* Candidate identity */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-xs shrink-0">
                          {cand.full_name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <span>{cand.full_name}</span>
                            {cand.has_resume && (
                              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1 py-0.2 rounded font-medium border border-blue-500/30" title="Has Resume Attached">
                                CV
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{cand.phone_number}</div>
                        </div>
                      </div>
                    </td>

                    {/* Job Role */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{cand.job_role_name || cand.skill_category || 'General'}</div>
                      <div className="text-[11px] text-slate-400">{cand.industry_name || 'Cross-Industry'}</div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4">
                      <div>{cand.country || 'Global'}</div>
                      {cand.city && <div className="text-[11px] text-slate-400">{cand.city}</div>}
                    </td>

                    {/* Completeness */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              cand.completion_score >= 80 ? 'bg-emerald-500' :
                              cand.completion_score >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${cand.completion_score || 0}%` }}
                          />
                        </div>
                        <span className="font-semibold text-[11px] text-slate-300">{cand.completion_score || 0}%</span>
                      </div>
                    </td>

                    {/* Unlocks */}
                    <td className="py-3 px-4">
                      <div className="text-[11px] text-slate-300">
                        <span>📞 {cand.contact_unlocks_count || 0}</span> &bull; <span>📄 {cand.resume_unlocks_count || 0}</span>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        cand.status === 'suspended' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        cand.status === 'hidden' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        cand.status === 'soft_deleted' ? 'bg-slate-700 text-slate-400' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {cand.status || 'Active'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenDetail(cand.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="View Full Profile & Unlock Audit"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(cand)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition"
                        title="Edit Candidate Profile"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {cand.status === 'suspended' ? (
                        <button
                          onClick={() => setStatusModal({ isOpen: true, candidate: cand, targetStatus: 'active', reason: 'Admin restored candidate account' })}
                          className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-600 text-emerald-400 hover:text-white transition"
                          title="Activate Account"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setStatusModal({ isOpen: true, candidate: cand, targetStatus: 'suspended', reason: 'Administrative suspension' })}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white transition"
                          title="Suspend Account"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="bg-slate-900/80 px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <b className="text-white">{candidates.length > 0 ? (page - 1) * limit + 1 : 0}</b> to <b className="text-white">{Math.min(page * limit, total)}</b> of <b className="text-white">{total}</b> candidates
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-300 font-semibold px-2">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CANDIDATE DETAIL & UNLOCK AUDIT MODAL */}
      {/* ============================================================ */}
      {selectedCandidateId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-sm">
                  {detailData?.candidate?.full_name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{detailData?.candidate?.full_name || 'Candidate Details'}</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {selectedCandidateId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidateId(null)}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto flex-1 space-y-6 text-xs text-slate-300 custom-scrollbar">
              {loadingDetail ? (
                <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  <span>Loading candidate details & unlock history...</span>
                </div>
              ) : !detailData ? (
                <div className="py-12 text-center text-slate-400">Failed to load candidate record.</div>
              ) : (
                <>
                  {/* Candidate Quick Stats Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                      <div className="text-[11px] text-slate-400">Status</div>
                      <div className="font-bold text-white uppercase mt-0.5">{detailData.candidate.status}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                      <div className="text-[11px] text-slate-400">Phone Number</div>
                      <div className="font-bold text-white font-mono mt-0.5">{detailData.candidate.phone_number}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                      <div className="text-[11px] text-slate-400">Completeness</div>
                      <div className="font-bold text-emerald-400 mt-0.5">{detailData.candidate.completion_score}%</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                      <div className="text-[11px] text-slate-400">Profile Views</div>
                      <div className="font-bold text-blue-400 mt-0.5">{detailData.candidate.profile_views || 0}</div>
                    </div>
                  </div>

                  {/* Profile Summary Bio */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="font-bold text-slate-200">Headline & Professional Summary</div>
                    <div className="text-slate-300 italic">{detailData.candidate.headline || 'No headline set'}</div>
                    <p className="text-slate-400 leading-relaxed">{detailData.candidate.summary || 'No detailed biography provided.'}</p>
                    <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                      <span className="bg-slate-800 px-2 py-1 rounded text-slate-300">Exp: {detailData.candidate.experience_years || 0} Yrs</span>
                      <span className="bg-slate-800 px-2 py-1 rounded text-slate-300">Country: {detailData.candidate.country}</span>
                      <span className="bg-slate-800 px-2 py-1 rounded text-slate-300">Notice: {detailData.candidate.notice_period || 'Immediate'}</span>
                      {detailData.candidate.expected_salary && (
                        <span className="bg-slate-800 px-2 py-1 rounded text-slate-300">Expected: {detailData.candidate.expected_salary}</span>
                      )}
                    </div>
                  </div>

                  {/* Contact Unlock Logs */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Unlock className="w-4 h-4 text-amber-400" />
                        <span>Employer Contact Unlock History ({detailData.contact_unlocks?.length || 0})</span>
                      </h4>
                    </div>
                    {detailData.contact_unlocks?.length === 0 ? (
                      <div className="bg-slate-900/60 p-3 rounded-lg text-slate-500 text-center">
                        No employers have unlocked this candidate's phone number yet.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {detailData.contact_unlocks.map((u: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                            <div>
                              <span className="font-semibold text-white">{u.employer_name}</span>
                              <span className="text-[10px] text-slate-400 ml-2 font-mono">Emp ID: {u.employer_id}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{new Date(u.unlocked_at || u.accessed_at).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Resume Unlock Logs */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span>Resume Access / Downloads ({detailData.resume_unlocks?.length || 0})</span>
                      </h4>
                    </div>
                    {detailData.resume_unlocks?.length === 0 ? (
                      <div className="bg-slate-900/60 p-3 rounded-lg text-slate-500 text-center">
                        No employers have accessed this candidate's resume PDF yet.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {detailData.resume_unlocks.map((r: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                            <div>
                              <span className="font-semibold text-white">{r.employer_name}</span>
                              <span className="text-[10px] text-blue-400 ml-2 uppercase font-mono">{r.action || 'VIEW'}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{new Date(r.accessed_at).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedCandidateId(null);
                  onNavigate('public-profile', detailData?.candidate?.slug || selectedCandidateId);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Public Page</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const cand = detailData.candidate;
                    setSelectedCandidateId(null);
                    handleOpenEdit(cand);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => setSelectedCandidateId(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CANDIDATE EDIT MODAL */}
      {/* ============================================================ */}
      {editModalOpen && editCandidateData && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                <h3 className="text-base font-bold text-white">Administrative Edit: {editCandidateData.full_name}</h3>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCandidate} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs custom-scrollbar">
              {actionMsg && (
                <div className={`p-3 rounded-lg text-xs ${actionMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                  {actionMsg.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editCandidateData.full_name}
                    onChange={(e) => setEditCandidateData({ ...editCandidateData, full_name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editCandidateData.phone_number}
                    onChange={(e) => setEditCandidateData({ ...editCandidateData, phone_number: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Job Role Title</label>
                  <input
                    type="text"
                    value={editCandidateData.job_role_name}
                    onChange={(e) => setEditCandidateData({ ...editCandidateData, job_role_name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Country</label>
                  <input
                    type="text"
                    value={editCandidateData.country}
                    onChange={(e) => setEditCandidateData({ ...editCandidateData, country: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Headline</label>
                <input
                  type="text"
                  value={editCandidateData.headline}
                  onChange={(e) => setEditCandidateData({ ...editCandidateData, headline: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Summary Bio</label>
                <textarea
                  rows={4}
                  value={editCandidateData.summary}
                  onChange={(e) => setEditCandidateData({ ...editCandidateData, summary: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white text-xs focus:border-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Years Exp</label>
                  <input
                    type="number"
                    value={editCandidateData.experience_years}
                    onChange={(e) => setEditCandidateData({ ...editCandidateData, experience_years: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Expected Salary</label>
                  <input
                    type="text"
                    value={editCandidateData.expected_salary}
                    onChange={(e) => setEditCandidateData({ ...editCandidateData, expected_salary: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Notice Period</label>
                  <input
                    type="text"
                    value={editCandidateData.notice_period}
                    onChange={(e) => setEditCandidateData({ ...editCandidateData, notice_period: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-800 flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saveLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STATUS CHANGE CONFIRMATION MODAL */}
      {/* ============================================================ */}
      {statusModal.isOpen && statusModal.candidate && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white capitalize">
                  {statusModal.targetStatus.replace('_', ' ')} Candidate Account
                </h3>
                <p className="text-xs text-slate-400">{statusModal.candidate.full_name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to change the status of <b>{statusModal.candidate.full_name}</b> to <span className="uppercase text-white font-bold">{statusModal.targetStatus}</span>?
            </p>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Reason for moderation log:</label>
              <input
                type="text"
                placeholder="e.g., Incomplete information, spam profile, candidate request..."
                value={statusModal.reason}
                onChange={(e) => setStatusModal({ ...statusModal, reason: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setStatusModal({ isOpen: false, candidate: null, targetStatus: 'suspended', reason: '' })}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
                disabled={saveLoading}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold"
              >
                {saveLoading ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
