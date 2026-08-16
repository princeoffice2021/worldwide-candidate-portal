import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CreditCard, 
  Unlock, 
  FileText, 
  Layers, 
  ShieldAlert, 
  UserCheck, 
  Settings, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { AdminUser } from '../../types/career';
import { getCurrentAdmin, logoutAdmin } from '../../lib/adminAuth';

export type AdminActiveNav = 
  | 'dashboard'
  | 'candidates'
  | 'employers'
  | 'subscriptions'
  | 'unlocks'
  | 'resumes'
  | 'content-roles'
  | 'content-articles'
  | 'taxonomies'
  | 'audit-logs'
  | 'admin-users'
  | 'settings';

export type AdminTabType = 
  | 'overview'
  | 'dashboard'
  | 'candidates'
  | 'employers'
  | 'subscriptions'
  | 'unlocks'
  | 'resumes'
  | 'content-roles'
  | 'content-articles'
  | 'taxonomies'
  | 'audit-logs'
  | 'admin-users'
  | 'users'
  | 'settings';

interface AdminLayoutProps {
  activeTab?: AdminTabType;
  activeNav?: AdminActiveNav;
  onSelectTab?: (tab: AdminTabType) => void;
  onSelectNav?: (nav: AdminActiveNav) => void;
  onNavigate: (view: string, slug?: string) => void;
  onLogout?: () => void;
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  badgeCounts?: {
    candidates?: number;
    employers?: number;
    flaggedResumes?: number;
    unreadLogs?: number;
  };
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  activeNav,
  onSelectTab,
  onSelectNav,
  onNavigate,
  onLogout,
  children,
  pageTitle,
  pageSubtitle,
  badgeCounts
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const admin: AdminUser | null = getCurrentAdmin();

