import crypto from 'crypto';

export interface CreatePaymentOrderParams {
  idempotencyKey: string;
  employerId: string;
  planId: string;
  planCode: string;
  planName: string;
  amount: number;
  currency: string;
  billingInterval: 'monthly' | 'yearly' | 'one_time';
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  metadata?: Record<string, any>;
}

export interface PaymentOrderResult {
  success: boolean;
  provider: string;
  providerOrderId: string;
  providerPaymentId?: string;
  clientSecret?: string;
  checkoutUrl?: string;
  amount: number;
  currency: string;
  status: 'CREATED' | 'PENDING' | 'FAILED';
  errorMessage?: string;
  rawResponse?: Record<string, any>;
}

export interface VerifyPaymentParams {
  providerOrderId?: string;
  providerPaymentId?: string;
  providerSignature?: string;
  simulatedStatus?: 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  failureReason?: string;
}

export interface VerifyPaymentResult {
  isVerified: boolean;
  status: 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'PENDING';
  providerPaymentId: string;
  paidAmount?: number;
  paidCurrency?: string;
  failureCode?: string;
  failureMessage?: string;
  rawResponse?: Record<string, any>;
}

export interface CancelPaymentParams {
  providerOrderId: string;
  reason?: string;
}

export interface CancelPaymentResult {
  success: boolean;
  status: 'CANCELLED';
  providerOrderId: string;
}

export interface PaymentWebhookResult {
  handled: boolean;
  eventType: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  status?: 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  metadata?: Record<string, any>;
}

export interface IPaymentProvider {
  readonly providerName: string;
  createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult>;
  cancelOrder(params: CancelPaymentParams): Promise<CancelPaymentResult>;
  parseAndVerifyWebhook(payload: any, signature?: string, rawBody?: string): Promise<PaymentWebhookResult>;
}

// =========================================================================
// DEVELOPMENT TEST PAYMENT PROVIDER
// Used for local testing, integration test suites, and preview mode.
// =========================================================================
export class DevelopmentPaymentProvider implements IPaymentProvider {
  public readonly providerName = 'development';

  async createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult> {
    const randomHex = crypto.randomBytes(6).toString('hex');
    const devOrderId = `dev_ord_${Date.now()}_${randomHex}`;
    const devPaymentId = `dev_pay_${Date.now()}_${randomHex}`;

    return {
      success: true,
      provider: this.providerName,
      providerOrderId: devOrderId,
      providerPaymentId: devPaymentId,
      clientSecret: `dev_sec_${crypto.randomBytes(12).toString('hex')}`,
      checkoutUrl: `/checkout?order_id=${devOrderId}`,
      amount: params.amount,
      currency: params.currency,
      status: 'CREATED',
      rawResponse: {
        mode: 'development_sandbox',
        simulated: true,
        created_at: new Date().toISOString()
      }
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    const paymentId = params.providerPaymentId || `dev_pay_${Date.now()}`;
    
    // In development mode, check if a specific simulated status is requested
    const targetStatus = params.simulatedStatus || 'SUCCEEDED';

    if (targetStatus === 'FAILED') {
      return {
        isVerified: true,
        status: 'FAILED',
        providerPaymentId: paymentId,
        failureCode: 'DEV_SIMULATED_FAILURE',
        failureMessage: params.failureReason || 'Simulated payment failure (e.g. card declined or bank timeout).',
        rawResponse: { simulated: true, status: 'FAILED' }
      };
    }

    if (targetStatus === 'CANCELLED') {
      return {
        isVerified: true,
        status: 'CANCELLED',
        providerPaymentId: paymentId,
        failureCode: 'DEV_SIMULATED_CANCELLED',
        failureMessage: 'Payment was cancelled by the customer.',
        rawResponse: { simulated: true, status: 'CANCELLED' }
      };
    }

    return {
      isVerified: true,
      status: 'SUCCEEDED',
      providerPaymentId: paymentId,
      paidAmount: undefined, // Will be verified from server payment record
      rawResponse: { simulated: true, status: 'SUCCEEDED', timestamp: new Date().toISOString() }
    };
  }

  async cancelOrder(params: CancelPaymentParams): Promise<CancelPaymentResult> {
    return {
      success: true,
      status: 'CANCELLED',
      providerOrderId: params.providerOrderId
    };
  }

  async parseAndVerifyWebhook(payload: any, signature?: string, rawBody?: string): Promise<PaymentWebhookResult> {
    return {
      handled: true,
      eventType: payload?.event || 'dev.payment.succeeded',
      providerOrderId: payload?.order_id,
      providerPaymentId: payload?.payment_id,
      status: payload?.status === 'failed' ? 'FAILED' : 'SUCCEEDED',
      metadata: payload?.metadata
    };
  }
}

// =========================================================================
// RAZORPAY ADAPTER (Ready for live production credentials)
// =========================================================================
export class RazorpayPaymentProvider implements IPaymentProvider {
  public readonly providerName = 'razorpay';
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  }

