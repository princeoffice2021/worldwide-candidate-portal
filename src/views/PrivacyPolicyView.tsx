import React from 'react';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

interface PrivacyPolicyViewProps {
  onNavigate: (view: string) => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs space-y-6">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Data Privacy & Security Standard</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-500">Last updated: August 2026</p>

          <div className="prose prose-slate max-w-none space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-6">
            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>1. Information We Collect</span>
              </h3>
              <p>
                When candidates register on Candidate Portal, we collect necessary professional profile information, including full name, phone number (used for account authentication and employer contact), primary profession, skills, work experience, education, preferred locations, and availability status.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>2. Phone Number Protection & Visibility</span>
              </h3>
              <p>
                Candidate phone numbers are protected and obscured from public view. Phone numbers are only visible to verified employers holding active employer subscription plans on our platform. We never sell or lease candidate phone numbers to third-party marketing brokers.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>3. How We Use Profile Information</span>
              </h3>
              <p>
                We process candidate profile data to enable employer search indexing across industries and job roles, facilitate direct hiring connections, improve portal performance, and deliver account security alerts.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">4. Profile Deletion & Control</h3>
              <p>
                Candidates maintain complete ownership of their profiles and may update, deactivate, or request permanent deletion of their account records at any time directly through their candidate dashboard.
              </p>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
};
