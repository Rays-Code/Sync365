import { supabase } from '../integrations/supabase/client';

/**
 * Core invoker for Supabase Edge Functions.
 * Automatically injects active JWT Bearer credentials.
 */
export async function invokeEdgeFunction<TReq = any, TRes = any>(
  functionName: string,
  payload?: TReq
): Promise<TRes> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (error) {
    console.error(`Edge Function '${functionName}' failed:`, error);
    let message = error.message || `Failed to execute: ${functionName}`;
    let code: string | undefined;
    if (error.name === 'FunctionsHttpError' && error.context) {
      try {
        const body = await error.context.json();
        if (body.error) message = body.error;
        if (body.code) code = body.code;
      } catch {}
    }
    const err = new Error(message);
    (err as any).code = code;
    throw err;
  }

  return data as TRes;
}

// ============================================
// 1. ADMIN ACTION WRAPPERS
// ============================================

export interface AdminBillingStats {
  activeSubscriptions: number;
  totalOrders: number;
  totalTransactions: number;
  pendingRefundRequests: number;
}

export const adminGetDatabaseStats = () =>
  invokeEdgeFunction<
    void,
    { billingStats: AdminBillingStats; websiteStats: Record<string, number> }
  >('external-db-stats');

export const adminQueryTable = <T = any>(table: string, limit = 50, offset = 0) =>
  invokeEdgeFunction<{ table: string; limit: number; offset: number }, { data: T[]; count: number }>('external-db-query', { table, limit, offset });

export const adminMutateRecord = (
  table: string,
  operation: 'insert' | 'update' | 'delete' | 'upsert',
  options?: {
    id?: string;
    idColumn?: string;
    data?: Record<string, unknown>;
    onConflict?: string;
  }
) =>
  invokeEdgeFunction('external-db-mutate', {
    table,
    operation,
    id: options?.id,
    idColumn: options?.idColumn,
    data: options?.data,
    onConflict: options?.onConflict,
  });

export const adminRefundSubscription = (subscriptionId: string, refundAmount?: number) =>
  invokeEdgeFunction('stripe-refund-subscription', { subscriptionId, refundAmount });

export const submitRefundRequest = (reason: string, detectedCountry?: string) =>
  invokeEdgeFunction<
    { reason: string; detectedCountry?: string },
    { success: boolean; request: Record<string, unknown> }
  >('submit-refund-request', { reason, detectedCountry });

export const adminListRefundRequests = (status?: string) =>
  invokeEdgeFunction<{ action: 'list'; status?: string }, { requests: RefundRequestRow[] }>(
    'manage-refund-requests',
    { action: 'list', status }
  );

export const adminApproveRefundRequest = (
  requestId: string,
  options?: { subscriptionId?: string; refundAmount?: number; adminNotes?: string }
) =>
  invokeEdgeFunction('manage-refund-requests', {
    action: 'approve',
    requestId,
    ...options,
  });

export const adminRejectRefundRequest = (requestId: string, adminNotes?: string) =>
  invokeEdgeFunction('manage-refund-requests', {
    action: 'reject',
    requestId,
    adminNotes,
  });

export interface RefundRequestRow {
  id: string;
  user_id: string;
  user_email: string;
  reason: string;
  status: 'pending' | 'rejected' | 'processed';
  stripe_subscription_id: string | null;
  stripe_refund_id: string | null;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const adminCancelSubscription = (subscriptionId: string, cancelImmediately = true) =>
  invokeEdgeFunction('stripe-cancel-subscription', { subscriptionId, cancelImmediately });

// ============================================
// 2. USER PORTAL ACTION WRAPPERS
// ============================================

export const userRequestCheckout = (
  plan: 'monthly' | 'yearly',
  userId: string,
  userEmail: string,
  detectedCountry?: string,
  successUrl?: string,
  cancelUrl?: string
) =>
  invokeEdgeFunction<
    { plan: string; userId: string; userEmail: string; detectedCountry?: string; successUrl?: string; cancelUrl?: string },
    { url: string; sessionId?: string }
  >('stripe-checkout', { plan, userId, userEmail, detectedCountry, successUrl, cancelUrl });

export const userConfirmCheckout = (sessionId: string) =>
  invokeEdgeFunction<
    { sessionId: string },
    {
      success: boolean;
      pending?: boolean;
      subscription?: Record<string, unknown>;
      plan?: string;
      autoRenew?: boolean;
      nextBillingDate?: string | null;
      billingInterval?: string;
    }
  >('confirm-checkout-session', { sessionId });

export const userRequestPortal = (userEmail: string) =>
  invokeEdgeFunction<{ userEmail: string }, { url: string }>('stripe-customer-portal', { userEmail });

export const userRedeemCode = (code: string, detectedCountry?: string) =>
  invokeEdgeFunction<{ code: string; detectedCountry?: string }, { success: boolean; product_name: string; discount: string; auto_activated?: boolean }>('redeem-code', { code, detectedCountry });

export const userGetBillingAccount = (action: 'get-subscription' | 'get-orders' | 'get-transactions', userId: string) =>
  invokeEdgeFunction<{ action: string; userId: string }>('billing-account', { action, userId });

export const userDetectCountry = () =>
  invokeEdgeFunction<void, { country: string }>('detect-country');

// ============================================
// 3. TELEMETRY WRAPPERS
// ============================================

export const trackPageVisit = (pagePath: string, referrer?: string, sessionId?: string) =>
  invokeEdgeFunction('track-visit', { page_path: pagePath, referrer, session_id: sessionId });

export const trackAuthFailure = (emailAttempted: string, pagePath: string) =>
  invokeEdgeFunction('track-security-event', { event_type: 'failed_login', email_attempted: emailAttempted, page_path: pagePath });

// ============================================
// 4. ADDITIONAL WRAPPERS
// ============================================

export const activateFreePlan = (userId: string, userEmail: string, plan: string, detectedCountry?: string) =>
  invokeEdgeFunction('activate-free-plan', { userId, userEmail, plan, detectedCountry });

export const adminArchiveOldData = (months: number) =>
  invokeEdgeFunction('archive-old-data', { months });

export const adminGetArchivedData = () =>
  invokeEdgeFunction('archived-data');

export const getProfile = (userId: string) =>
  invokeEdgeFunction('get-profile', { userId });

export const lookupUniqueId = (uniqueId: string) =>
  invokeEdgeFunction('lookup-unique-id', { uniqueId });

export const processSignup = (userId: string, email: string) =>
  invokeEdgeFunction('process-signup', { userId, email });

export const sendNotificationEmail = (to: string, subject: string, html: string) =>
  invokeEdgeFunction('send-notification-email', { to, subject, html });

export const sendWaitlistEmail = (email: string, name: string) =>
  invokeEdgeFunction('send-waitlist-email', { email, name });

export const adminStripeCreateCoupon = (couponDetails: any) =>
  invokeEdgeFunction('stripe-create-coupon', { couponDetails });

export const adminStripeListCoupons = () =>
  invokeEdgeFunction('stripe-list-coupons');

export const adminStripeRefund = (chargeId: string) =>
  invokeEdgeFunction('stripe-refund', { chargeId });

export const adminUpdatePricing = (planId: string, amount: number) =>
  invokeEdgeFunction('update-pricing', { planId, amount });