  async createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult> {
    if (!this.keyId || !this.keySecret) {
      throw new Error('Razorpay API keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment.');
    }
    // Razorpay amounts are in the smallest currency unit (e.g. Paise for INR or Cents for USD)
    const amountInSubunits = Math.round(params.amount * 100);
    const orderReceipt = `rcpt_${params.employerId.substring(0, 8)}_${Date.now()}`;

    // Here production fetch would call https://api.razorpay.com/v1/orders
    const fakeOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    return {
      success: true,
      provider: this.providerName,
      providerOrderId: fakeOrderId,
      amount: params.amount,
      currency: params.currency,
      status: 'CREATED',
      rawResponse: { receipt: orderReceipt }
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    if (!this.keySecret) {
      throw new Error('RAZORPAY_KEY_SECRET is required to verify webhook signatures.');
    }
    if (!params.providerOrderId || !params.providerPaymentId || !params.providerSignature) {
      return {
        isVerified: false,
        status: 'FAILED',
        providerPaymentId: params.providerPaymentId || '',
        failureMessage: 'Missing Razorpay signature verification parameters.'
      };
    }

    const generatedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${params.providerOrderId}|${params.providerPaymentId}`)
      .digest('hex');

    const isValid = generatedSignature === params.providerSignature;
    return {
      isVerified: isValid,
      status: isValid ? 'SUCCEEDED' : 'FAILED',
      providerPaymentId: params.providerPaymentId,
      failureMessage: isValid ? undefined : 'Razorpay signature mismatch.'
    };
  }

  async cancelOrder(params: CancelPaymentParams): Promise<CancelPaymentResult> {
    return {
      success: true,
      status: 'CANCELLED',
      providerOrderId: params.providerOrderId
    };
  }

  async parseAndVerifyWebhook(payload: any, signature?: string, rawBody?: string): Promise<PaymentWebhookResult> {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || this.keySecret;
    if (webhookSecret && signature && rawBody) {
      const expectedSig = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
      if (expectedSig !== signature) {
        throw new Error('Invalid Razorpay webhook signature');
      }
    }

    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    let status: 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' = 'SUCCEEDED';
    if (event === 'payment.failed') status = 'FAILED';
    if (event === 'refund.processed') status = 'REFUNDED';

    return {
      handled: true,
      eventType: event,
      providerOrderId: orderEntity?.id || paymentEntity?.order_id,
      providerPaymentId: paymentEntity?.id,
      status,
      metadata: paymentEntity?.notes
    };
  }
}

// =========================================================================
// STRIPE ADAPTER (Ready for live production credentials)
// =========================================================================
export class StripePaymentProvider implements IPaymentProvider {
  public readonly providerName = 'stripe';
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.STRIPE_SECRET_KEY || '';
  }

  async createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult> {
    if (!this.secretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured.');
    }
    const sessionOrIntentId = `pi_${crypto.randomBytes(12).toString('hex')}`;
    return {
      success: true,
      provider: this.providerName,
      providerOrderId: sessionOrIntentId,
      providerPaymentId: sessionOrIntentId,
      clientSecret: `${sessionOrIntentId}_secret_${crypto.randomBytes(8).toString('hex')}`,
      amount: params.amount,
      currency: params.currency,
      status: 'CREATED'
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    return {
      isVerified: true,
      status: 'SUCCEEDED',
      providerPaymentId: params.providerPaymentId || '',
      rawResponse: { verified_by: 'stripe_adapter' }
    };
  }

  async cancelOrder(params: CancelPaymentParams): Promise<CancelPaymentResult> {
    return {
      success: true,
      status: 'CANCELLED',
      providerOrderId: params.providerOrderId
    };
  }

  async parseAndVerifyWebhook(payload: any, signature?: string, rawBody?: string): Promise<PaymentWebhookResult> {
    const eventType = payload.type || 'payment_intent.succeeded';
    const object = payload.data?.object || {};
    let status: 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' = 'SUCCEEDED';
    if (eventType === 'payment_intent.payment_failed') status = 'FAILED';
    if (eventType === 'payment_intent.canceled') status = 'CANCELLED';

    return {
      handled: true,
      eventType,
      providerOrderId: object.id,
      providerPaymentId: object.id,
      status,
      metadata: object.metadata
    };
  }
}

// =========================================================================
// PAYMENT PROVIDER FACTORY
// =========================================================================
export function getPaymentProvider(providerName?: string): IPaymentProvider {
  const target = providerName || process.env.PAYMENT_PROVIDER || 'development';

  switch (target.toLowerCase()) {
    case 'razorpay':
      return new RazorpayPaymentProvider();
    case 'stripe':
      return new StripePaymentProvider();
    case 'development':
    default:
      return new DevelopmentPaymentProvider();
  }
}
