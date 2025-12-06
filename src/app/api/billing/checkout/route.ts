import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';
import { PLANS, createCheckoutSession, getCustomerByEmail, createCustomer } from '@/lib/stripe';

const checkoutSchema = z.object({
  planId: z.enum(['CREATOR', 'PROFESSIONAL', 'ENTERPRISE']),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;
    if (!email) return NextResponse.json({ error: 'No email found' }, { status: 400 });

    const body = await req.json();
    const { planId } = checkoutSchema.parse(body);

    const plan = PLANS[planId];
    if (!plan.priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Get or create Stripe customer
    let customer = await getCustomerByEmail(email);
    if (!customer) {
      customer = await createCustomer(email, user?.firstName || undefined);
    }

    const session = await createCheckoutSession({
      customerId: customer.id,
      customerEmail: email,
      priceId: plan.priceId,
      successUrl: `${baseUrl}/settings?success=true`,
      cancelUrl: `${baseUrl}/settings?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
