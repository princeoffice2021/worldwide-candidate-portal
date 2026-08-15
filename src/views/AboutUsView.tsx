import React from 'react';
import { Briefcase, Building2, Globe, ShieldCheck, Users, CheckCircle2, UserCheck } from 'lucide-react';

interface AboutUsViewProps {
  onNavigate: (view: string) => void;
}

export const AboutUsView: React.FC<AboutUsViewProps> = ({ onNavigate }) => {
  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-blue-400/30">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>Worldwide Candidate Discovery</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Connecting Skilled People with Global Employers
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Candidate Portal is an international reverse job board platform designed to empower skilled candidates to publish verified professional profiles and connect directly with businesses worldwide.
          </p>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">For Candidates</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We give skilled workers across 35+ industry sectors a transparent platform to showcase their verified work experience, availability status, and preferred work locations without paywalls.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">For Employers</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Employers gain instant access to structured, searchable candidate records across 1,000+ job roles, complete with verified contact capabilities and location filters.
            </p>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900">Why Choose Candidate Portal</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Phone Protection</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Candidate phone numbers remain protected and are only accessible by verified, subscribed employers.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Verified Profiles</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Unique phone credentials and secure password access guarantee that every candidate profile corresponds to an active account.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Globe className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Global Reach</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Covering candidates and hiring markets in India, UAE, KSA, USA, Canada, UK, Australia, and worldwide.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <UserCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Real-Time Availability</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Candidates update their availability status in real-time to alert employers when they are ready for immediate hire.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 text-center space-y-4">
          <h3 className="text-xl font-bold">Join the Worldwide Talent Network</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Create your free profile today or start discovering qualified professionals for your business.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => onNavigate('login')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer"
            >
              Create Candidate Profile
            </button>
            <button
              onClick={() => onNavigate('find-candidates')}
              className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer"
            >
              Find Candidates
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
