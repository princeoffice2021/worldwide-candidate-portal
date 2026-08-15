import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_SUBSCRIPTION_PLANS } from '../lib/supabase';
import { api } from '../lib/apiClient';
import { EmployerAuthModal } from '../components/EmployerAuthModal';
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Building2, 
  FileText, 
  Zap, 
  Percent, 
  RefreshCw,
  Sparkles,
  PhoneCall,
  UserCheck
} from 'lucide-react';

interface CheckoutViewProps {
  onNavigate: (view: string, slug?: string) => void;
  planId?: string;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onNavigate, planId: propPlanId }) => {
  const { employer, refreshEmployerState } = useAuth();
  
  // URL Query Params or prop
  const urlParams = new URLSearchParams(window.location.search);
  const initialPlanId = propPlanId || urlParams.get('plan_id') || 'plan-pro';
  const initialInterval = (urlParams.get('interval') as 'monthly' | 'yearly') || 'monthly';

  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlanId);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>(initialInterval);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  
  // Billing customer info
  const [customerName, setCustomerName] = useState<string>(employer?.full_name || '');
  const [companyName, setCompanyName] = useState<string>(employer?.company_name || '');
  const [customerEmail, setCustomerEmail] = useState<string>(employer?.email || '');
  const [customerPhone, setCustomerPhone] = useState<string>(employer?.phone_number || '');
  const [taxId, setTaxId] = useState<string>('');
  const [billingAddress, setBillingAddress] = useState<string>('123 Enterprise Blvd, Suite 400');
  const [billingCountry, setBillingCountry] = useState<string>('United States');

  // Payment Provider / Simulation State
  const [selectedProvider, setSelectedProvider] = useState<string>('development');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [simulatedTestOutcome, setSimulatedTestOutcome] = useState<'SUCCEEDED' | 'FAILED'>('SUCCEEDED');

  useEffect(() => {
    if (employer) {
      if (!customerName) setCustomerName(employer.full_name || employer.company_name);
      if (!companyName) setCompanyName(employer.company_name);
      if (!customerEmail && employer.email) setCustomerEmail(employer.email);
      if (!customerPhone && employer.phone_number) setCustomerPhone(employer.phone_number);
    }
  }, [employer]);

  // Find selected plan
  const plan = DEFAULT_SUBSCRIPTION_PLANS.find(p => p.id === selectedPlanId) || DEFAULT_SUBSCRIPTION_PLANS[1];

  // Pricing calculations
  const basePrice = plan.amount || plan.price || 0;
  const isYearly = billingInterval === 'yearly';
  // Annual 20% discount on total 12 months
  const yearlyBase = basePrice * 12;
  const discountRate = isYearly ? 0.20 : 0;
  const subtotal = isYearly ? yearlyBase * (1 - discountRate) : basePrice;
  const taxRate = 0.18; // 18% standard VAT/GST
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!employer) {
      setShowAuthModal(true);
      return;
    }

    if (!customerName || !companyName) {
      setErrorMsg('Please provide your name and company name.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create Server Checkout Session (Idempotent)
      const idempotencyKey = `chk_${employer.id}_${selectedPlanId}_${billingInterval}_${Date.now()}`;
      const sessionRes = await api.createCheckoutSession({
        employer_id: employer.id,
        plan_id: plan.id,
        billing_interval: billingInterval,
        currency: plan.currency || 'USD',
        idempotency_key: idempotencyKey,
        provider: selectedProvider,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone
      });

      if (!sessionRes.success || !sessionRes.data) {
        throw new Error(sessionRes.error || 'Failed to initialize payment order');
      }

      const session = sessionRes.data;

      // 2. Finalize / Verify Payment
      // In development mode or test simulator, we verify via backend finalize endpoint
      const finalizeRes = await api.finalizePayment({
        payment_id: session.payment_id,
        provider_order_id: session.provider_order_id,
        provider_payment_id: `pay_sim_${Date.now()}`,
        provider_signature: `sig_${Math.random().toString(36).substring(2, 10)}`,
        simulated_status: simulatedTestOutcome,
        failure_reason: simulatedTestOutcome === 'FAILED' ? 'Card declined / Simulated payment failure' : undefined
      });

      if (!finalizeRes.success || finalizeRes.status === 'FAILED') {
        throw new Error(finalizeRes.error || finalizeRes.message || 'Payment was declined or failed.');
      }

      // 3. Refresh auth context state & navigate to invoice receipt
      await refreshEmployerState();
      
      if (finalizeRes.invoice?.id) {
        onNavigate('invoice', finalizeRes.invoice.id);
      } else {
        onNavigate('employer-dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Checkout encountered an error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Back Link */}
        <button
          onClick={() => onNavigate('subscription-plans')}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Subscription Plans</span>
        </button>

        {/* Header */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 border border-blue-200 px-2.5 py-0.5 rounded-full">
            Secure 256-bit Encrypted Checkout
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Complete Your Employer Subscription
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Unlock direct candidate phone contacts, verified resumes, and priority search quotas instantly.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-300 text-rose-800 p-4 rounded-2xl text-xs font-semibold flex items-start space-x-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Payment Notification</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Billing Details & Payment Provider Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Interval & Plan Selection */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-black">1</span>
                  <span>Select Billing Cycle</span>
                </h2>
                {isYearly && (
                  <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Save 20% Annual Discount</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setBillingInterval('monthly')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                    billingInterval === 'monthly'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Monthly Billing</span>
                  <span className="text-[10px] text-slate-400 font-normal">Flexible, cancel anytime</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBillingInterval('yearly')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                    billingInterval === 'yearly'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <span>Annual Billing</span>
                    <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-black">-20%</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Billed annually</span>
                </button>
              </div>

              {/* Plan Switcher Pills */}
              <div className="pt-2">
                <label className="text-[11px] font-bold text-slate-700 block mb-2">Switch Selected Plan:</label>
                <div className="grid grid-cols-3 gap-2">
                  {DEFAULT_SUBSCRIPTION_PLANS.filter(p => p.price > 0).map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlanId(p.id)}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                        selectedPlanId === p.id
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <p className="text-xs font-extrabold text-slate-900">{p.name}</p>
                      <p className="text-[11px] text-blue-600 font-black mt-0.5">${p.price}/mo</p>
                      <p className="text-[10px] text-slate-500 mt-1">{p.contact_limit} contacts</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Employer Billing Contact Form */}
            <form onSubmit={handleCheckoutSubmit} className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-black">2</span>
                  <span>Employer & Invoice Information</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Company / Organization *</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Recruitment Corp"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-slate-50/50 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Billing Contact Person *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-slate-50/50 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Billing Email (for Invoices) *</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="billing@acme.com"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-slate-50/50 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-slate-50/50 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Tax / VAT ID (Optional)</label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="e.g. US-EIN-98-7654321 or GSTIN27AAAAA0000A1Z5"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-slate-50/50 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Billing Address</label>
                    <input
                      type="text"
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                      placeholder="Street address, Suite, City, State"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-slate-50/50 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Gateway & Simulation Selector */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-black">3</span>
                    <span>Payment Method</span>
                  </h2>
                  <div className="flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    <Lock className="w-3 h-3" />
                    <span>PCI-DSS Compliant</span>
                  </div>
                </div>

                {/* Gateway Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className={`border rounded-2xl p-3 cursor-pointer flex flex-col justify-between transition ${
                    selectedProvider === 'development'
                      ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="payment_provider"
                        value="development"
                        checked={selectedProvider === 'development'}
                        onChange={() => setSelectedProvider('development')}
                        className="text-blue-600"
                      />
                      <span className="text-xs font-bold text-slate-900">Test Simulator</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2">Instant sandbox sandbox testing</span>
                  </label>

                  <label className={`border rounded-2xl p-3 cursor-pointer flex flex-col justify-between transition ${
                    selectedProvider === 'stripe'
                      ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="payment_provider"
                        value="stripe"
                        checked={selectedProvider === 'stripe'}
                        onChange={() => setSelectedProvider('stripe')}
                        className="text-blue-600"
                      />
                      <span className="text-xs font-bold text-slate-900">Stripe Global</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2">Visa, MC, Amex, Apple Pay</span>
                  </label>

                  <label className={`border rounded-2xl p-3 cursor-pointer flex flex-col justify-between transition ${
                    selectedProvider === 'razorpay'
                      ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="payment_provider"
                        value="razorpay"
                        checked={selectedProvider === 'razorpay'}
                        onChange={() => setSelectedProvider('razorpay')}
                        className="text-blue-600"
                      />
                      <span className="text-xs font-bold text-slate-900">Razorpay / UPI</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2">Cards, UPI, Netbanking</span>
                  </label>
                </div>

                {/* Simulator Tester Controller */}
                {selectedProvider === 'development' && (
                  <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-900 flex items-center space-x-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>Development Sandbox Tester Outcome:</span>
                      </span>
                    </div>
                    <div className="flex space-x-3">
                      <label className="flex items-center space-x-1.5 text-xs text-slate-700 cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="sim_outcome"
                          value="SUCCEEDED"
                          checked={simulatedTestOutcome === 'SUCCEEDED'}
                          onChange={() => setSimulatedTestOutcome('SUCCEEDED')}
                          className="text-emerald-600"
                        />
                        <span className="text-emerald-700 font-bold">Simulate Success (Instant Activation)</span>
                      </label>
                      <label className="flex items-center space-x-1.5 text-xs text-slate-700 cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="sim_outcome"
                          value="FAILED"
                          checked={simulatedTestOutcome === 'FAILED'}
                          onChange={() => setSimulatedTestOutcome('FAILED')}
                          className="text-rose-600"
                        />
                        <span className="text-rose-700 font-bold">Simulate Decline</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Card input mockup (PCI compliant display) */}
                <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Encrypted Card Entry</span>
                    <CreditCard className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="bg-white border border-slate-300 px-3 py-2 rounded-xl text-xs font-mono text-slate-800 tracking-wider">
                    •••• •••• •••• 4242 &nbsp;&nbsp;|&nbsp;&nbsp; 12/28 &nbsp;&nbsp;|&nbsp;&nbsp; CVC: •••
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-4 rounded-2xl transition shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Secure Authorization...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Authorize & Pay ${totalAmount} {plan.currency || 'USD'}</span>
                  </>
                )}
              </button>
            </form>

          </div>

          {/* RIGHT: Order Summary & Guarantee (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Order Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-[11px] font-mono text-slate-400">ID: {plan.code || plan.slug}</span>
              </h3>

              {/* Plan Snapshot */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">{plan.name}</h4>
                  <p className="text-[11px] text-slate-500 capitalize">{billingInterval} Subscription</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900">
                    ${isYearly ? yearlyBase : basePrice}
                  </span>
                </div>
              </div>

              {/* Features Included */}
              <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-700">
                <div className="flex items-center space-x-2">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>{plan.contact_limit}</strong> Candidate Phone Number Unlocks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>{plan.resume_access_limit || plan.contact_limit}</strong> Resume / CV Full Document Views</span>
                </div>
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Worldwide Search & Direct WhatsApp Messaging</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Official Snapshot Invoice & Tax Receipt</span>
                </div>
              </div>

              {/* Cost Calculations */}
              <div className="space-y-2 text-xs">
                {isYearly && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Annual Discount (20%)</span>
                    <span>-${Math.round(yearlyBase * 0.20 * 100) / 100}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Standard VAT / GST (18%)</span>
                  <span>${taxAmount}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-extrabold text-base pt-2 border-t border-slate-200">
                  <span>Total Due Today</span>
                  <span className="text-blue-600">${totalAmount} {plan.currency || 'USD'}</span>
                </div>
              </div>
            </div>

            {/* Guarantee Badge */}
            <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xs space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Candidate Portal Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                All candidates are verified before profile activation. If any candidate contact number is invalid, our automated replacement policy credits back your unlock quota immediately.
              </p>
            </div>

          </div>

        </div>

        {/* Employer Auth Modal */}
        <EmployerAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
          }}
        />

      </div>
    </div>
  );
};
