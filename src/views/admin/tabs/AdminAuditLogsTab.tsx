import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  RefreshCw, 
  Calendar, 
  User, 
  Clock, 
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  X
} from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';

export const AdminAuditLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  // Selected Log Details Modal
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    const res = await apiClient.getAdminAuditLogs({
      page,
      limit,
      search,
      action: actionFilter
    });
    setLogs(res.logs || []);
    setTotal(res.total || 0);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadLogs();
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Immutable Governance & Audit Trails</span>
            </h2>
            <p className="text-xs text-slate-400">
              Complete historical ledger tracking all administrator operations, configuration changes, and data modifications.
            </p>
          </div>
          <button
            onClick={loadLogs}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Refresh Audit Logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>

        {/* Filter / Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-900">
          <form onSubmit={handleSearch} className="sm:col-span-2 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit trail by admin username, entity ID, action, or details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
            >
              Filter
            </button>
          </form>

          <div>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Actions</option>
              <option value="ADMIN_LOGIN">Admin Login</option>
              <option value="UPDATE_CANDIDATE">Candidate Updates</option>
              <option value="UPDATE_EMPLOYER">Employer Updates</option>
              <option value="UPDATE_SUBSCRIPTION">Subscription Changes</option>
              <option value="MODERATE_RESUME">Resume Moderations</option>
              <option value="UPDATE_SETTINGS">Platform Settings Updates</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Admin Actor</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Details / Metadata</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Loading audit trail records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No audit records found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-4 font-bold">
                      <span className="font-mono text-emerald-400 text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-200">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.admin_username || log.admin_name || 'System / Super Admin'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {log.entity_type ? `${log.entity_type} #${log.entity_id || ''}` : 'Global'}
                    </td>

                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                      {typeof log.details === 'string'
                        ? log.details
                        : JSON.stringify(log.details || log.metadata || {})}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(log.created_at || log.timestamp || Date.now()).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="View Full JSON Log"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
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
            Showing <b className="text-white">{logs.length > 0 ? (page - 1) * limit + 1 : 0}</b> to <b className="text-white">{Math.min(page * limit, total)}</b> of <b className="text-white">{total}</b> logs
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

      {/* Selected Log Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Audit Event #{selectedLog.id}</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-300">
                <div>Action: <b className="text-emerald-400 font-mono">{selectedLog.action}</b></div>
                <div>Admin: <b className="text-white">{selectedLog.admin_username || 'System'}</b></div>
                <div>Entity: <b className="text-white">{selectedLog.entity_type} ({selectedLog.entity_id})</b></div>
                <div>Date: <b className="text-white">{new Date(selectedLog.created_at).toLocaleString()}</b></div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold">Metadata Payload JSON</label>
                <pre className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-emerald-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(selectedLog.details || selectedLog.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
