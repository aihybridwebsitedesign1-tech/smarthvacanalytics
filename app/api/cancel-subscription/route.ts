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
      console.error('Missing Supabase URL');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Use service role key if available, otherwise anon key
    const supabaseKey = supabaseServiceKey || supabaseAnonKey;

    if (!supabaseKey) {
      console.error('Missing Supabase keys');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    console.log('Fetching profile for userId:', userId);

    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, stripe_subscription_id, billing_status')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Profile fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Database error: ' + fetchError.message },
        { status: 500 }
      );
    }

    if (!profile) {
      console.error('No profile found for userId:', userId);
      return NextResponse.json(
        { error: 'Your profile could not be found. This may be a temporary issue. Please try again.' },
        { status: 404 }
      );
    }

    console.log('Profile found:', {
      userId,
      hasStripeCustomer: !!profile.stripe_customer_id,
      billingStatus: profile.billing_status
    });

    if (profile.billing_status === 'trialing' && !profile.stripe_customer_id) {
      console.log('Canceling free trial for user:', userId);

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
        console.error('Failed to update profile:', updateError);
        return NextResponse.json(
          { error: 'Failed to cancel trial: ' + updateError.message },
          { status: 500 }
        );
      }

      console.log('Trial cancelled successfully:', updateData);

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
    console.error('Cancellation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
