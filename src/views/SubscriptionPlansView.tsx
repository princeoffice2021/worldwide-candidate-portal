import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_SUBSCRIPTION_PLANS } from '../lib/supabase';
import { EmployerAuthModal } from '../components/EmployerAuthModal';
import { 
  Check, 
  ShieldCheck, 
  Lock, 
  PhoneCall, 
  Building2, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  CreditCard,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

interface SubscriptionPlansViewProps {
  onNavigate: (view: string, slug?: string) => void;
}

export const SubscriptionPlansView: React.FC<SubscriptionPlansViewProps> = ({ onNavigate }) => {
  const { employer, employerSubscription } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [pendingPlanId, setPendingPlanId] = useState<string>('');

  const currentPlanId = employerSubscription?.plan_id || 'plan-free';
  const isYearly = billingCycle === 'yearly';

  const handleSelectPlan = (planId: string) => {
    if (planId === 'plan-free') {
      if (employer) {
        onNavigate('find-candidates');
      } else {
        setShowAuthModal(true);
      }
      return;
    }

    if (!employer) {
      setPendingPlanId(planId);
      setShowAuthModal(true);
      return;
    }

    // Navigate to dedicated secure Checkout View
    onNavigate('checkout', `${planId}&interval=${billingCycle}`);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (pendingPlanId && pendingPlanId !== 'plan-free') {
      onNavigate('checkout', `${pendingPlanId}&interval=${billingCycle}`);
    } else {
      onNavigate('find-candidates');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Transparent Pricing for Employers
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Worldwide Candidate Contact Subscriptions
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Directly connect with top verified talent. Unlock masked phone numbers, access complete resumes, and initiate instant WhatsApp chats.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="pt-4 flex items-center justify-center">
            <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center space-x-1 shadow-inner">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  !isYearly
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  isYearly
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual Billing</span>
                <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">Save 20%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Employer Session Status Bar */}
        {employer ? (
          <div className="max-w-3xl mx-auto bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Signed in as: <span className="text-blue-600">{employer.full_name}</span> ({employer.company_name})
                </p>
                <p className="text-[11px] text-slate-500">
                  Active Plan: <span className="font-bold text-emerald-700">{employerSubscription?.plan?.name || 'Free Employer'}</span>
                  {employerSubscription?.status && ` (${employerSubscription.status.toUpperCase()})`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigate('employer-dashboard')}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
              >
                Employer Portal
              </button>
              <button
                onClick={() => onNavigate('find-candidates')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
              >
                Search Candidates
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-blue-50/80 p-4 rounded-2xl border border-blue-200 text-center space-y-2">
            <p className="text-xs text-slate-700 font-medium">
              Are you an employer looking to contact candidates?
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-xs inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Sign In / Register as Employer</span>
            </button>
          </div>
        )}

        {/* PRICING CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {DEFAULT_SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            const isPro = plan.slug === 'pro';
            const basePrice = plan.amount || plan.price;
            const displayPrice = isYearly && basePrice > 0 
              ? Math.round(basePrice * 0.8) 
              : basePrice;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl border p-6 flex flex-col justify-between transition relative ${
                  isPro
                    ? 'border-blue-600 shadow-xl ring-2 ring-blue-600/20'
                    : 'border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Popular Badge */}
                {isPro && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] uppercase font-extrabold px-3 py-1 rounded-full shadow-xs flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Most Popular Choice</span>
                  </div>
                )}

                <div>
                  {/* Plan Name & Desc */}
                  <h3 className="text-base font-extrabold text-slate-900">{plan.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>

                  {/* Price Header */}
                  <div className="my-5 pb-4 border-b border-slate-100">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-black text-slate-900">
                        {displayPrice === 0 ? '$0' : `$${displayPrice}`}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">/ month</span>
                    </div>
                    {isYearly && basePrice > 0 ? (
                      <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                        Billed annually (${Math.round(displayPrice * 12)}/year)
                      </span>
                    ) : basePrice > 0 ? (
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        (Approx. ₹{(basePrice * 83).toLocaleString()}/mo)
                      </span>
                    ) : null}
                  </div>

                  {/* Features List */}
                  <ul className="space-y-2.5 text-xs font-medium text-slate-700 mb-6">
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Worldwide Candidate Search</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Industry & City Level Filters</span>
                    </li>

                    <li className="flex items-center space-x-2">
                      {plan.phone_access_enabled ? (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className={plan.phone_access_enabled ? 'font-bold text-slate-900' : 'text-slate-400 line-through'}>
                        {plan.contact_limit === 9999
                          ? 'Unlimited Phone Contacts'
                          : plan.contact_limit === 0
                          ? 'Phone Numbers Masked (98765 XXXXX)'
                          : `${plan.contact_limit} Candidate Phone Unlocks / Month`}
                      </span>
                    </li>

                    <li className="flex items-center space-x-2">
                      {plan.phone_access_enabled ? (
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className={plan.phone_access_enabled ? 'font-bold text-slate-900' : 'text-slate-400'}>
                        {plan.resume_access_limit === 9999
                          ? 'Unlimited Resume Views'
                          : plan.resume_access_limit === 0
                          ? 'Resume Access Locked'
                          : `${plan.resume_access_limit || plan.contact_limit} Resume Full Downloads / Mo`}
                      </span>
                    </li>

                    <li className="flex items-center space-x-2">
                      {plan.phone_access_enabled ? (
                        <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className={plan.phone_access_enabled ? 'text-slate-800' : 'text-slate-400'}>
                        Direct Phone Call & WhatsApp
                      </span>
                    </li>

                    <li className="flex items-center space-x-2">
                      {plan.advanced_filters_enabled ? (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className={plan.advanced_filters_enabled ? 'text-slate-800' : 'text-slate-400'}>
                        Saved Talent Shortlists & Notes
                      </span>
                    </li>
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isCurrent}
                  className={`w-full font-extrabold text-xs py-3.5 rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center space-x-1.5 ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-500 cursor-default'
                      : isPro
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Current Active Plan</span>
                    </>
                  ) : plan.price === 0 ? (
                    <span>Get Started Free</span>
                  ) : (
                    <>
                      <span>Continue to Checkout</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

              </div>
            );
          })}
        </div>

        {/* FAQ & Billing Assurances */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center space-x-2 text-blue-600">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="text-xs font-bold text-slate-900">Immediate Quota Activation</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upon checkout completion, your phone and resume unlock balances are credited to your account immediately.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center space-x-2 text-blue-600">
              <CreditCard className="w-5 h-5" />
              <h4 className="text-xs font-bold text-slate-900">Official Tax Invoices</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Download VAT/GST compliant snapshot invoices with full employer tax details directly from your dashboard anytime.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center space-x-2 text-blue-600">
              <HelpCircle className="w-5 h-5" />
              <h4 className="text-xs font-bold text-slate-900">Fair Usage & Replacement</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Unlocking the same candidate profile more than once will never deduct additional quotas from your monthly balance.
            </p>
          </div>
        </div>

        {/* Employer Auth Modal */}
        <EmployerAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />

      </div>
    </div>
  );
};
