import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  Lock, 
  Mail, 
  User, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  X,
  Save,
  Key
} from 'lucide-react';
import { AdminRole, AdminUser } from '../../../types/career';
import { apiClient } from '../../../lib/apiClient';
import { getCurrentAdmin } from '../../../lib/adminAuth';

export const AdminUsersTab: React.FC = () => {
  const currentAdmin = getCurrentAdmin();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [targetUser, setTargetUser] = useState<Partial<AdminUser> & { password?: string }>({
    username: '',
    email: '',
    name: '',
    role: 'admin',
    password: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadAdminUsers = async () => {
    setLoading(true);
    const data = await apiClient.getAdminUsers();
    setAdminUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAdminUsers();
  }, []);

  const handleOpenCreate = () => {
    setModalMode('create');
    setTargetUser({
      username: '',
      email: '',
      name: '',
      role: 'admin',
      password: ''
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setModalMode('edit');
    setTargetUser({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      password: ''
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setErrorMsg(null);

    if (modalMode === 'create') {
      if (!targetUser.username || !targetUser.password || !targetUser.email) {
        setErrorMsg('Username, email, and password are required.');
        setSaveLoading(false);
        return;
      }
      const res = await apiClient.createAdminUser(targetUser);
      setSaveLoading(false);
      if (res.success) {
        setModalOpen(false);
        loadAdminUsers();
      } else {
        setErrorMsg(res.error || 'Failed to create admin user.');
      }
    } else {
      if (!targetUser.id) return;
      const res = await apiClient.updateAdminUser(targetUser.id, targetUser);
      setSaveLoading(false);
      if (res.success) {
        setModalOpen(false);
        loadAdminUsers();
      } else {
        setErrorMsg(res.error || 'Failed to update admin user.');
      }
    }
  };

  const handleDelete = async (id: string, username: string) => {
    if (username === currentAdmin?.username) {
      alert('You cannot delete your own active administrator account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to revoke access and delete administrator account "${username}"?`)) return;

    const res = await apiClient.deleteAdminUser(id);
    if (res.success) {
      loadAdminUsers();
    } else {
      alert(res.error || 'Failed to delete administrator account.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Create Button */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              <span>Administrator Accounts & Role-Based Access Control</span>
            </h2>
            <p className="text-xs text-slate-400">
              Manage platform operations staff with granular permissions: Super Admin, Administrator, Content Editor, and Support.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadAdminUsers}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Refresh Staff List"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Staff Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Administrator Name & Handle</th>
              <th className="py-3 px-4">Assigned Role</th>
              <th className="py-3 px-4">Email Address</th>
              <th className="py-3 px-4">Last Login</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  Loading administrator staff...
                </td>
              </tr>
            ) : adminUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  No administrator accounts found.
                </td>
              </tr>
            ) : (
              adminUsers.map((user) => {
                const isMe = user.username === currentAdmin?.username;
                return (
                  <tr key={user.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400 text-xs shrink-0">
                          {user.name?.charAt(0) || user.username?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span>{user.name || user.username}</span>
                            {isMe && (
                              <span className="text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1 rounded uppercase font-mono">
                                Current User
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">@{user.username}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'super_admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        user.role === 'content_editor' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {user.role?.replace('_', ' ') || 'Admin'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      {user.email || 'N/A'}
                    </td>

                    <td className="py-3 px-4 text-[11px] text-slate-400 font-mono">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                    </td>

                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition"
                        title="Edit Admin Account"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {!isMe && (
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white transition"
                          title="Revoke & Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Admin Account Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">
                  {modalMode === 'create' ? 'Create Staff Administrator' : `Edit Account: @${targetUser.username}`}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded bg-slate-800 text-slate-400">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-500/30">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={targetUser.name || ''}
                  onChange={(e) => setTargetUser({ ...targetUser, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Username Handle</label>
                <input
                  type="text"
                  placeholder="e.g. sjenkins"
                  value={targetUser.username || ''}
                  onChange={(e) => setTargetUser({ ...targetUser, username: e.target.value })}
                  disabled={modalMode === 'edit'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs font-mono disabled:opacity-50 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="sjenkins@worldwidecandidates.com"
                  value={targetUser.email || ''}
                  onChange={(e) => setTargetUser({ ...targetUser, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Assigned Role & Permissions</label>
                <select
                  value={targetUser.role || 'admin'}
                  onChange={(e) => setTargetUser({ ...targetUser, role: e.target.value as AdminRole })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
                >
                  <option value="super_admin">Super Admin (Full Root Access)</option>
                  <option value="admin">Administrator (Moderation, Users, Plans)</option>
                  <option value="content_editor">Content Editor (CMS & Career Guides Only)</option>
                  <option value="support_admin">Support Admin (Read & Inquiries Only)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  {modalMode === 'create' ? 'Password' : 'New Password (leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={targetUser.password || ''}
                  onChange={(e) => setTargetUser({ ...targetUser, password: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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
                  <span>{saveLoading ? 'Saving...' : modalMode === 'create' ? 'Create Admin' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
