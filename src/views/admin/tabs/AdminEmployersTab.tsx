import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Ban, 
  CheckCircle2, 
  CreditCard, 
  Unlock, 
  FileText, 
  Plus, 
  Calendar, 
  Phone, 
  Mail, 
  Globe, 
  Sparkles, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Save, 
  RefreshCw,
  Clock,
  Layers
} from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';

interface AdminEmployersTabProps {
  onNavigate: (view: string, slug?: string) => void;
}

export const AdminEmployersTab: React.FC<AdminEmployersTabProps> = ({ onNavigate }) => {
  const [employers, setEmployers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Detail Modal
  const [selectedEmployerId, setSelectedEmployerId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Quota / Plan Adjustment Modal
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const [quotaTargetEmployer, setQuotaTargetEmployer] = useState<any | null>(null);
  const [quotaForm, setQuotaForm] = useState({
    plan_tier: 'pro_recruiter',
    status: 'active',
    contact_unlocks_limit: 100,
    resume_unlocks_limit: 50,
    add_days: 30,
    reason: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadEmployers = async () => {
    setLoading(true);
    const res = await apiClient.getAdminEmployers({
      page,
      limit,
      search,
      plan_id: planFilter !== 'all' ? planFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined
    });
    setEmployers(res.employers);
    setTotal(res.total);
    setLoading(false);
  };

  useEffect(() => {
    loadEmployers();
  }, [page, planFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadEmployers();
  };

  const handleOpenDetail = async (id: string) => {
    setSelectedEmployerId(id);
    setLoadingDetail(true);
    const data = await apiClient.getAdminEmployerDetail(id);
    setDetailData(data);
    setLoadingDetail(false);
  };

  const handleOpenQuotaModal = (emp: any) => {
    setQuotaTargetEmployer(emp);
    const sub = emp.active_subscription || {};
    setQuotaForm({
      plan_tier: sub.plan_tier || 'pro_recruiter',
      status: sub.status || 'active',
      contact_unlocks_limit: sub.contact_unlocks_limit || 100,
      resume_unlocks_limit: sub.resume_unlocks_limit || 50,
      add_days: 30,
      reason: ''
    });
    setQuotaModalOpen(true);
    setActionMsg(null);
  };

  const handleSaveQuotaAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotaTargetEmployer) return;
    setSaveLoading(true);
    setActionMsg(null);

    const res = await apiClient.adminAdjustEmployerQuota(quotaTargetEmployer.id, {
      ...quotaForm,
      reason: quotaForm.reason || 'Admin quota allocation update'
    });

    setSaveLoading(false);
    if (res.success) {
      setActionMsg({ type: 'success', text: 'Employer plan & quota adjusted successfully.' });
      loadEmployers();
      if (detailData && detailData.employer.id === quotaTargetEmployer.id) {
        handleOpenDetail(quotaTargetEmployer.id);
      }
      setTimeout(() => setQuotaModalOpen(false), 1200);
    } else {
      setActionMsg({ type: 'error', text: res.error || 'Failed to adjust quota.' });
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Employer Accounts & Quota Governance</h2>
            <p className="text-xs text-slate-400">Track enterprise subscriptions, adjust unlock quotas, inspect unlock logs, and manage accounts.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Total Found: <b className="text-white">{total}</b></span>
            <button
              onClick={loadEmployers}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Refresh List"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search & Filter bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company name, contact name, email, country, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-900 text-xs">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Plan Tier</label>
            <select
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Plans</option>
              <option value="starter_discovery">Starter Discovery</option>
              <option value="pro_recruiter">Pro Recruiter</option>
              <option value="enterprise_global">Enterprise Global</option>
              <option value="free_tier">Free / Trial</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Account Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employers Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Plan & Status</th>
                <th className="py-3 px-4">Phone Unlocks (Used / Limit)</th>
                <th className="py-3 px-4">Resume Views (Used / Limit)</th>
                <th className="py-3 px-4">Expires</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                      <span>Loading employer accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : employers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No employer accounts found matching the selected filters.
                  </td>
                </tr>
              ) : (
                employers.map((emp) => {
                  const sub = emp.active_subscription || {};
                  const planName = sub.plan_tier ? sub.plan_tier.replace('_', ' ') : 'Free / Trial';
                  return (
                    <tr key={emp.id} className="hover:bg-slate-900/50 transition">
                      {/* Company Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400 text-xs shrink-0">
                            {emp.company_name?.charAt(0) || 'E'}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{emp.company_name}</div>
                            <div className="text-[11px] text-slate-400">{emp.country || 'Global'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">{emp.contact_name || 'N/A'}</div>
                        <div className="text-[11px] text-slate-400">{emp.email || emp.contact_email}</div>
                      </td>

                      {/* Plan */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {planName}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5 capitalize">
                          Status: <b className={emp.status === 'suspended' ? 'text-red-400' : 'text-emerald-400'}>{emp.status || 'Active'}</b>
                        </div>
                      </td>

                      {/* Phone Unlocks */}
                      <td className="py-3 px-4 font-mono">
                        <div className="text-slate-200 font-semibold">
                          {sub.contact_unlocks_used || 0} / {sub.contact_unlocks_limit || 0}
                        </div>
                        <div className="w-20 bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                          <div
                            className="bg-amber-500 h-full"
                            style={{
                              width: `${Math.min(100, ((sub.contact_unlocks_used || 0) / (sub.contact_unlocks_limit || 1)) * 100)}%`
                            }}
                          />
                        </div>
                      </td>

                      {/* Resume Unlocks */}
                      <td className="py-3 px-4 font-mono">
                        <div className="text-slate-200 font-semibold">
                          {sub.resume_unlocks_used || 0} / {sub.resume_unlocks_limit || 0}
                        </div>
                        <div className="w-20 bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                          <div
                            className="bg-blue-500 h-full"
                            style={{
                              width: `${Math.min(100, ((sub.resume_unlocks_used || 0) / (sub.resume_unlocks_limit || 1)) * 100)}%`
                            }}
                          />
                        </div>
                      </td>

                      {/* Expires */}
                      <td className="py-3 px-4 text-[11px] text-slate-400">
                        {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenDetail(emp.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="View Employer Overview & Invoices"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenQuotaModal(emp)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 text-purple-300 hover:text-white transition"
                          title="Adjust Quota & Plan Credits"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-slate-900/80 px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <b className="text-white">{employers.length > 0 ? (page - 1) * limit + 1 : 0}</b> to <b className="text-white">{Math.min(page * limit, total)}</b> of <b className="text-white">{total}</b> employers
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
      {/* EMPLOYER DETAIL MODAL */}
      {/* ============================================================ */}
      {selectedEmployerId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400 text-sm">
                  {detailData?.employer?.company_name?.charAt(0) || 'E'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{detailData?.employer?.company_name || 'Employer Record'}</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {selectedEmployerId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployerId(null)}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-6 text-xs text-slate-300 custom-scrollbar">
              {loadingDetail ? (
                <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                  <span>Loading employer telemetry & billing logs...</span>
                </div>
              ) : !detailData ? (
                <div className="py-12 text-center text-slate-400">Failed to load employer record.</div>
              ) : (
                <>
                  {/* Company Quick Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                      <div className="text-[11px] text-slate-400">Account Status</div>
                      <div className="font-bold text-white uppercase mt-0.5">{detailData.employer.status}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                      <div className="text-[11px] text-slate-400">Primary Contact</div>
                      <div className="font-bold text-white mt-0.5">{detailData.employer.contact_name}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                      <div className="text-[11px] text-slate-400">Phone Unlocks Left</div>
                      <div className="font-bold text-amber-400 mt-0.5">
                        {Math.max(0, (detailData.subscription?.contact_unlocks_limit || 0) - (detailData.subscription?.contact_unlocks_used || 0))}
                      </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                      <div className="text-[11px] text-slate-400">Resume Views Left</div>
                      <div className="font-bold text-blue-400 mt-0.5">
                        {Math.max(0, (detailData.subscription?.resume_unlocks_limit || 0) - (detailData.subscription?.resume_unlocks_used || 0))}
                      </div>
                    </div>
                  </div>

                  {/* Active Subscription Summary */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-purple-400" />
                        <span>Active Plan Tier: <span className="uppercase text-purple-300">{detailData.subscription?.plan_tier || 'Free Discovery'}</span></span>
                      </span>
                      <span className="text-[11px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono">
                        {detailData.subscription?.status || 'Active'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-400 pt-2 border-t border-slate-800">
                      <div>Start Date: <b className="text-slate-200">{detailData.subscription?.start_date ? new Date(detailData.subscription.start_date).toLocaleDateString() : 'N/A'}</b></div>
                      <div>End Date: <b className="text-slate-200">{detailData.subscription?.end_date ? new Date(detailData.subscription.end_date).toLocaleDateString() : 'Lifetime / Unlimited'}</b></div>
                      <div>Billing Cycle: <b className="text-slate-200">{detailData.subscription?.billing_cycle || 'Monthly'}</b></div>
                    </div>
                  </div>

                  {/* Invoices History */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>Billing & Invoices ({detailData.invoices?.length || 0})</span>
                    </h4>
                    {detailData.invoices?.length === 0 ? (
                      <div className="bg-slate-900/60 p-3 rounded-lg text-slate-500 text-center">
                        No billing transactions recorded yet.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {detailData.invoices.map((inv: any) => (
                          <div key={inv.id} className="flex items-center justify-between p-2.5 rounded bg-slate-900 border border-slate-800">
                            <div>
                              <div className="font-semibold text-white">${inv.amount} &bull; {inv.plan_tier}</div>
                              <div className="text-[10px] text-slate-400 font-mono">Inv #{inv.invoice_number || inv.id}</div>
                            </div>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">
                              {inv.status || 'PAID'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <button
                onClick={() => {
                  const emp = detailData.employer;
                  setSelectedEmployerId(null);
                  handleOpenQuotaModal(emp);
                }}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Adjust Quotas & Plan</span>
              </button>

              <button
                onClick={() => setSelectedEmployerId(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* QUOTA & PLAN ADJUSTMENT MODAL */}
      {/* ============================================================ */}
      {quotaModalOpen && quotaTargetEmployer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Adjust Quota: {quotaTargetEmployer.company_name}</h3>
              </div>
              <button onClick={() => setQuotaModalOpen(false)} className="p-1 rounded bg-slate-800 text-slate-400">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {actionMsg && (
              <div className={`p-2.5 rounded-lg text-xs ${actionMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                {actionMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveQuotaAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Assigned Plan Tier</label>
                <select
                  value={quotaForm.plan_tier}
                  onChange={(e) => setQuotaForm({ ...quotaForm, plan_tier: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
                >
                  <option value="starter_discovery">Starter Discovery</option>
                  <option value="pro_recruiter">Pro Recruiter</option>
                  <option value="enterprise_global">Enterprise Global</option>
                  <option value="free_tier">Free / Trial</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Phone Unlocks Limit</label>
                  <input
                    type="number"
                    value={quotaForm.contact_unlocks_limit}
                    onChange={(e) => setQuotaForm({ ...quotaForm, contact_unlocks_limit: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Resume Unlocks Limit</label>
                  <input
                    type="number"
                    value={quotaForm.resume_unlocks_limit}
                    onChange={(e) => setQuotaForm({ ...quotaForm, resume_unlocks_limit: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Extend Validity (Days)</label>
                <input
                  type="number"
                  value={quotaForm.add_days}
                  onChange={(e) => setQuotaForm({ ...quotaForm, add_days: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Admin Audit Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Granted trial extension, enterprise package custom deal"
                  value={quotaForm.reason}
                  onChange={(e) => setQuotaForm({ ...quotaForm, reason: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuotaModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saveLoading ? 'Applying...' : 'Apply Quota Change'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