  // Normalize current selected tab/nav
  const normalizedActive: AdminTabType = activeTab || activeNav || 'overview';
  const effectiveNavId: AdminActiveNav = 
    normalizedActive === 'overview' ? 'dashboard' :
    normalizedActive === 'users' ? 'admin-users' :
    (normalizedActive as AdminActiveNav);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logoutAdmin();
      onNavigate('admin-login');
    }
  };

  const titles: Record<AdminActiveNav, { title: string; subtitle: string }> = {
    'dashboard': {
      title: 'Platform Master Overview',
      subtitle: 'Real-time telemetry, revenue metrics, subscriber health, and system diagnostics.'
    },
    'candidates': {
      title: 'Candidate Directory & Verification',
      subtitle: 'Search, filter, inspect profiles, manage status, and audit verification states.'
    },
    'employers': {
      title: 'Employer & Organization Governance',
      subtitle: 'Review registered employers, active plans, contact unlock quotas, and statuses.'
    },
    'subscriptions': {
      title: 'Subscription Plans & Transactions',
      subtitle: 'Configure pricing tiers, manage subscriber allowances, and inspect payment events.'
    },
    'unlocks': {
      title: 'Contact & Resume Access Telemetry',
      subtitle: 'Complete access audit trail showing who viewed or downloaded candidate details.'
    },
    'resumes': {
      title: 'CV & Resume Moderation',
      subtitle: 'Audit uploaded documents, review parser quality, and moderate flagged attachments.'
    },
    'content-roles': {
      title: 'Job Role Career Guides CMS',
      subtitle: 'Manage and publish 1,000+ role guides with structured industry salaries & responsibilities.'
    },
    'content-articles': {
      title: 'Career Articles & Knowledge Base',
      subtitle: 'Editorial publishing suite for blog articles, career advice, and SEO content.'
    },
    'taxonomies': {
      title: 'Directory Taxonomy & Classification',
      subtitle: 'Browse 35 industries, 120 departments, and 1,000+ standardized job roles.'
    },
    'audit-logs': {
      title: 'Immutable Security & Audit Logs',
      subtitle: 'Comprehensive audit trail of sensitive actions, status modifications, and security events.'
    },
    'admin-users': {
      title: 'Administrator Accounts & Permissions',
      subtitle: 'Manage administrative roles, security credentials, and system access levels.'
    },
    'settings': {
      title: 'Platform Configuration & Maintenance',
      subtitle: 'Global feature toggles, maintenance mode, upload limits, and SEO parameters.'
    }
  };

  const currentTitle = pageTitle || titles[effectiveNavId]?.title || 'Master Control Panel';
  const currentSubtitle = pageSubtitle || titles[effectiveNavId]?.subtitle;


  const navItems = [
    {
      group: 'Overview & Operations',
      items: [
        { id: 'dashboard' as AdminActiveNav, label: 'Master Dashboard', icon: LayoutDashboard },
        { 
          id: 'candidates' as AdminActiveNav, 
          label: 'Candidates', 
          icon: Users, 
          badge: badgeCounts?.candidates 
        },
        { 
          id: 'employers' as AdminActiveNav, 
          label: 'Employers & Orgs', 
          icon: Building2, 
          badge: badgeCounts?.employers 
        },
        { id: 'subscriptions' as AdminActiveNav, label: 'Plans & Billing', icon: CreditCard },
      ]
    },
    {
      group: 'Privacy & Moderation',
      items: [
        { id: 'unlocks' as AdminActiveNav, label: 'Contact & CV Unlocks', icon: Unlock },
        { 
          id: 'resumes' as AdminActiveNav, 
          label: 'Resume Moderation', 
          icon: FileText,
          badge: badgeCounts?.flaggedResumes ? `${badgeCounts.flaggedResumes} Flagged` : undefined,
          badgeColor: 'bg-amber-500 text-white'
        },
      ]
    },
    {
      group: 'CMS & Taxonomy',
      items: [
        { id: 'content-roles' as AdminActiveNav, label: 'Job Role Guides', icon: Sparkles },
        { id: 'content-articles' as AdminActiveNav, label: 'Articles & SEO', icon: FileText },
        { id: 'taxonomies' as AdminActiveNav, label: 'Directory Taxonomy', icon: Layers },
      ]
    },
    {
      group: 'Governance & System',
      items: [
        { id: 'audit-logs' as AdminActiveNav, label: 'Audit & Compliance', icon: ShieldAlert },
        { id: 'admin-users' as AdminActiveNav, label: 'Admin Accounts', icon: UserCheck },
        { id: 'settings' as AdminActiveNav, label: 'Platform Settings', icon: Settings },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/30">
              CP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white tracking-tight">Worldwide Candidate Portal</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  Master Control
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Central Platform Administration & Governance</p>
            </div>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => onNavigate('landing')}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
            title="Open Live Public Site"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </button>

          {/* Admin User Info */}
          <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white">{admin?.name || 'Administrator'}</div>
              <div className="text-[10px] text-blue-400 uppercase tracking-wider font-medium">
                {admin?.role?.replace('_', ' ') || 'Super Admin'}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-blue-400">
              {(admin?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition border border-slate-700/60"
              title="Sign Out of Admin Console"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-950 border-r border-slate-800 pt-16 md:pt-0 transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 flex flex-col ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
            {navItems.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
                  {group.group}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = effectiveNavId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (onSelectTab) {
                          // Map id to AdminTabType
                          const targetTab: AdminTabType = item.id === 'dashboard' ? 'overview' : item.id === 'admin-users' ? 'users' : item.id;
                          onSelectTab(targetTab);
                        }
                        if (onSelectNav) {
                          onSelectNav(item.id);
                        }
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition group ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 transition ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                            item.badgeColor || (isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-slate-400')
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Footer Info */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Platform Active
            </span>
            <span className="font-mono text-[10px] text-slate-400">v8.2.0</span>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          />
        )}

        {/* Content Body */}
        <main className="flex-1 bg-slate-900 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{currentTitle}</h1>
                {currentSubtitle && <p className="text-xs sm:text-sm text-slate-400 mt-1">{currentSubtitle}</p>}
              </div>
            </div>

            {/* Injected Tab Body */}
            <div>{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};
