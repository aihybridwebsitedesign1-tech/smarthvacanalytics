import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!serviceRoleKey && !anonKey) {
      console.error('Missing Supabase keys');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabaseKey = serviceRoleKey || anonKey!;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Fetching profile for userId:', userId);
    console.log('Using service role key:', !!serviceRoleKey);

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
      const { error } = await supabase
        .from('profiles')
        .update({
          billing_status: 'cancelled',
          trial_end_date: new Date().toISOString(),
          subscription_end: new Date().toISOString(),
          account_status: 'suspended',
        })
        .eq('id', userId);

      if (error) throw error;

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
