import Stripe from 'stripe';

// Lazy initialization to avoid errors during build
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

// For backward compatibility
export const stripe = {
  get checkout() { return getStripe().checkout; },
  get billingPortal() { return getStripe().billingPortal; },
  get subscriptions() { return getStripe().subscriptions; },
  get customers() { return getStripe().customers; },
  get webhooks() { return getStripe().webhooks; },
};

export const PLANS = {
  FREE: {
    name: 'Free',
    priceId: null,
    price: 0,
    features: ['1 book', '10 AI generations/month', 'Basic export (Markdown, HTML)', 'Community support'],
    limits: { books: 1, chapters: 20, aiCredits: 10, collaborators: 0, exports: ['markdown', 'html'] },
  },
  CREATOR: {
    name: 'Creator',
    priceId: process.env.STRIPE_CREATOR_PRICE_ID,
    price: 19,
    features: ['5 books', '100 AI generations/month', 'All export formats', 'Email support', '2 collaborators'],
    limits: { books: 5, chapters: 100, aiCredits: 100, collaborators: 2, exports: ['markdown', 'html', 'epub', 'docx', 'pdf'] },
  },
  PROFESSIONAL: {
    name: 'Professional',
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    price: 49,
    features: ['Unlimited books', '500 AI generations/month', 'Priority support', '10 collaborators', 'Advanced analytics'],
    limits: { books: -1, chapters: -1, aiCredits: 500, collaborators: 10, exports: ['markdown', 'html', 'epub', 'docx', 'pdf'] },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    price: 199,
    features: ['Everything in Pro', 'Unlimited AI', 'Dedicated support', 'Custom integrations', 'Team management'],
    limits: { books: -1, chapters: -1, aiCredits: -1, collaborators: -1, exports: ['markdown', 'html', 'epub', 'docx', 'pdf'] },
  },
} as const;

export type PlanType = keyof typeof PLANS;

export async function createCheckoutSession(params: {
  customerId?: string;
  customerEmail: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = getStripe();
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: params.customerId,
    customer_email: params.customerId ? undefined : params.customerEmail,
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    subscription_data: { trial_period_days: 14 },
  });
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  const stripe = getStripe();
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function getSubscription(subscriptionId: string) {
  const stripe = getStripe();
  return stripe.subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  const stripe = getStripe();
  return stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
}

export async function updateSubscription(subscriptionId: string, priceId: string) {
  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return stripe.subscriptions.update(subscriptionId, {
    items: [{ id: subscription.items.data[0].id, price: priceId }],
    proration_behavior: 'create_prorations',
  });
}

export async function getCustomerByEmail(email: string) {
  const stripe = getStripe();
  const customers = await stripe.customers.list({ email, limit: 1 });
  return customers.data[0] || null;
}

export async function createCustomer(email: string, name?: string) {
  const stripe = getStripe();
  return stripe.customers.create({ email, name });
}

export function getPlanByPriceId(priceId: string): PlanType | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) return key as PlanType;
  }
  return null;
}

export function constructWebhookEvent(payload: Buffer, signature: string) {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

export default { getStripe, PLANS, createCheckoutSession, createPortalSession, getSubscription };
