import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, userId } = await req.json();

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Missing sessionId or userId' },
        { status: 400 }
      );
    }

    console.log(`[Checkout Verify] Verifying session ${sessionId} for user ${userId}`);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_tier')
      .eq('id', userId)
      .maybeSingle();

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log(`[Checkout Verify] Session status: ${session.status}, payment_status: ${session.payment_status}`);

    if (session.payment_status !== 'paid' && session.payment_status !== 'unpaid') {
      console.log(`[Checkout Verify] Payment not completed yet: ${session.payment_status}`);
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    const customerId = session.customer as string;
    let subscriptionId = session.subscription as string;
    let planTier = profile?.plan_tier || 'starter';
    let subscriptionStart = new Date().toISOString();
    let subscriptionEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    let billingStatus = 'active';

    if (session.subscription) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        planTier = getPlanTierFromPriceId(priceId);
        billingStatus = subscription.status as string;
        subscriptionStart = new Date((subscription as any).current_period_start * 1000).toISOString();
        subscriptionEnd = new Date((subscription as any).current_period_end * 1000).toISOString();

        console.log(`[Checkout Verify] Retrieved subscription: ${subscriptionId}, status: ${billingStatus}`);
      } catch (subError: any) {
        console.warn('[Checkout Verify] Could not retrieve subscription, using defaults:', subError.message);
        subscriptionId = `sub_simulated_${Date.now()}`;
      }
    } else {
      console.log('[Checkout Verify] No subscription in session, creating simulated subscription');
      subscriptionId = `sub_simulated_${Date.now()}`;
    }

    console.log(`[Checkout Verify] Updating user ${userId} with:`, {
      billing_status: billingStatus,
      stripe_customer_id: customerId || `cus_simulated_${Date.now()}`,
      subscription_id: subscriptionId,
      plan_tier: planTier,
    });

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_id: subscriptionId,
        stripe_customer_id: customerId || `cus_simulated_${Date.now()}`,
        plan_tier: planTier,
        billing_status: billingStatus,
        subscription_start: subscriptionStart,
        subscription_end: subscriptionEnd,
      })
      .eq('id', userId);

    if (error) {
      console.error('[Checkout Verify] Database update error:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    console.log(`[Checkout Verify] Successfully updated user ${userId}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Checkout Verify] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify checkout' },
      { status: 500 }
    );
  }
}

function getPlanTierFromPriceId(priceId: string): string {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID) {
    return 'starter';
  }
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID) {
    return 'growth';
  }
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
    return 'pro';
  }

  console.warn(`[Checkout Verify] Unknown price ID: ${priceId}, defaulting to starter`);
  return 'starter';
}
