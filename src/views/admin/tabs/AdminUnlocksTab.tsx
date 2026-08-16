import React, { useState, useEffect } from 'react';
import { 
  Unlock, 
  Search, 
  Filter, 
  ShieldCheck, 
  FileText, 
  Phone, 
  Building2, 
  User, 
  Calendar, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Lock
} from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';

export const AdminUnlocksTab: React.FC = () => {
  const [unlocks, setUnlocks] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [loading, setLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState<'all' | 'contact' | 'resume'>('all');
  const [search, setSearch] = useState('');

  const loadUnlocks = async () => {
    setLoading(true);
    const res = await apiClient.getAdminUnlocks({
      page,
      limit,
      type: typeFilter,
      search
    });
    setUnlocks(res.unlocks || []);
    setTotal(res.total || 0);
    setLoading(false);
  };

  useEffect(() => {
    loadUnlocks();
  }, [page, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUnlocks();
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>Secured Access & Candidate Privacy Unmasking Logs</span>
            </h2>
            <p className="text-xs text-slate-400">
              Immutable audit ledger of all employer contact unmaskings and resume access operations.
            </p>
          </div>
          <button
            onClick={loadUnlocks}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Refresh Audit Logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>

        {/* Filter / Search */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-900">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by employer name, candidate name, or phone number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold"
            >
              Filter
            </button>
          </form>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => { setTypeFilter('all'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                typeFilter === 'all' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              All Access Logs
            </button>
            <button
              onClick={() => { setTypeFilter('contact'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
                typeFilter === 'contact' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Phone className="w-3 h-3" />
              <span>Contact Unlocks</span>
            </button>
            <button
              onClick={() => { setTypeFilter('resume'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
                typeFilter === 'resume' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>CV Access Logs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Employer (Requester)</th>
                <th className="py-3 px-4">Candidate (Subject)</th>
                <th className="py-3 px-4">Phone / Data Point</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Quota Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Loading unlock telemetry records...
                  </td>
                </tr>
              ) : unlocks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No unlock telemetry events recorded.
                  </td>
                </tr>
              ) : (
                unlocks.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-4">
                      {item.type === 'contact' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Phone className="w-3 h-3" /> Contact Unlock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <FileText className="w-3 h-3" /> CV View / Download
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        <span>{item.employer_name || 'Employer #' + item.employer_id}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-200">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-500" />
                        <span>{item.candidate_name || 'Candidate #' + item.candidate_id}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300">
                      {item.phone_number || item.candidate_phone || item.action || 'Protected Data'}
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(item.unlocked_at || item.accessed_at || Date.now()).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-amber-400 font-bold">
                      1 Credit
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-slate-900/80 px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <b className="text-white">{unlocks.length > 0 ? (page - 1) * limit + 1 : 0}</b> to <b className="text-white">{Math.min(page * limit, total)}</b> of <b className="text-white">{total}</b> logs
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
    </div>
  );
};
