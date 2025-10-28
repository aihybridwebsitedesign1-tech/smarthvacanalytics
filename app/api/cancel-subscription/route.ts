import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      console.error('[Cancel Subscription] Missing NEXT_PUBLIC_SUPABASE_URL');
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 500 }
      );
    }

    if (!supabaseAnonKey) {
      console.error('[Cancel Subscription] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 500 }
      );
    }

    const supabaseKey = supabaseServiceKey || supabaseAnonKey;

    if (!supabaseKey) {
      console.error('[Cancel Subscription] No valid Supabase key available');
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 500 }
      );
    }

    let supabase;
    try {
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch (createError: any) {
      console.error('[Cancel Subscription] Failed to create Supabase client:', createError);
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 500 }
      );
    }

    console.log('[Cancel Subscription] Fetching profile for userId:', userId);
    console.log('[Cancel Subscription] Using service role key:', !!supabaseServiceKey);

    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, stripe_subscription_id, billing_status')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('[Cancel Subscription] Profile fetch error:', {
        message: fetchError.message,
        code: fetchError.code,
        details: fetchError.details,
        hint: fetchError.hint,
      });

      const isAuthError = fetchError.message?.toLowerCase().includes('api') ||
                          fetchError.message?.toLowerCase().includes('key') ||
                          fetchError.message?.toLowerCase().includes('jwt');

      if (isAuthError) {
        return NextResponse.json(
          { error: 'We\'re experiencing technical difficulties. Our team has been notified. Please try again in a few moments.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: 'Unable to access your account information. Please try again.' },
        { status: 500 }
      );
    }

    if (!profile) {
      console.error('[Cancel Subscription] No profile found for userId:', userId);
      return NextResponse.json(
        { error: 'Your account information could not be found. Please try logging out and back in.' },
        { status: 404 }
      );
    }

    console.log('[Cancel Subscription] Profile found:', {
      userId,
      hasStripeCustomer: !!profile.stripe_customer_id,
      hasStripeSubscription: !!profile.stripe_subscription_id,
      billingStatus: profile.billing_status
    });

    if (profile.billing_status === 'trialing' && !profile.stripe_customer_id) {
      console.log('[Cancel Subscription] Canceling free trial for user:', userId);

      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({
          billing_status: 'cancelled',
          trial_end_date: new Date().toISOString(),
          subscription_end: new Date().toISOString(),
          account_status: 'suspended',
        })
        .eq('id', userId)
        .select();

      if (updateError) {
        console.error('[Cancel Subscription] Failed to update profile:', {
          message: updateError.message,
          code: updateError.code,
          details: updateError.details,
        });
        return NextResponse.json(
          { error: 'Unable to cancel your trial. Please contact support if this persists.' },
          { status: 500 }
        );
      }

      console.log('[Cancel Subscription] Trial cancelled successfully:', updateData);

      return NextResponse.json({
        success: true,
        message: 'Free trial ended successfully. Your account has been cancelled.',
      });
    }

    if (!profile.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
    });

    const updatedSubscription = await stripe.subscriptions.update(
      profile.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      }
    );

    const subscriptionData = updatedSubscription as any;
    const subscriptionEndDate = subscriptionData.current_period_end
      ? new Date(subscriptionData.current_period_end * 1000).toISOString()
      : new Date().toISOString();

    const { error } = await supabase
      .from('profiles')
      .update({
        billing_status: 'cancelled',
        subscription_end: subscriptionEndDate,
      })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled. Access continues until the end of your billing period.',
    });
  } catch (error: any) {
    console.error('[Cancel Subscription] Unexpected error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    const isStripeError = error.type?.startsWith('Stripe');
    const errorMessage = isStripeError
      ? 'Unable to process cancellation with payment provider. Please try again or contact support.'
      : 'An unexpected error occurred. Please try again later.';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
