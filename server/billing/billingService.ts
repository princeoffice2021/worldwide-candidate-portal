import crypto from 'crypto';
import { 
  getCentralDb, 
  persistDbToDisk, 
  subscriptionPlanRepository, 
  employerRepository, 
  employerSubscriptionRepository, 
  paymentRepository, 
  invoiceRepository, 
  auditLogRepository 
} from '../db';
import { getPaymentProvider, IPaymentProvider } from './paymentProvider';

export interface CreateCheckoutSessionRequest {
  idempotencyKey?: string;
  employerId: string;
  planId: string;
  billingInterval?: 'monthly' | 'yearly' | 'one_time';
  currency?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  provider?: string;
}

export interface FinalizePaymentRequest {
  paymentId: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  providerSignature?: string;
  simulatedStatus?: 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  failureReason?: string;
}

export class BillingService {
  /**
   * Calculate precise server-authoritative pricing for any plan.
   * Prevents client-side price manipulation.
   */
  public calculateServerPrice(plan: any, interval: 'monthly' | 'yearly' | 'one_time' = 'monthly') {
    let baseAmount = plan.amount !== undefined ? Number(plan.amount) : Number(plan.price || 0);

    // Apply yearly discount (e.g. 2 months free / ~17% off) if interval is yearly
    if (interval === 'yearly') {
      baseAmount = Math.round(baseAmount * 10); // 10 months price for 12 months
    }

    const discountAmount = 0;
    const taxableAmount = Math.max(0, baseAmount - discountAmount);
    // Standard tax calculation (can be 0 or 18% based on region/config)
    const taxAmount = Math.round(taxableAmount * 0.0); 
    const totalAmount = taxableAmount + taxAmount;

    return {
      subtotal: baseAmount,
      discount: discountAmount,
      tax: taxAmount,
      total: totalAmount,
      currency: plan.currency || 'USD'
    };
  }

  /**
   * Create a centralized payment transaction order with idempotency protection.
   */
  public async createPaymentOrder(req: CreateCheckoutSessionRequest) {
    const db = getCentralDb();
    
    // 1. Verify Employer
    const employer = employerRepository.getById(req.employerId);
    if (!employer) {
      throw new Error('Employer account not found. Please log in first.');
    }

    // 2. Verify Plan
    const plan = subscriptionPlanRepository.getById(req.planId);
    if (!plan || plan.is_active === false) {
      throw new Error('Selected subscription plan is not available or inactive.');
    }

    const interval = req.billingInterval || plan.billing_interval || 'monthly';
    const pricing = this.calculateServerPrice(plan, interval);

    // 3. Check for Idempotency
    const idempotencyKey = req.idempotencyKey || `idem_${req.employerId}_${plan.id}_${Date.now()}`;
    const existingPayment = paymentRepository.getByIdempotencyKey(idempotencyKey);

    if (existingPayment && (existingPayment.status === 'CREATED' || existingPayment.status === 'PENDING')) {
      return {
        payment: existingPayment,
        isExisting: true,
        orderId: existingPayment.provider_order_id,
        checkoutUrl: `/checkout?order_id=${existingPayment.provider_order_id}`
      };
    }

    // 4. Special Case: Free Plan Zero-Amount Instant Activation
    if (pricing.total === 0) {
      const freeSub = employerSubscriptionRepository.subscribe(employer.id, plan.id);
      return {
        isFreePlan: true,
        success: true,
        subscription: freeSub.subscription,
        message: 'Free tier activated successfully.'
      };
    }

    // 5. Initialize payment provider
    const providerName = req.provider || process.env.PAYMENT_PROVIDER || 'development';
    const provider: IPaymentProvider = getPaymentProvider(providerName);

    const providerOrder = await provider.createOrder({
      idempotencyKey,
      employerId: employer.id,
      planId: plan.id,
      planCode: plan.code || plan.slug || 'STANDARD',
      planName: plan.name,
      amount: pricing.total,
      currency: pricing.currency,
      billingInterval: interval,
      customerName: req.customerName || employer.contact_person_name || employer.full_name || 'Employer',
      customerEmail: req.customerEmail || employer.email || employer.business_email,
      customerPhone: req.customerPhone || employer.phone_number
    });

    if (!providerOrder.success) {
      throw new Error(providerOrder.errorMessage || 'Failed to initialize payment gateway order.');
    }

    // 6. Create internal payment record in database
    const paymentRecord = {
      id: `pay_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      payment_reference: `PAY-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      idempotency_key: idempotencyKey,
      employer_id: employer.id,
      subscription_id: '', // Will link on activation
      plan_id: plan.id,
      plan_code: plan.code || plan.slug || 'STANDARD',
      provider: provider.providerName,
      provider_order_id: providerOrder.providerOrderId,
      provider_payment_id: providerOrder.providerPaymentId,
      currency: pricing.currency,
      amount: pricing.subtotal,
      discount_amount: pricing.discount,
      tax_amount: pricing.tax,
      total_amount: pricing.total,
      billing_interval: interval,
      status: 'PENDING',
      provider_response_safe: providerOrder.rawResponse || {}
    };

    const savedPayment = paymentRepository.create(paymentRecord);

    auditLogRepository.record({
      actor_type: 'employer',
      actor_id: employer.id,
      actor_name: employer.contact_person_name || employer.full_name || 'Employer',
      action: 'PAYMENT_ORDER_CREATED',
      target_type: 'payment',
      target_id: savedPayment.payment.id,
      metadata: {
        payment_reference: savedPayment.payment.payment_reference,
        amount: pricing.total,
        currency: pricing.currency,
        plan_id: plan.id,
        plan_name: plan.name,
        provider: provider.providerName
      }
    });

    return {
      payment: savedPayment.payment,
      providerOrder,
      isExisting: false
    };
  }

