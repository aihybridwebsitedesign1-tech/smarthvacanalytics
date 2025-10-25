import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    console.log(`[Activate] Activating account for user ${userId}`);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_tier, billing_status')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (profile.billing_status === 'active') {
      console.log(`[Activate] Account already active for user ${userId}`);
      return NextResponse.json({ success: true, alreadyActive: true });
    }

    const subscriptionStart = new Date().toISOString();
    const subscriptionEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    console.log(`[Activate] Updating user ${userId} to active status`);

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_id: `sub_activated_${Date.now()}`,
        stripe_customer_id: `cus_activated_${Date.now()}`,
        billing_status: 'active',
        subscription_start: subscriptionStart,
        subscription_end: subscriptionEnd,
      })
      .eq('id', userId);

    if (error) {
      console.error('[Activate] Database update error:', error);
      return NextResponse.json(
        { error: 'Failed to activate account' },
        { status: 500 }
      );
    }

    console.log(`[Activate] Successfully activated user ${userId}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Activate] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to activate account' },
      { status: 500 }
    );
  }
}
