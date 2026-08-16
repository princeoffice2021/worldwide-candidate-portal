import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  RefreshCw, 
  Trash2, 
  Lock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  User,
  AlertTriangle
} from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';

export const AdminResumesTab: React.FC = () => {
  const [resumes, setResumes] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Preview Modal
  const [previewResume, setPreviewResume] = useState<any | null>(null);

  const loadResumes = async () => {
    setLoading(true);
    const res = await apiClient.getAdminResumes({
      page,
      limit,
      search,
      status: statusFilter
    });
    setResumes(res.resumes || []);
    setTotal(res.total || 0);
    setLoading(false);
  };

  useEffect(() => {
    loadResumes();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadResumes();
  };

  const handleVerify = async (id: string, status: 'verified' | 'flagged') => {
    const res = await apiClient.moderateAdminResume(id, status, `Admin set resume status to ${status}`);
    if (res.success) {
      setResumes(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resume file from platform storage?')) return;
    const res = await apiClient.deleteAdminResume(id, 'Admin removed CV file');
    if (res.success) {
      setResumes(prev => prev.filter(r => r.id !== id));
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Overview & Filter Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Resume PDF Storage & Moderation Queue</span>
            </h2>
            <p className="text-xs text-slate-400">
              Inspect uploaded candidate CVs, review privacy settings, verify legitimacy, or flag sensitive documents.
            </p>
          </div>
          <button
            onClick={loadResumes}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Refresh List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by candidate name, filename, or candidate ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Filename & Format</th>
                <th className="py-3 px-4">Upload Date</th>
                <th className="py-3 px-4">Privacy Level</th>
                <th className="py-3 px-4">Moderation Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Loading resume records...
                  </td>
                </tr>
              ) : resumes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No resumes found in the moderation queue.
                  </td>
                </tr>
              ) : (
                resumes.map((resume) => (
                  <tr key={resume.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-indigo-400" />
                        <span>{resume.candidate_name || 'Candidate #' + resume.candidate_id}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>{resume.file_name || 'candidate_resume.pdf'}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase">{resume.file_type || 'PDF'} &bull; {resume.file_size ? `${Math.round(resume.file_size / 1024)} KB` : 'Verified'}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(resume.created_at || Date.now()).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                        {resume.privacy_level || 'LOCKED_BY_DEFAULT'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        resume.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        resume.status === 'flagged' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {resume.status || 'Active'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => setPreviewResume(resume)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
                        title="Preview Resume"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {resume.file_url && (
                        <a
                          href={resume.file_url}
                          download={resume.file_name || 'resume.pdf'}
                          className="inline-block p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {resume.status !== 'verified' && (
                        <button
                          onClick={() => handleVerify(resume.id, 'verified')}
                          className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-600 text-emerald-400 hover:text-white transition"
                          title="Mark Verified"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {resume.status !== 'flagged' && (
                        <button
                          onClick={() => handleVerify(resume.id, 'flagged')}
                          className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-600 text-red-400 hover:text-white transition"
                          title="Flag Resume"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(resume.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-700 text-slate-400 hover:text-white transition"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
            Showing <b className="text-white">{resumes.length > 0 ? (page - 1) * limit + 1 : 0}</b> to <b className="text-white">{Math.min(page * limit, total)}</b> of <b className="text-white">{total}</b> documents
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

      {/* Resume Document Viewer Modal */}
      {previewResume && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  Resume Document: {previewResume.candidate_name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewResume(null)}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4 text-xs text-slate-300">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-white font-bold text-sm">{previewResume.file_name || 'Resume Document'}</div>
                <div className="text-slate-400">File Type: {previewResume.file_type || 'PDF Document'}</div>
                <div className="text-slate-400">Uploaded: {new Date(previewResume.created_at || Date.now()).toLocaleString()}</div>
                <div className="text-slate-400">Candidate ID: {previewResume.candidate_id}</div>
              </div>

              {previewResume.file_url ? (
                <div className="p-8 border border-dashed border-slate-700 rounded-xl text-center space-y-3 bg-slate-900/50">
                  <FileText className="w-12 h-12 text-indigo-400 mx-auto" />
                  <p className="text-slate-300">Secure PDF file preview is ready.</p>
                  <a
                    href={previewResume.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Secure Document Viewer</span>
                  </a>
                </div>
              ) : (
                <div className="p-8 border border-dashed border-slate-700 rounded-xl text-center text-slate-400">
                  Document content is stored securely in encrypted binary stream.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setPreviewResume(null)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
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
