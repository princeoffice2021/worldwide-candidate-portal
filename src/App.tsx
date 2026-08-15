import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './views/LandingPage';

// Lazy loaded views for route-level code splitting & optimal bundle performance
const PhoneLogin = lazy(() => import('./views/PhoneLogin').then(m => ({ default: m.PhoneLogin })));
const ProfileSetup = lazy(() => import('./views/ProfileSetup').then(m => ({ default: m.ProfileSetup })));
const Dashboard = lazy(() => import('./views/Dashboard').then(m => ({ default: m.Dashboard })));
const ProfileEdit = lazy(() => import('./views/ProfileEdit').then(m => ({ default: m.ProfileEdit })));
const FindCandidatesView = lazy(() => import('./views/FindCandidatesView').then(m => ({ default: m.FindCandidatesView })));
const PublicProfileView = lazy(() => import('./views/PublicProfileView').then(m => ({ default: m.PublicProfileView })));
const SubscriptionPlansView = lazy(() => import('./views/SubscriptionPlansView').then(m => ({ default: m.SubscriptionPlansView })));
const BlogHomeView = lazy(() => import('./views/BlogHomeView').then(m => ({ default: m.BlogHomeView })));
const ArticleDetailView = lazy(() => import('./views/ArticleDetailView').then(m => ({ default: m.ArticleDetailView })));
const AboutUsView = lazy(() => import('./views/AboutUsView').then(m => ({ default: m.AboutUsView })));
const PrivacyPolicyView = lazy(() => import('./views/PrivacyPolicyView').then(m => ({ default: m.PrivacyPolicyView })));
const TermsOfUseView = lazy(() => import('./views/TermsOfUseView').then(m => ({ default: m.TermsOfUseView })));
const ContactUsView = lazy(() => import('./views/ContactUsView').then(m => ({ default: m.ContactUsView })));
const IndustriesDirectoryView = lazy(() => import('./views/IndustriesDirectoryView').then(m => ({ default: m.IndustriesDirectoryView })));
const IndustryDetailView = lazy(() => import('./views/IndustryDetailView').then(m => ({ default: m.IndustryDetailView })));
const DepartmentDetailView = lazy(() => import('./views/DepartmentDetailView').then(m => ({ default: m.DepartmentDetailView })));
const CareerDetailView = lazy(() => import('./views/CareerDetailView').then(m => ({ default: m.CareerDetailView })));
const SitemapView = lazy(() => import('./views/SitemapView').then(m => ({ default: m.SitemapView })));
const AdminLoginView = lazy(() => import('./views/admin/AdminLoginView').then(m => ({ default: m.AdminLoginView })));
const AdminDashboardView = lazy(() => import('./views/admin/AdminDashboardView').then(m => ({ default: m.AdminDashboardView })));
const EmployerDashboardView = lazy(() => import('./views/EmployerDashboardView').then(m => ({ default: m.EmployerDashboardView })));
const CheckoutView = lazy(() => import('./views/CheckoutView').then(m => ({ default: m.CheckoutView })));
const InvoiceView = lazy(() => import('./views/InvoiceView').then(m => ({ default: m.InvoiceView })));

export interface CategoryFilterParams {
  industryId?: string;
  departmentId?: string;
  roleId?: string;
  keyword?: string;
}

const RouteLoadingSpinner = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-500">Loading page...</span>
    </div>
  </div>
);

