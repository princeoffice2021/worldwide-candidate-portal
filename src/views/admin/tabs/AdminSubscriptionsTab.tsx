import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  RefreshCw, 
  Edit3, 
  Calendar, 
  Building2, 
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Save
} from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';

export const AdminSubscriptionsTab: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'subscriptions' | 'invoices'>('subscriptions');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  // Edit Subscription Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [subForm, setSubForm] = useState({
    status: 'active',
    plan_tier: 'pro_recruiter',
    contact_unlocks_limit: 100,
    resume_unlocks_limit: 50,
    end_date: '',
    reason: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await apiClient.getAdminSubscriptions({
      page,
      limit,
      search,
      status: statusFilter,
      plan: planFilter
    });
    setSubscriptions(res.subscriptions);
    setInvoices(res.invoices || []);
    setTotal(res.total);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [page, statusFilter, planFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleOpenEdit = (sub: any) => {
    setSelectedSub(sub);
    setSubForm({
      status: sub.status || 'active',
      plan_tier: sub.plan_tier || 'pro_recruiter',
      contact_unlocks_limit: sub.contact_unlocks_limit || 100,
      resume_unlocks_limit: sub.resume_unlocks_limit || 50,
      end_date: sub.end_date ? new Date(sub.end_date).toISOString().slice(0, 10) : '',
      reason: ''
    });
    setEditModalOpen(true);
  };

  const handleSaveSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setSaveLoading(true);
    const res = await apiClient.updateAdminSubscription(selectedSub.id, {
      ...subForm,
      reason: subForm.reason || 'Admin updated subscription limits'
    });
    setSaveLoading(false);
    if (res.success) {
      setEditModalOpen(false);
      loadData();
    } else {
      alert(res.error || 'Failed to update subscription.');
    }
  };

  const totalRevenue = invoices.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Top Telemetry Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Subscriptions</span>
            <CreditCard className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{total}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across all employer accounts</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Invoiced Platform Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">${totalRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">{invoices.length} Total Platform Invoices</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Active Quota Grants</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {subscriptions.filter(s => s.status === 'active').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Employers in current billing cycle</div>
        </div>
      </div>

      {/* Control Bar & Toggle View */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('subscriptions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'subscriptions'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Active Subscriptions ({total})
            </button>
            <button
              onClick={() => setViewMode('invoices')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'invoices'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Invoices & Billing History ({invoices.length})
            </button>
          </div>

          <button
            onClick={loadData}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Refresh List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search subscriptions by employer name, plan tier, or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold"
          >
            Search
          </button>
        </form>
      </div>

      {/* Subscriptions Table */}
      {viewMode === 'subscriptions' ? (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Employer</th>
                  <th className="py-3 px-4">Plan Tier</th>
                  <th className="py-3 px-4">Phone Unlocks (Used / Limit)</th>
                  <th className="py-3 px-4">Resume Views (Used / Limit)</th>
                  <th className="py-3 px-4">Cycle Dates</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      Loading subscription records...
                    </td>
                  </tr>
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No subscription records found.
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-purple-400" />
                          <span>{sub.employer_name || 'Employer #' + sub.employer_id}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-purple-300 uppercase text-[11px] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                          {sub.plan_tier ? sub.plan_tier.replace('_', ' ') : 'STARTER'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {sub.contact_unlocks_used || 0} / {sub.contact_unlocks_limit || 0}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {sub.resume_unlocks_used || 0} / {sub.resume_unlocks_limit || 0}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-400">
                        {sub.start_date ? new Date(sub.start_date).toLocaleDateString() : 'N/A'} &rarr;{' '}
                        {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : 'Lifetime'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {sub.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(sub)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition"
                          title="Edit Subscription Limits"
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
      ) : (
        /* Invoices Table */
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Employer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Plan Tier</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No invoices recorded yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {inv.invoice_number || inv.id}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200">
                        {inv.employer_name || 'Employer #' + inv.employer_id}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-400">
                        ${inv.amount} {inv.currency || 'USD'}
                      </td>
                      <td className="py-3 px-4 uppercase text-[11px] font-mono text-purple-300">
                        {inv.plan_tier}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(inv.created_at || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          {inv.status || 'PAID'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Subscription Modal */}
      {editModalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Edit Subscription #{selectedSub.id}</h3>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="p-1 rounded bg-slate-800 text-slate-400">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveSub} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Status</label>
                <select
                  value={subForm.status}
                  onChange={(e) => setSubForm({ ...subForm, status: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="canceled">Canceled</option>
                  <option value="expired">Expired</option>
                  <option value="trial">Trial</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Phone Unlocks Limit</label>
                  <input
                    type="number"
                    value={subForm.contact_unlocks_limit}
                    onChange={(e) => setSubForm({ ...subForm, contact_unlocks_limit: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Resume Unlocks Limit</label>
                  <input
                    type="number"
                    value={subForm.resume_unlocks_limit}
                    onChange={(e) => setSubForm({ ...subForm, resume_unlocks_limit: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Expiration Date</label>
                <input
                  type="date"
                  value={subForm.end_date}
                  onChange={(e) => setSubForm({ ...subForm, end_date: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Audit Reason</label>
                <input
                  type="text"
                  placeholder="Reason for modifying subscription..."
                  value={subForm.reason}
                  onChange={(e) => setSubForm({ ...subForm, reason: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
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
                  <span>{saveLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
