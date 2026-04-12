// Razorpay server-side utilities — Subscriptions API
// Uses fetch API directly — no SDK dependency needed

function getRazorpayKeyId(): string {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
}

function getRazorpayKeySecret(): string {
  return process.env.RAZORPAY_KEY_SECRET || '';
}

function getAuthHeader(): string {
  return 'Basic ' + btoa(`${getRazorpayKeyId()}:${getRazorpayKeySecret()}`);
}

const RZP_BASE = 'https://api.razorpay.com/v1';

// ─── Subscriptions ────────────────────────────────────────────────────────────

export interface RazorpaySubscription {
  id: string;
  plan_id: string;
  status: string;
  short_url: string;
  current_start: number | null;
  current_end: number | null;
}

/**
 * Create a Razorpay subscription for a plan.
 * If the plan has trial_days > 0, the subscription starts with a trial.
 */
export async function createRazorpaySubscription(
  razorpayPlanId: string,
  totalCount: number = 12,
  notes?: Record<string, string>
): Promise<RazorpaySubscription> {
  const res = await fetch(`${RZP_BASE}/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader(),
    },
    body: JSON.stringify({
      plan_id: razorpayPlanId,
      total_count: totalCount,
      notes,
    }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.description || `Razorpay subscription creation failed (${res.status})`);
  }

  return res.json();
}

/**
 * Cancel a Razorpay subscription.
 * cancel_at_cycle_end: true = cancel at end of current billing, false = cancel immediately
 */
export async function cancelRazorpaySubscription(
  subscriptionId: string,
  cancelAtCycleEnd: boolean = true
): Promise<void> {
  const res = await fetch(`${RZP_BASE}/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader(),
    },
    body: JSON.stringify({ cancel_at_cycle_end: cancelAtCycleEnd }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.description || `Subscription cancellation failed (${res.status})`);
  }
}

/**
 * Fetch a Razorpay subscription by ID.
 */
export async function fetchRazorpaySubscription(subscriptionId: string): Promise<RazorpaySubscription> {
  const res = await fetch(`${RZP_BASE}/subscriptions/${subscriptionId}`, {
    headers: { 'Authorization': getAuthHeader() },
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.description || `Failed to fetch subscription (${res.status})`);
  }

  return res.json();
}

// ─── Signature verification ───────────────────────────────────────────────────

/**
 * Verify Razorpay payment signature using Web Crypto API (edge-compatible).
 * For subscriptions: body = razorpay_payment_id + "|" + razorpay_subscription_id
 */
export async function verifyRazorpaySignature(
  paymentId: string,
  subscriptionId: string,
  signature: string
): Promise<boolean> {
  const body = `${paymentId}|${subscriptionId}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(getRazorpayKeySecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const expectedSignature = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return expectedSignature === signature;
}
