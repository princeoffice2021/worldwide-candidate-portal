import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  TrendingUp, 
  FileText, 
  Unlock, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  RefreshCw,
  Eye,
  Activity,
  Layers,
  Sparkles,
  Server,
  Zap,
  Lock,
  PhoneCall
} from 'lucide-react';
import { AdminMasterStats } from '../../../types';
import { apiClient } from '../../../lib/apiClient';

interface AdminMasterOverviewTabProps {
  onNavigateTab: (tabId: any) => void;
  onNavigate: (view: string, slug?: string) => void;
}

export const AdminMasterOverviewTab: React.FC<AdminMasterOverviewTabProps> = ({
  onNavigateTab,
  onNavigate
}) => {
  const [stats, setStats] = useState<AdminMasterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    setRefreshing(true);
    const data = await apiClient.getAdminMasterDashboard();
    if (data) {
      setStats(data);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
          <span>Loading platform metrics & operational telemetry...</span>
        </div>
      </div>
    );
  }

  const cStats = stats?.candidates;
  const eStats = stats?.employers;
  const bStats = stats?.billing;
  const secStats = stats?.security;
  const contentStats = stats?.content;

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Cards */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">System Telemetry & Platform KPIs</h2>
          <p className="text-xs text-slate-400">Real-time breakdown of candidates, employer subscriptions, unlock activity, and system governance.</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition border border-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
        </button>
      </div>

      {/* Grid of 4 Major High-Level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Candidates Total */}
        <div 
          onClick={() => onNavigateTab('candidates')}
          className="bg-slate-950/80 hover:bg-slate-950 border border-slate-800/90 hover:border-blue-500/50 p-4 rounded-xl cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +{cStats?.new_week || 0} this week
            </span>
          </div>
          <div className="text-2xl font-black text-white">{cStats?.total || 0}</div>
          <div className="text-xs font-semibold text-slate-300 mt-0.5">Total Registered Candidates</div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-800/80">
            <span>Active: <b className="text-slate-200">{cStats?.active || 0}</b></span>
            <span>With CV: <b className="text-blue-400">{cStats?.with_resume || 0}</b></span>
          </div>
        </div>

        {/* Employers Total */}
        <div 
          onClick={() => onNavigateTab('employers')}
          className="bg-slate-950/80 hover:bg-slate-950 border border-slate-800/90 hover:border-purple-500/50 p-4 rounded-xl cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {eStats?.with_active_sub || 0} Subscribed
            </span>
          </div>
          <div className="text-2xl font-black text-white">{eStats?.total || 0}</div>
          <div className="text-xs font-semibold text-slate-300 mt-0.5">Total Employer Accounts</div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-800/80">
            <span>Active: <b className="text-slate-200">{eStats?.active || 0}</b></span>
            <span>Trials: <b className="text-purple-400">{eStats?.trial_or_dev_mode || 0}</b></span>
          </div>
        </div>

        {/* Platform Revenue / Subscriptions */}
        <div 
          onClick={() => onNavigateTab('subscriptions')}
          className="bg-slate-950/80 hover:bg-slate-950 border border-slate-800/90 hover:border-emerald-500/50 p-4 rounded-xl cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <Activity className="w-3 h-3" /> {bStats?.active_subscriptions_count || 0} Active Subs
            </span>
          </div>
          <div className="text-2xl font-black text-white">
            ${(bStats?.total_revenue || 0).toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-slate-300 mt-0.5">Recorded Platform Revenue</div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-800/80">
            <span>Paid Invoices: <b className="text-slate-200">{bStats?.paid_invoices_count || 0}</b></span>
            <span>Gateway: <b className="text-emerald-400 uppercase text-[10px]">{bStats?.current_provider || 'Simulated'}</b></span>
          </div>
        </div>

        {/* Privacy & Unlocks Telemetry */}
        <div 
          onClick={() => onNavigateTab('unlocks')}
          className="bg-slate-950/80 hover:bg-slate-950 border border-slate-800/90 hover:border-amber-500/50 p-4 rounded-xl cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
              <Unlock className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Enforced
            </span>
          </div>
          <div className="text-2xl font-black text-white">
            {(secStats?.contact_unlocks_count || 0) + (secStats?.resume_unlocks_count || 0)}
          </div>
          <div className="text-xs font-semibold text-slate-300 mt-0.5">Total Secured Unlocks</div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-800/80">
            <span>Phone: <b className="text-slate-200">{secStats?.contact_unlocks_count || 0}</b></span>
            <span>CVs: <b className="text-amber-400">{secStats?.resume_unlocks_count || 0}</b></span>
          </div>
        </div>
      </div>

      {/* Middle Section: Operational Breakdowns & Live Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Activity & Breakdown Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Breakdown & Status Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm text-white">Candidate Inventory & Quality Distribution</h3>
              </div>
              <button
                onClick={() => onNavigateTab('candidates')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
              >
                View Candidates <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-lg">
                <div className="text-xs text-slate-400">Complete (≥80%)</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">{cStats?.completed_profiles || 0}</div>
                <div className="text-[10px] text-slate-400 mt-1">High Quality Profiles</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-lg">
                <div className="text-xs text-slate-400">Resume Attached</div>
                <div className="text-lg font-bold text-blue-400 mt-0.5">{cStats?.with_resume || 0}</div>
                <div className="text-[10px] text-slate-400 mt-1">Verified CV Storage</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-lg">
                <div className="text-xs text-slate-400">Public Listed</div>
                <div className="text-lg font-bold text-indigo-400 mt-0.5">{cStats?.public_profiles || 0}</div>
                <div className="text-[10px] text-slate-400 mt-1">Searchable by Emp</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-lg">
                <div className="text-xs text-slate-400">Restricted / Hidden</div>
                <div className="text-lg font-bold text-amber-400 mt-0.5">{cStats?.restricted_profiles || 0}</div>
                <div className="text-[10px] text-slate-400 mt-1">Direct Share Only</div>
              </div>
            </div>

            {/* Quick List of Recent Registrations */}
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Recently Enrolled Candidates</div>
              <div className="space-y-2">
                {(cStats?.recent_candidates || []).slice(0, 4).map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-xs">
                        {c.full_name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{c.full_name}</div>
                        <div className="text-[11px] text-slate-400">{c.job_role_name || 'Candidate'} &bull; {c.country || 'Global'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.has_resume && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-medium border border-blue-500/30">
                          CV Ready
                        </span>
                      )}
                      <button
                        onClick={() => onNavigateTab('candidates')}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                        title="View Candidate"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Employer Activity & Plans Distribution */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-sm text-white">Employer Organizations & Subscription Health</h3>
              </div>
              <button
                onClick={() => onNavigateTab('employers')}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
              >
                Manage Employers <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-lg">
                <div className="text-xs text-slate-400">Subscribed Employers</div>
                <div className="text-lg font-bold text-purple-400 mt-0.5">{eStats?.with_active_sub || 0}</div>
                <div className="text-[10px] text-slate-400 mt-1">Quota Access Enabled</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-lg">
                <div className="text-xs text-slate-400">Monthly Billing</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">{bStats?.monthly_subscribers || 0}</div>
                <div className="text-[10px] text-slate-400 mt-1">Recurring Plan Cycle</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-lg">
                <div className="text-xs text-slate-400">Expiring in 7 Days</div>
                <div className="text-lg font-bold text-amber-400 mt-0.5">{bStats?.expiring_soon_count || 0}</div>
                <div className="text-[10px] text-slate-400 mt-1">Renewal Prompt Stage</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Security, Content Engine, Quick Actions */}
        <div className="space-y-6">
          {/* Quick System Navigation Controls */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>Administrative Quick Links</span>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('candidates')}
                className="w-full text-left p-2.5 rounded-lg bg-slate-900 hover:bg-blue-600 hover:text-white border border-slate-800 text-xs text-slate-300 font-medium transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400 group-hover:text-white" />
                  <span>Search & Moderate Candidates</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => onNavigateTab('employers')}
                className="w-full text-left p-2.5 rounded-lg bg-slate-900 hover:bg-purple-600 hover:text-white border border-slate-800 text-xs text-slate-300 font-medium transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-400 group-hover:text-white" />
                  <span>Employer Quotas & Subscriptions</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => onNavigateTab('resumes')}
                className="w-full text-left p-2.5 rounded-lg bg-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-800 text-xs text-slate-300 font-medium transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400 group-hover:text-white" />
                  <span>Resume PDF Moderation Queue</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => onNavigateTab('settings')}
                className="w-full text-left p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-white border border-slate-800 font-medium transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Platform Governance & Maintenance</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>
          </div>

          {/* CMS & Content Engine Status */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Content & SEO Engine</h3>
              </div>
              <button
                onClick={() => onNavigateTab('content-articles')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                CMS
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300 bg-slate-900 p-2 rounded-lg">
                <span className="text-slate-400">Career Guides Published:</span>
                <span className="font-bold text-white">{contentStats?.published_career_guides || 0} / {contentStats?.total_career_guides || 0}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300 bg-slate-900 p-2 rounded-lg">
                <span className="text-slate-400">Articles Live:</span>
                <span className="font-bold text-emerald-400">{contentStats?.published_articles || 0}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300 bg-slate-900 p-2 rounded-lg">
                <span className="text-slate-400">Drafts / Needing Review:</span>
                <span className="font-bold text-amber-400">{contentStats?.needing_review_count || 0}</span>
              </div>
            </div>
          </div>

          {/* Security & Audit Pulse */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Audit & Compliance</h3>
              </div>
              <button
                onClick={() => onNavigateTab('audit-logs')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                View Logs
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Recent Admin Sign-ins:</span>
                <span className="text-slate-200 font-semibold">{secStats?.recent_admin_logins || 0}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Resume Access Audits:</span>
                <span className="text-slate-200 font-semibold">{secStats?.resume_unlocks_count || 0}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Contact Unmask Audits:</span>
                <span className="text-slate-200 font-semibold">{secStats?.contact_unlocks_count || 0}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Suspension Operations:</span>
                <span className="text-amber-400 font-semibold">{secStats?.recent_suspensions_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
