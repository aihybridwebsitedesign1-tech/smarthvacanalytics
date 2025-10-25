import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log('[Checkout] Starting checkout session creation');

  try {
    const { priceId, userId, email } = await req.json();
    console.log(`[Checkout] Received request for user: ${userId}`);

    if (!priceId || !userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: priceId, userId, or email' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      console.error('Stripe configuration error: STRIPE_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'Stripe is not configured. Please add your Stripe API keys to the .env file.' },
        { status: 500 }
      );
    }

    if (!priceId.startsWith('price_')) {
      return NextResponse.json(
        { error: 'Invalid Stripe Price ID. Please configure valid Price IDs in your .env file.' },
        { status: 400 }
      );
    }

    console.log('[Checkout] Creating Stripe checkout session...');
    const sessionStartTime = Date.now();

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}&from_checkout=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      subscription_data: {
        metadata: { userId },
      },
      metadata: { userId, email },
    });

    console.log(`[Checkout] Stripe session created in ${Date.now() - sessionStartTime}ms`);

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL');
    }

    console.log(`[Checkout] Total time: ${Date.now() - startTime}ms`);
    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error(`[Checkout] Error after ${Date.now() - startTime}ms:`, error);

    let errorMessage = error.message || 'Failed to create checkout session';

    if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Stripe authentication failed. Please check your API keys in the .env file.';
    } else if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid Stripe configuration. Please check your Price IDs and API keys.';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
