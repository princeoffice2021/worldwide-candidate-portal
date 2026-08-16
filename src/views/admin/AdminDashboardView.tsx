import React, { useState, useEffect } from 'react';
import { isUserAdmin, logoutAdmin, getCurrentAdmin } from '../../lib/adminAuth';
import { updateDocumentSEO } from '../../lib/seo';
import { AdminLayout, AdminTabType } from './AdminLayout';
import { AdminMasterOverviewTab } from './tabs/AdminMasterOverviewTab';
import { AdminCandidatesTab } from './tabs/AdminCandidatesTab';
import { AdminEmployersTab } from './tabs/AdminEmployersTab';
import { AdminSubscriptionsTab } from './tabs/AdminSubscriptionsTab';
import { AdminUnlocksTab } from './tabs/AdminUnlocksTab';
import { AdminResumesTab } from './tabs/AdminResumesTab';
import { AdminJobRoleGuidesTab } from './tabs/AdminJobRoleGuidesTab';
import { AdminArticlesManagement } from './AdminArticlesManagement';
import { AdminTaxonomiesTab } from './tabs/AdminTaxonomiesTab';
import { AdminAuditLogsTab } from './tabs/AdminAuditLogsTab';
import { AdminUsersTab } from './tabs/AdminUsersTab';
import { AdminSettingsTab } from './tabs/AdminSettingsTab';

interface AdminDashboardViewProps {
  onNavigate: (view: string, slug?: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<AdminTabType>('overview');
  const admin = getCurrentAdmin();

  // Protect Admin Route
  useEffect(() => {
    updateDocumentSEO({
      title: 'Master Control Panel & Administration — Worldwide Candidate Portal',
      description: 'Centralized Administrative Control Panel, User Governance, Telemetry, and Platform Management.',
      noIndex: true
    });

    if (!isUserAdmin()) {
      onNavigate('admin-login');
    }
  }, [onNavigate]);

  const handleLogout = () => {
    logoutAdmin();
    onNavigate('home');
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <AdminMasterOverviewTab
            onNavigateTab={(tab) => setActiveTab(tab)}
            onNavigate={onNavigate}
          />
        );
      case 'candidates':
        return <AdminCandidatesTab onNavigate={onNavigate} />;
      case 'employers':
        return <AdminEmployersTab onNavigate={onNavigate} />;
      case 'subscriptions':
        return <AdminSubscriptionsTab />;
      case 'unlocks':
        return <AdminUnlocksTab />;
      case 'resumes':
        return <AdminResumesTab />;
      case 'content-roles':
        return <AdminJobRoleGuidesTab onNavigate={onNavigate} />;
      case 'content-articles':
        return <AdminArticlesManagement onNavigate={onNavigate} />;
      case 'taxonomies':
        return <AdminTaxonomiesTab />;
      case 'audit-logs':
        return <AdminAuditLogsTab />;
      case 'users':
        return <AdminUsersTab />;
      case 'settings':
        return <AdminSettingsTab />;
      default:
        return (
          <AdminMasterOverviewTab
            onNavigateTab={(tab) => setActiveTab(tab)}
            onNavigate={onNavigate}
          />
        );
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onNavigate={onNavigate}
      onLogout={handleLogout}
    >
      {renderActiveTabContent()}
    </AdminLayout>
  );
};
