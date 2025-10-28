import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

function validateEnvironment() {
  const errors: string[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not configured');
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured');
  }

  return errors;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const envErrors = validateEnvironment();
    if (envErrors.length > 0) {
      console.error('[Cancel Subscription] Environment validation failed:', envErrors);
      return NextResponse.json(
        { error: 'Service is not properly configured. Please contact support.' },
        { status: 500 }
      );
    }

    const { userId } = await req.json();

    if (!userId) {
      console.warn('[Cancel Subscription] Request missing userId');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseServiceKey) {
      console.error('[Cancel Subscription] CRITICAL: Service role key is not configured');
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please contact support.' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    console.log('[Cancel Subscription] Request initiated:', {
      userId,
      timestamp: new Date().toISOString(),
      hasServiceRoleKey: true,
    });

    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, stripe_subscription_id, billing_status, account_status')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('[Cancel Subscription] Database query failed:', {
        userId,
        error: {
          message: fetchError.message,
          code: fetchError.code,
          details: fetchError.details,
          hint: fetchError.hint,
        },
        duration: Date.now() - startTime,
      });

      const errorMsg = fetchError.message?.toLowerCase() || '';
      const isPermissionError = errorMsg.includes('permission') ||
                                errorMsg.includes('policy') ||
                                errorMsg.includes('rls');
      const isAuthError = errorMsg.includes('api') ||
                          errorMsg.includes('key') ||
                          errorMsg.includes('jwt');

      if (isPermissionError) {
        console.error('[Cancel Subscription] RLS policy error - service role key may not have proper permissions');
        return NextResponse.json(
          { error: 'Unable to access your account. Please contact support.' },
          { status: 500 }
        );
      }

      if (isAuthError) {
        console.error('[Cancel Subscription] Authentication error - check environment configuration');
        return NextResponse.json(
          { error: 'Service authentication failed. Please contact support.' },
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

    console.log('[Cancel Subscription] Profile retrieved successfully:', {
      userId,
      hasStripeCustomer: !!profile.stripe_customer_id,
      hasStripeSubscription: !!profile.stripe_subscription_id,
      billingStatus: profile.billing_status,
      accountStatus: profile.account_status,
      queryDuration: Date.now() - startTime,
    });

    if (profile.billing_status === 'trialing' && !profile.stripe_customer_id) {
      console.log('[Cancel Subscription] Processing free trial cancellation:', { userId });

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
        console.error('[Cancel Subscription] Failed to update profile for trial cancellation:', {
          userId,
          error: {
            message: updateError.message,
            code: updateError.code,
            details: updateError.details,
          },
          duration: Date.now() - startTime,
        });
        return NextResponse.json(
          { error: 'Unable to cancel your trial. Please contact support if this persists.' },
          { status: 500 }
        );
      }

      console.log('[Cancel Subscription] Free trial cancelled successfully:', {
        userId,
        duration: Date.now() - startTime,
        updatedFields: updateData,
      });

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
      type: error.type,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
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
