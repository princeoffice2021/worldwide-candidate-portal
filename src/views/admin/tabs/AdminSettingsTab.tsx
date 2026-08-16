import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ShieldAlert, 
  Lock, 
  CreditCard, 
  Save, 
  RefreshCw, 
  Sliders, 
  Bell, 
  Building2, 
  Users, 
  CheckCircle2, 
  FileText,
  AlertTriangle,
  Globe
} from 'lucide-react';
import { PlatformSettings } from '../../../types';
import { apiClient } from '../../../lib/apiClient';

export const AdminSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    const data = await apiClient.getAdminPlatformSettings();
    setSettings(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMsg(null);

    const res = await apiClient.updateAdminPlatformSettings(settings);
    setSaving(false);
    if (res.success) {
      setMsg({ type: 'success', text: 'Platform configuration updated and applied successfully.' });
      setTimeout(() => setMsg(null), 4000);
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to update platform settings.' });
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
        <span>Loading system platform configuration...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <span>Platform Governance & Global System Parameters</span>
          </h2>
          <p className="text-xs text-slate-400">
            Configure system operational modes, default quota allowances, privacy thresholds, and announcements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSettings}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Reload Config"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving Config...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
          msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Grid of Setting Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* General & Operational Modes */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Globe className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-white text-sm">Platform Identification & Maintenance</h3>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Platform Brand Name</label>
            <input
              type="text"
              value={settings.platform_name}
              onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-lg border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenance_mode}
                onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
              />
              <div>
                <div className="font-semibold text-white">Enable Maintenance Mode</div>
                <div className="text-[11px] text-slate-400">Restricts regular candidate and employer logins while admins retain access.</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-lg border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allow_new_candidate_registrations}
                onChange={(e) => setSettings({ ...settings, allow_new_candidate_registrations: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
              />
              <div>
                <div className="font-semibold text-white">Allow Candidate Registrations</div>
                <div className="text-[11px] text-slate-400">Accept open enrolments for new candidate profiles globally.</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-lg border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allow_new_employer_registrations}
                onChange={(e) => setSettings({ ...settings, allow_new_employer_registrations: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
              />
              <div>
                <div className="font-semibold text-white">Allow Employer Sign-ups</div>
                <div className="text-[11px] text-slate-400">Permit company accounts to self-register and purchase plans.</div>
              </div>
            </label>
          </div>
        </div>

        {/* Default Quotas & Limits */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <CreditCard className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-white text-sm">Default Quotas & Credit Allocations</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Free Trial Phone Unlocks</label>
              <input
                type="number"
                value={settings.default_trial_contact_unlocks}
                onChange={(e) => setSettings({ ...settings, default_trial_contact_unlocks: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Free Trial Resume Unlocks</label>
              <input
                type="number"
                value={settings.default_trial_resume_unlocks}
                onChange={(e) => setSettings({ ...settings, default_trial_resume_unlocks: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Trial Validity Duration (Days)</label>
              <input
                type="number"
                value={settings.trial_duration_days}
                onChange={(e) => setSettings({ ...settings, trial_duration_days: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Max CV File Size (MB)</label>
              <input
                type="number"
                value={settings.max_resume_file_size_mb}
                onChange={(e) => setSettings({ ...settings, max_resume_file_size_mb: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-lg border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enforce_contact_privacy}
                onChange={(e) => setSettings({ ...settings, enforce_contact_privacy: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-0 w-4 h-4"
              />
              <div>
                <div className="font-semibold text-white">Enforce Phone Privacy Masking</div>
                <div className="text-[11px] text-slate-400">Mask phone numbers globally until unlocked with employer quota.</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-lg border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enforce_resume_privacy}
                onChange={(e) => setSettings({ ...settings, enforce_resume_privacy: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-0 w-4 h-4"
              />
              <div>
                <div className="font-semibold text-white">Enforce Resume PDF Authorization</div>
                <div className="text-[11px] text-slate-400">Require subscription quota to view or download candidate PDF resumes.</div>
              </div>
            </label>
          </div>
        </div>

        {/* Global Notification Banner */}
        <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">System Announcement & Broadcast Banner</h3>
          </div>

          <label className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-lg border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.system_announcement_enabled}
              onChange={(e) => setSettings({ ...settings, system_announcement_enabled: e.target.checked })}
              className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0 w-4 h-4"
            />
            <div>
              <div className="font-semibold text-white">Broadcast Global System Banner</div>
              <div className="text-[11px] text-slate-400">Shows a top-level announcement across portal headers to all users.</div>
            </div>
          </label>

          {settings.system_announcement_enabled && (
            <div>
              <label className="text-slate-400 block mb-1">Announcement Message Text</label>
              <input
                type="text"
                placeholder="e.g. Scheduled platform maintenance on Saturday 02:00 UTC."
                value={settings.system_announcement_text || ''}
                onChange={(e) => setSettings({ ...settings, system_announcement_text: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </form>
  );
};