  /**
   * Finalize and verify payment.
   * Strictly idempotent: prevents double activations, duplicate quota additions, and duplicate invoices.
   */
  public async finalizePayment(req: FinalizePaymentRequest) {
    const payment = paymentRepository.getById(req.paymentId);
    if (!payment) {
      throw new Error('Payment record not found.');
    }

    // Idempotency check: If already completed, return existing success state safely
    if (payment.status === 'SUCCEEDED') {
      const existingSub = employerSubscriptionRepository.getByEmployerId(payment.employer_id);
      const existingInvoice = invoiceRepository.getByPaymentId(payment.id);
      return {
        success: true,
        alreadyFinalized: true,
        status: 'SUCCEEDED',
        message: 'Payment has already been confirmed and subscription is active.',
        payment,
        subscription: existingSub,
        invoice: existingInvoice
      };
    }

    const provider: IPaymentProvider = getPaymentProvider(payment.provider);
    const verification = await provider.verifyPayment({
      providerOrderId: req.providerOrderId || payment.provider_order_id,
      providerPaymentId: req.providerPaymentId || payment.provider_payment_id,
      providerSignature: req.providerSignature,
      simulatedStatus: req.simulatedStatus,
      failureReason: req.failureReason
    });

    const now = new Date().toISOString();

    // 1. Handle Failed Verification
    if (!verification.isVerified || verification.status === 'FAILED') {
      paymentRepository.update(payment.id, {
        status: 'FAILED',
        failed_at: now,
        failure_code: verification.failureCode || 'PAYMENT_VERIFICATION_FAILED',
        failure_message: verification.failureMessage || 'Payment could not be verified by the provider.',
        provider_response_safe: verification.rawResponse || {}
      });

      auditLogRepository.record({
        actor_type: 'employer',
        actor_id: payment.employer_id,
        actor_name: 'Employer Account',
        action: 'PAYMENT_FAILED',
        target_type: 'payment',
        target_id: payment.id,
        metadata: {
          payment_reference: payment.payment_reference,
          failure_message: verification.failureMessage
        }
      });

      return {
        success: false,
        status: 'FAILED',
        message: verification.failureMessage || 'Payment failed or was declined by the bank.',
        payment: paymentRepository.getById(payment.id)
      };
    }

    // 2. Handle Cancelled Payment
    if (verification.status === 'CANCELLED') {
      paymentRepository.update(payment.id, {
        status: 'CANCELLED',
        cancelled_at: now,
        failure_message: 'Payment process was cancelled by user.',
        provider_response_safe: verification.rawResponse || {}
      });

      auditLogRepository.record({
        actor_type: 'employer',
        actor_id: payment.employer_id,
        actor_name: 'Employer Account',
        action: 'PAYMENT_CANCELLED',
        target_type: 'payment',
        target_id: payment.id,
        metadata: { payment_reference: payment.payment_reference }
      });

      return {
        success: false,
        status: 'CANCELLED',
        message: 'Payment checkout was cancelled.',
        payment: paymentRepository.getById(payment.id)
      };
    }

    // 3. Handle Succeeded Payment
    const db = getCentralDb();
    const plan = subscriptionPlanRepository.getById(payment.plan_id) || db.subscription_plans?.find(p => p.id === payment.plan_id);
    if (!plan) {
      throw new Error('Subscription plan attached to payment was not found in catalog.');
    }

    // Calculate subscription period
    const interval = payment.billing_interval || 'monthly';
    const periodDays = interval === 'yearly' ? 365 : 30;
    const periodStart = now;
    const periodEnd = new Date(Date.now() + periodDays * 86400000).toISOString();

    const contactLimit = plan.contact_limit ?? plan.contact_access_limit ?? 0;
    const resumeLimit = plan.resume_access_limit ?? contactLimit;

    // Create or update employer subscription
    const subRecord = {
      id: `sub_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      employer_id: payment.employer_id,
      plan_id: plan.id,
      plan_code: plan.code || plan.slug || 'STANDARD',
      plan: plan,
      status: 'ACTIVE',
      started_at: periodStart,
      expires_at: periodEnd,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
      contact_unlock_limit: contactLimit,
      contact_access_limit: contactLimit,
      contacts_used_this_period: 0,
      resume_access_limit: resumeLimit,
      resumes_used_this_period: 0,
      payment_id: payment.id,
      provider: payment.provider,
      payment_provider: payment.provider,
      provider_subscription_id: verification.providerPaymentId || payment.provider_payment_id,
      created_at: now,
      updated_at: now
    };

    employerSubscriptionRepository.save(subRecord);

    // Update payment record to SUCCEEDED and link subscription
    paymentRepository.update(payment.id, {
      status: 'SUCCEEDED',
      paid_at: now,
      subscription_id: subRecord.id,
      provider_payment_id: verification.providerPaymentId || payment.provider_payment_id,
      provider_response_safe: verification.rawResponse || {}
    });

    const updatedPayment = paymentRepository.getById(payment.id);

    // Generate Immutable Invoice / Receipt
    const employer = employerRepository.getById(payment.employer_id);
    const invoiceRecord = {
      payment_id: updatedPayment.id,
      employer_id: employer?.id || payment.employer_id,
      subscription_id: subRecord.id,
      billing_name: employer?.contact_person_name || employer?.full_name || 'Employer Account',
      company_name: employer?.company_name || 'Company',
      billing_email: employer?.email || employer?.business_email || '',
      billing_phone: employer?.phone_number || '',
      plan_name_snapshot: plan.name,
      plan_code_snapshot: plan.code || plan.slug || 'STANDARD',
      billing_interval: interval,
      currency: updatedPayment.currency,
      subtotal: updatedPayment.amount,
      discount: updatedPayment.discount_amount || 0,
      tax: updatedPayment.tax_amount || 0,
      total: updatedPayment.total_amount,
      status: 'PAID',
      issued_at: now,
      paid_at: now
    };

    const savedInvoice = invoiceRepository.create(invoiceRecord);

    // Audit logs
    auditLogRepository.record({
      actor_type: 'employer',
      actor_id: payment.employer_id,
      actor_name: employer?.contact_person_name || 'Employer Account',
      action: 'PAYMENT_SUCCEEDED',
      target_type: 'payment',
      target_id: updatedPayment.id,
      metadata: {
        payment_reference: updatedPayment.payment_reference,
        amount: updatedPayment.total_amount,
        currency: updatedPayment.currency,
        plan_name: plan.name,
        invoice_number: savedInvoice.invoice.invoice_number
      }
    });

    auditLogRepository.record({
      actor_type: 'system',
      actor_id: 'system',
      actor_name: 'Billing Engine',
      action: 'SUBSCRIPTION_ACTIVATED',
      target_type: 'subscription',
      target_id: subRecord.id,
      metadata: {
        employer_id: payment.employer_id,
        plan_id: plan.id,
        plan_name: plan.name,
        expires_at: periodEnd
      }
    });

    persistDbToDisk();

    return {
      success: true,
      status: 'SUCCEEDED',
      message: `Payment successful! Subscription to ${plan.name} is now active.`,
      payment: updatedPayment,
      subscription: subRecord,
      invoice: savedInvoice.invoice
    };
  }

  /**
   * Fetch live employer entitlements with automatic expiry handling and suspension check.
   */
  public getEmployerEntitlements(employerId: string) {
    const sub = employerSubscriptionRepository.getByEmployerId(employerId);
    const db = getCentralDb();
    const plan = sub.plan || db.subscription_plans?.find(p => p.id === sub.plan_id) || DEFAULT_SUBSCRIPTION_PLANS[0];

    const now = new Date();
    const periodEnd = sub.current_period_end || sub.expires_at ? new Date(sub.current_period_end || sub.expires_at) : null;
    const isExpired = Boolean(periodEnd && now > periodEnd && plan.id !== 'plan-free');

    // Auto-update expired status in DB
    if (isExpired && sub.status === 'ACTIVE') {
      sub.status = 'EXPIRED';
      employerSubscriptionRepository.save(sub);
      auditLogRepository.record({
        actor_type: 'system',
        actor_id: 'system',
        actor_name: 'Entitlement Engine',
        action: 'SUBSCRIPTION_EXPIRED',
        target_type: 'subscription',
        target_id: sub.id,
        metadata: { employer_id: employerId, plan_id: plan.id }
      });
    }

    const isSuspended = sub.status === 'SUSPENDED';
    const isActive = !isExpired && !isSuspended && (sub.status === 'ACTIVE' || sub.status === 'active');

    // If expired or suspended, fall back to free allowances
    const contactLimit = isActive ? (plan.contact_limit ?? plan.contact_access_limit ?? 0) : 0;
    const resumeLimit = isActive ? (plan.resume_access_limit ?? contactLimit) : 0;

    const contactsUsed = sub.contacts_used_this_period || 0;
    const resumesUsed = sub.resumes_used_this_period || 0;

    return {
      is_active: isActive,
      plan_id: plan.id,
      plan_name: plan.name,
      plan_code: plan.code || plan.slug || 'FREE',
      status: sub.status,
      current_period_start: sub.current_period_start || sub.started_at,
      current_period_end: sub.current_period_end || sub.expires_at,
      contacts_limit: contactLimit,
      contacts_used: contactsUsed,
      contacts_remaining: Math.max(0, contactLimit - contactsUsed),
      resumes_limit: resumeLimit,
      resumes_used: resumesUsed,
      resumes_remaining: Math.max(0, resumeLimit - resumesUsed),
      resume_download_enabled: isActive ? Boolean(plan.resume_download_enabled) : false,
      advanced_filters_enabled: isActive ? Boolean(plan.advanced_filters_enabled) : false,
      phone_access_enabled: isActive ? Boolean(plan.phone_access_enabled) : false,
      is_expired: isExpired,
      is_suspended: isSuspended,
      cancel_at_period_end: Boolean(sub.cancel_at_period_end),
      cancelled_at: sub.cancelled_at
    };
  }

  /**
   * Cancel subscription at period end.
   */
  public cancelSubscription(employerId: string) {
    const sub = employerSubscriptionRepository.getByEmployerId(employerId);
    if (!sub || sub.plan_id === 'plan-free') {
      throw new Error('No active paid subscription found to cancel.');
    }

    sub.cancel_at_period_end = true;
    sub.cancelled_at = new Date().toISOString();
    employerSubscriptionRepository.save(sub);

    auditLogRepository.record({
      actor_type: 'employer',
      actor_id: employerId,
      actor_name: 'Employer Account',
      action: 'SUBSCRIPTION_CANCEL_REQUESTED',
      target_type: 'subscription',
      target_id: sub.id,
      metadata: {
        plan_id: sub.plan_id,
        effective_cancellation_date: sub.current_period_end || sub.expires_at
      }
    });

    return {
      success: true,
      message: `Subscription cancellation scheduled. Your access remains active until ${new Date(sub.current_period_end || sub.expires_at).toLocaleDateString()}.`,
      subscription: sub
    };
  }

  /**
   * Admin: Suspend or reinstate subscription.
   */
  public adminSuspendSubscription(subscriptionId: string, suspend: boolean, reason?: string) {
    const db = getCentralDb();
    const sub = db.employer_subscriptions?.find(s => s.id === subscriptionId);
    if (!sub) {
      throw new Error('Subscription not found.');
    }

    sub.status = suspend ? 'SUSPENDED' : 'ACTIVE';
    sub.suspension_reason = suspend ? reason : undefined;
    sub.updated_at = new Date().toISOString();
    employerSubscriptionRepository.save(sub);

    auditLogRepository.record({
      actor_type: 'admin',
      actor_id: 'admin',
      actor_name: 'Administrator',
      action: suspend ? 'ADMIN_SUSPEND_SUBSCRIPTION' : 'ADMIN_REINSTATE_SUBSCRIPTION',
      target_type: 'subscription',
      target_id: sub.id,
      metadata: { employer_id: sub.employer_id, reason }
    });

    return {
      success: true,
      message: `Subscription ${suspend ? 'suspended' : 'reinstated'} successfully.`,
      subscription: sub
    };
  }

  /**
   * Admin: Get Billing & Revenue Statistics.
   */
  public getAdminStats() {
    const db = getCentralDb();
    const payments = db.payments || [];
    const subscriptions = db.employer_subscriptions || [];
    const invoices = db.invoices || [];

    const succeededPayments = payments.filter(p => p.status === 'SUCCEEDED');
    const totalRevenue = succeededPayments.reduce((sum, p) => sum + (Number(p.total_amount) || 0), 0);
    const activeSubsCount = subscriptions.filter(s => s.status === 'ACTIVE' || s.status === 'active').length;

    return {
      total_revenue: totalRevenue,
      total_payments_count: payments.length,
      succeeded_payments_count: succeededPayments.length,
      active_subscriptions_count: activeSubsCount,
      total_invoices_count: invoices.length
    };
  }
}

const DEFAULT_SUBSCRIPTION_PLANS = [
  {
    id: 'plan-free',
    code: 'FREE_MONTHLY',
    name: 'Free Employer',
    slug: 'free',
    description: 'Browse candidate profiles and test search capabilities worldwide.',
    price: 0,
    amount: 0,
    currency: 'USD',
    billing_interval: 'monthly',
    contact_limit: 0,
    resume_access_limit: 0,
    resume_download_enabled: false,
    advanced_filters_enabled: false,
    phone_access_enabled: false,
    is_active: true
  }
];

export const billingService = new BillingService();
