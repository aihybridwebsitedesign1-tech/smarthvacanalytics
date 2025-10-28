import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_Bolt_Database_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseServiceKey =
    process.env.Bolt_Database_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_Bolt_Database_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;

        console.log(`[Stripe Webhook] Checkout completed for user: ${userId}, subscription: ${subscriptionId}`);

        if (userId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const planTier = getPlanTierFromPriceId(subscription.items.data[0].price.id);
          const customerId = subscription.customer as string;

          console.log(`[Stripe Webhook] Updating user ${userId} to plan: ${planTier}`);

          await supabase
            .from('profiles')
            .update({
              subscription_id: subscriptionId,
              stripe_customer_id: customerId,
              plan_tier: planTier,
              billing_status: subscription.status as string,
              subscription_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
              subscription_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            })
            .eq('id', userId);

          console.log(`[Stripe Webhook] Successfully updated user ${userId} - billing_status: ${subscription.status}, stripe_customer_id: ${customerId}`);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          const planTier = subscription.status === 'active'
            ? getPlanTierFromPriceId(subscription.items.data[0].price.id)
            : 'starter';

          await supabase
            .from('profiles')
            .update({
              billing_status: subscription.status as string,
              plan_tier: planTier,
              subscription_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            })
            .eq('id', userId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (profile) {
          await supabase
            .from('profiles')
            .update({ billing_status: 'past_due' })
            .eq('id', profile.id);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

function getPlanTierFromPriceId(priceId: string): string {
  console.log(`[Stripe Webhook] Mapping price ID: ${priceId}`);
  console.log(`[Stripe Webhook] Environment price IDs:`, {
    starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    growth: process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID,
    pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
  });

  if (priceId === process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID) {
    console.log('[Stripe Webhook] Matched: starter');
    return 'starter';
  }
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID) {
    console.log('[Stripe Webhook] Matched: growth');
    return 'growth';
  }
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
    console.log('[Stripe Webhook] Matched: pro');
    return 'pro';
  }

  console.warn(`[Stripe Webhook] Unknown price ID: ${priceId}, defaulting to starter`);
  return 'starter';
}
