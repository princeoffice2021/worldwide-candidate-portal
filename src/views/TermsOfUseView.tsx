import React from 'react';
import { FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

interface TermsOfUseViewProps {
  onNavigate: (view: string) => void;
}

export const TermsOfUseView: React.FC<TermsOfUseViewProps> = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs space-y-6">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Platform Service Agreement</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms of Use</h1>
          <p className="text-xs text-slate-500">Effective Date: August 2026</p>

          <div className="prose prose-slate max-w-none space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-6">
            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">1. Candidate Terms</h3>
              <p>
                Candidates registering on Candidate Portal warrant that all provided work experience, education history, license details, and contact information are accurate and truthful. Creating misleading or fraudulent profiles is strictly prohibited.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">2. Employer Terms & Subscription Rules</h3>
              <p>
                Employers utilizing the portal agree to access candidate contact information solely for legitimate recruitment and hiring purposes. Unsolicited marketing, spam messaging, or unauthorized redistribution of candidate data is cause for immediate account termination without refund.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">3. Platform Intellectual Property</h3>
              <p>
                All brand marks, category taxonomies, design systems, and software code constituting Candidate Portal are protected intellectual property.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">4. Limitation of Liability</h3>
              <p>
                Candidate Portal serves as an introductory reverse job board. While candidate accounts are secured with unique phone authentication, employers remain responsible for conducting final background verification and credential checks prior to employment contract signing.
              </p>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
};