export default function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [selectedDepartmentSlug, setSelectedDepartmentSlug] = useState<string>('');
  const [categoryFilters, setCategoryFilters] = useState<CategoryFilterParams>({});

  // Synchronize location path & query parameters for clean canonical URLs & legacy redirects
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const ind = searchParams.get('industry') || undefined;
      const dep = searchParams.get('department') || undefined;
      const rol = searchParams.get('role') || undefined;
      const kw = searchParams.get('keyword') || undefined;

      if (ind || dep || rol || kw) {
        setCategoryFilters({ industryId: ind, departmentId: dep, roleId: rol, keyword: kw });
      }

      if (path.startsWith('/candidates/')) {
        const slug = path.replace('/candidates/', '');
        if (slug) {
          setSelectedSlug(slug);
          setCurrentView('public-profile');
        }
      } else if (path.startsWith('/careers/')) {
        const slug = path.replace('/careers/', '');
        if (slug) {
          setSelectedSlug(slug);
          setCurrentView('career-detail');
        }
      } else if (path.startsWith('/industry/')) {
        const parts = path.replace('/industry/', '').split('/').filter(Boolean);
        if (parts.length >= 2) {
          setSelectedSlug(parts[0]);
          setSelectedDepartmentSlug(parts[1]);
          setCurrentView('department-detail');
        } else if (parts.length === 1) {
          setSelectedSlug(parts[0]);
          setCurrentView('industry-detail');
        } else {
          setCurrentView('industries');
        }
      } else if (path === '/industries') {
        setCurrentView('industries');
      } else if (path === '/sitemap' || path === '/sitemap.xml') {
        setCurrentView('sitemap');
      } else if (path === '/admin/login') {
        setCurrentView('admin-login');
      } else if (path === '/admin' || path.startsWith('/admin/')) {
        setCurrentView('admin-dashboard');
      } 
      // CANONICAL CAREER RESOURCES HUB & ARTICLES
      else if (path.startsWith('/career-resources/')) {
        const slug = path.replace('/career-resources/', '');
        if (slug) {
          setSelectedSlug(slug);
          setCurrentView('article-detail');
        } else {
          setCurrentView('career-resources');
        }
      } else if (path === '/career-resources') {
        setCurrentView('career-resources');
      }
      // LEGACY REDIRECT: /resources/:slug and /blog/:slug -> /career-resources/:slug
      else if (path.startsWith('/resources/') || path.startsWith('/blog/')) {
        const slug = path.replace(/^\/(resources|blog)\//, '');
        if (slug) {
          try {
            window.history.replaceState({}, '', `/career-resources/${slug}`);
          } catch {}
          setSelectedSlug(slug);
          setCurrentView('article-detail');
        } else {
          try {
            window.history.replaceState({}, '', '/career-resources');
          } catch {}
          setCurrentView('career-resources');
        }
      } 
      // LEGACY REDIRECT: /resources and /blog -> /career-resources
      else if (path === '/resources' || path === '/blog') {
        try {
          window.history.replaceState({}, '', '/career-resources');
        } catch {}
        setCurrentView('career-resources');
      } else if (path === '/about') {
        setCurrentView('about');
      } else if (path === '/privacy') {
        setCurrentView('privacy');
      } else if (path === '/terms') {
        setCurrentView('terms');
      } else if (path === '/contact') {
        setCurrentView('contact');
      } else if (path === '/find-candidates') {
        setCurrentView('find-candidates');
      } else if (path === '/employer/dashboard' || path === '/employer-dashboard') {
        setCurrentView('employer-dashboard');
      } else if (path === '/subscription-plans' || path === '/pricing') {
        setCurrentView('subscription-plans');
      } else if (path.startsWith('/checkout')) {
        const planParam = searchParams.get('plan_id') || undefined;
        if (planParam) setSelectedSlug(planParam);
        setCurrentView('checkout');
      } else if (path.startsWith('/invoices/') || path.startsWith('/invoice/')) {
        const invId = path.replace(/^\/(invoices|invoice)\//, '');
        if (invId) {
          setSelectedSlug(invId);
          setCurrentView('invoice');
        }
      } else if (path === '/login') {
        setCurrentView('login');
      } else if (path === '/candidate/dashboard') {
        setCurrentView('dashboard');
      } else if (path === '/candidate/setup') {
        setCurrentView('profile-setup');
      } else {
        setCurrentView('landing');
      }
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (
    view: string,
    slug?: string,
    filters?: CategoryFilterParams
  ) => {
    if (slug) {
      if (view === 'department-detail' && slug.includes('/')) {
        const [indSlug, deptSlug] = slug.split('/');
        setSelectedSlug(indSlug);
        setSelectedDepartmentSlug(deptSlug);
      } else {
        setSelectedSlug(slug);
      }
    }

    if (filters) {
      setCategoryFilters(filters);
    } else if (view !== 'find-candidates') {
      setCategoryFilters({});
    }

    setCurrentView(view);

    // Update browser history cleanly with canonical URLs
    let newPath = '/';
    if (view === 'public-profile' && slug) newPath = `/candidates/${slug}`;
    else if (view === 'career-detail' && slug) newPath = `/careers/${slug}`;
    else if (view === 'industry-detail' && slug) newPath = `/industry/${slug}`;
    else if (view === 'department-detail') {
      if (slug && slug.includes('/')) {
        newPath = `/industry/${slug}`;
      } else if (selectedSlug && selectedDepartmentSlug) {
        newPath = `/industry/${selectedSlug}/${selectedDepartmentSlug}`;
      }
    }
    else if (view === 'industries') newPath = '/industries';
    else if (view === 'sitemap') newPath = '/sitemap';
    else if (view === 'admin-login') newPath = '/admin/login';
    else if (view === 'admin-dashboard') newPath = '/admin';
    else if (view === 'article-detail' && slug) newPath = `/career-resources/${slug}`;
    else if (view === 'career-resources' || view === 'resources' || view === 'blog') newPath = '/career-resources';
    else if (view === 'about') newPath = '/about';
    else if (view === 'privacy') newPath = '/privacy';
    else if (view === 'terms') newPath = '/terms';
    else if (view === 'contact') newPath = '/contact';
    else if (view === 'find-candidates') newPath = '/find-candidates';
    else if (view === 'employer-dashboard') newPath = '/employer/dashboard';
    else if (view === 'subscription-plans') newPath = '/subscription-plans';
    else if (view === 'checkout') newPath = slug ? `/checkout?plan_id=${slug}` : '/checkout';
    else if (view === 'invoice' && slug) newPath = `/invoices/${slug}`;
    else if (view === 'login') newPath = '/login';
    else if (view === 'dashboard') newPath = '/candidate/dashboard';
    else if (view === 'profile-setup') newPath = '/candidate/setup';

    const url = new URL(window.location.origin + newPath);
    const activeFilters = filters || (view === 'find-candidates' ? categoryFilters : {});
    if (view === 'find-candidates' && activeFilters) {
      if (activeFilters.industryId) url.searchParams.set('industry', activeFilters.industryId);
      if (activeFilters.departmentId) url.searchParams.set('department', activeFilters.departmentId);
      if (activeFilters.roleId) url.searchParams.set('role', activeFilters.roleId);
      if (activeFilters.keyword) url.searchParams.set('keyword', activeFilters.keyword);
    }

    try {
      window.history.pushState({}, '', url.toString());
    } catch {}

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdminView = currentView === 'admin-dashboard' || currentView === 'admin-login';

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
        
        {/* Navigation Header (hidden inside admin dashboard for immersion) */}
        {!isAdminView && <Header currentView={currentView} onNavigate={handleNavigate} />}

        {/* Main View Router wrapped with Suspense */}
        <main className="flex-1">
          <Suspense fallback={<RouteLoadingSpinner />}>
            {currentView === 'landing' && <LandingPage onNavigate={handleNavigate} />}
            {currentView === 'login' && <PhoneLogin onNavigate={handleNavigate} />}
            {currentView === 'profile-setup' && <ProfileSetup onNavigate={handleNavigate} />}
            {currentView === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
            {currentView === 'profile-edit' && <ProfileEdit onNavigate={handleNavigate} />}
            {currentView === 'find-candidates' && (
              <FindCandidatesView onNavigate={handleNavigate} initialFilters={categoryFilters} />
            )}
            {currentView === 'employer-dashboard' && (
              <EmployerDashboardView onNavigate={handleNavigate} />
            )}
            {currentView === 'subscription-plans' && <SubscriptionPlansView onNavigate={handleNavigate} />}
            {currentView === 'checkout' && <CheckoutView planId={selectedSlug} onNavigate={handleNavigate} />}
            {currentView === 'invoice' && <InvoiceView invoiceId={selectedSlug} onNavigate={handleNavigate} />}
            {currentView === 'public-profile' && (
              <PublicProfileView slug={selectedSlug} onNavigate={handleNavigate} />
            )}
            
            {/* SEO Career Content Engine Views */}
            {currentView === 'industries' && (
              <IndustriesDirectoryView onNavigate={handleNavigate} />
            )}
            {currentView === 'industry-detail' && (
              <IndustryDetailView industrySlug={selectedSlug} onNavigate={handleNavigate} />
            )}
            {currentView === 'department-detail' && (
              <DepartmentDetailView 
                industrySlug={selectedSlug} 
                departmentSlug={selectedDepartmentSlug} 
                onNavigate={handleNavigate} 
              />
            )}
            {currentView === 'career-detail' && (
              <CareerDetailView roleSlug={selectedSlug} onNavigate={handleNavigate} />
            )}
            {currentView === 'sitemap' && (
              <SitemapView onNavigate={handleNavigate} />
            )}

            {/* Admin CMS Views */}
            {currentView === 'admin-login' && (
              <AdminLoginView onNavigate={handleNavigate} />
            )}
            {currentView === 'admin-dashboard' && (
              <AdminDashboardView onNavigate={handleNavigate} />
            )}

            {/* Canonical Career Resources & Article Views */}
            {(currentView === 'career-resources' || currentView === 'resources' || currentView === 'blog') && (
              <BlogHomeView onNavigate={handleNavigate} />
            )}
            {currentView === 'article-detail' && (
              <ArticleDetailView slug={selectedSlug} onNavigate={handleNavigate} />
            )}
            {currentView === 'about' && <AboutUsView onNavigate={handleNavigate} />}
            {currentView === 'privacy' && <PrivacyPolicyView onNavigate={handleNavigate} />}
            {currentView === 'terms' && <TermsOfUseView onNavigate={handleNavigate} />}
            {currentView === 'contact' && <ContactUsView onNavigate={handleNavigate} />}
          </Suspense>
        </main>

        {/* Global Footer (hidden on admin dashboard) */}
        {!isAdminView && <Footer onNavigate={handleNavigate} />}

      </div>
    </AuthProvider>
  );
}
