import React from 'react';
import { Briefcase, Building2, ShieldCheck, BookOpen, Compass, Map } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white border border-blue-500/30 shadow-xs">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">Candidate Portal</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Worldwide candidate discovery platform enabling skilled workers to publish professional profiles and connect with employers globally across 35+ industries and 1,000+ professions.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Phone Protection & Verified Candidates</span>
            </div>
          </div>

          {/* Col 2: Candidates */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">For Candidates</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-blue-400 transition cursor-pointer">
                  Create Free Candidate Profile
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-blue-400 transition cursor-pointer">
                  Update Availability Status
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('industries')} className="hover:text-blue-400 transition flex items-center space-x-1 cursor-pointer">
                  <Compass className="w-3.5 h-3.5 text-blue-400" />
                  <span>Explore 35+ Industries</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('career-resources')} className="hover:text-blue-400 transition flex items-center space-x-1 cursor-pointer">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>Career Resources & Guides</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('landing')} className="hover:text-blue-400 transition cursor-pointer">
                  How Candidate Portal Works
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Employers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">For Employers</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li>
                <button onClick={() => onNavigate('find-candidates')} className="hover:text-blue-400 transition cursor-pointer">
                  Search Candidates by Skill
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('find-candidates')} className="hover:text-blue-400 transition cursor-pointer">
                  Browse 1,000+ Professions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('subscription-plans')} className="hover:text-amber-300 transition font-bold text-amber-400 cursor-pointer">
                  Employer Subscription Plans
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company & Legal</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-blue-400 transition cursor-pointer">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-blue-400 transition cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms')} className="hover:text-blue-400 transition cursor-pointer">
                  Terms of Use
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('sitemap')} className="hover:text-blue-400 transition cursor-pointer">
                  Sitemap
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-blue-400 transition cursor-pointer">
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Global Reach Row */}
        <div className="py-4 border-t border-b border-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span className="font-bold text-slate-300">Worldwide Markets Covered:</span>
          <div className="flex flex-wrap gap-2 text-[11px] font-medium text-slate-300">
            <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">🇮🇳 India</span>
            <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">🇦🇪 UAE</span>
            <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">🇸🇦 KSA</span>
            <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">🇺🇸 USA</span>
            <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">🇨🇦 Canada</span>
            <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">🇬🇧 UK</span>
            <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">🇦🇺 Australia</span>
          </div>
        </div>

        {/* Bottom Bar with Hidden Admin Access Dot */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-3 sm:space-y-0">
          <div>
            © {new Date().getFullYear()} Candidate Portal. Find Skilled People. Anywhere. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => onNavigate('privacy')} className="hover:underline">Privacy</button>
            <button onClick={() => onNavigate('terms')} className="hover:underline">Terms</button>
            <button onClick={() => onNavigate('sitemap')} className="hover:underline">Sitemap</button>
            <button onClick={() => onNavigate('contact')} className="hover:underline">Contact</button>
            
            {/* Subtle, discreet hidden administrator dot in the corner */}
            <button 
              onClick={() => onNavigate('admin-login')} 
              aria-label="Administrator access"
              className="text-slate-800 hover:text-slate-500 transition cursor-pointer text-xs p-1 focus:outline-none"
              title="Portal Management"
            >
              •
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
