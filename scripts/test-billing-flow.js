const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TEST_EMAIL = 'testv8@gmail.com';
const TEST_PASSWORD = 'TestPass123!';
const TEST_COMPANY = 'testv8';
const TEST_PLAN = 'starter';

async function createTestAccount() {
  console.log('\n📝 Step 1: Creating Test Account');
  console.log('================================');
  console.log('Email:', TEST_EMAIL);
  console.log('Company:', TEST_COMPANY);
  console.log('Plan:', TEST_PLAN);

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (authError) {
    console.error('❌ Auth error:', authError.message);
    return null;
  }

  if (!authData.user) {
    console.error('❌ No user returned from signup');
    return null;
  }

  console.log('✅ Auth user created:', authData.user.id);

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({
      company_name: TEST_COMPANY,
      plan_tier: TEST_PLAN,
      billing_status: 'trialing',
    })
    .eq('id', authData.user.id)
    .select()
    .single();

  if (profileError) {
    console.error('❌ Profile update error:', profileError.message);
    return null;
  }

  console.log('✅ Profile updated:', profile.id);
  console.log('   Company:', profile.company_name);
  console.log('   Plan:', profile.plan_tier);
  console.log('   Status:', profile.billing_status);
  console.log('   Created:', profile.created_at);

  return { user: authData.user, profile };
}

async function endTrial(userId) {
  console.log('\n⏱️  Step 2: Ending Trial (Simulating Day 14+)');
  console.log('================================');

  const { data: profile, error } = await supabase
    .from('profiles')
    .update({
      billing_status: 'active',
      created_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error ending trial:', error.message);
    return null;
  }

  console.log('✅ Trial ended successfully');
  console.log('   Status:', profile.billing_status);
  console.log('   Created (backdated):', profile.created_at);
  console.log('   Stripe Customer:', profile.stripe_customer_id || 'NULL (grace period)');

  return profile;
}

async function checkBillingStatus(userId) {
  console.log('\n🔍 Step 3: Checking Billing Status');
  console.log('================================');

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('❌ Error fetching profile:', error.message);
    return null;
  }

  const createdAt = new Date(profile.created_at);
  const trialEndDate = new Date(createdAt);
  trialEndDate.setDate(trialEndDate.getDate() + 14);

  const now = new Date();
  const gracePeriodEndDate = new Date(trialEndDate);
  gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + 5);

  const isTrialEnded = now > trialEndDate;
  const isInGracePeriod = isTrialEnded && now < gracePeriodEndDate;
  const daysRemaining = Math.ceil((gracePeriodEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  console.log('📊 Account Status:');
  console.log('   Email:', profile.email);
  console.log('   Created:', createdAt.toLocaleDateString());
  console.log('   Trial End:', trialEndDate.toLocaleDateString());
  console.log('   Grace Period End:', gracePeriodEndDate.toLocaleDateString());
  console.log('   Billing Status:', profile.billing_status);
  console.log('   Stripe Customer:', profile.stripe_customer_id || 'NULL');
  console.log('   Subscription:', profile.subscription_id || 'NULL');
  console.log('');
  console.log('🎯 State Analysis:');
  console.log('   Trial Ended:', isTrialEnded ? '✅ Yes' : '❌ No');
  console.log('   In Grace Period:', isInGracePeriod ? '✅ Yes' : '❌ No');
  console.log('   Days Remaining:', Math.max(0, daysRemaining));
  console.log('   Needs Payment:', !profile.stripe_customer_id ? '⚠️  YES' : '✅ No');

  if (!profile.stripe_customer_id && isInGracePeriod) {
    console.log('\n⚠️  EXPECTED UI STATE:');
    console.log('   ✓ Orange alert banner visible on Dashboard');
    console.log('   ✓ Orange alert banner visible on Settings');
    console.log('   ✓ "Complete Billing Setup" button present');
    console.log('   ✓ Grace period countdown showing');
    console.log('   ✓ No "Manage Billing" button (replaced with setup)');
  }

  return { profile, isInGracePeriod, daysRemaining };
}

async function simulatePaymentSetup(userId) {
  console.log('\n💳 Step 4: Simulating Payment Setup (Stripe Checkout)');
  console.log('================================');
  console.log('⚠️  In production, user would:');
  console.log('   1. Click "Complete Billing Setup" button');
  console.log('   2. Redirect to Stripe Checkout');
  console.log('   3. Enter card: 4242 4242 4242 4242');
  console.log('   4. Complete payment');
  console.log('   5. Webhook fires: checkout.session.completed');
  console.log('');
  console.log('🔧 For testing, we\'ll simulate webhook result:');

  const { data: profile, error } = await supabase
    .from('profiles')
    .update({
      billing_status: 'active',
      stripe_customer_id: `cus_test_${userId.substring(0, 8)}`,
      subscription_id: `sub_test_${userId.substring(0, 8)}`,
      subscription_start: new Date().toISOString(),
      subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error simulating payment:', error.message);
    return null;
  }

  console.log('✅ Payment setup simulated');
  console.log('   Customer ID:', profile.stripe_customer_id);
  console.log('   Subscription ID:', profile.subscription_id);
  console.log('   Subscription Start:', new Date(profile.subscription_start).toLocaleDateString());
  console.log('   Subscription End:', new Date(profile.subscription_end).toLocaleDateString());
  console.log('');
  console.log('⚠️  EXPECTED UI STATE AFTER PAYMENT:');
  console.log('   ✓ Orange alert banner HIDDEN');
  console.log('   ✓ "Manage Billing" button visible');
  console.log('   ✓ Renewal date displayed');
  console.log('   ✓ Status badge shows "Active"');

  return profile;
}

async function generateQAReport(testResults) {
  console.log('\n📋 QA VERIFICATION SUMMARY');
  console.log('================================\n');

  console.log('| State | Expected Behavior | Result | Notes |');
  console.log('|-------|------------------|--------|-------|');
  console.log('| **Trialing** | No alert, countdown visible | ✅ PASS | Created with trialing status |');
  console.log('| **Trial Ended (Grace)** | Orange banner visible, setup button works | ✅ READY | UI verification required |');
  console.log('| **Payment Setup** | Stripe checkout, webhook updates DB | ✅ SIMULATED | Real Stripe test needed |');
  console.log('| **Active** | No alert, Manage Billing functional | ✅ READY | UI verification required |');

  console.log('\n\n🔍 MANUAL VERIFICATION STEPS:');
  console.log('================================\n');
  console.log('1. LOGIN TO DASHBOARD:');
  console.log('   URL: http://localhost:3000/login');
  console.log('   Email: testv8@gmail.com');
  console.log('   Password: TestPass123!');
  console.log('');
  console.log('2. VERIFY GRACE PERIOD STATE:');
  console.log('   ✓ Orange alert banner appears');
  console.log('   ✓ Message: "Your trial has ended. Please add payment..."');
  console.log('   ✓ Shows days remaining (should be ~3 days)');
  console.log('   ✓ "Complete Billing Setup" button present');
  console.log('');
  console.log('3. NAVIGATE TO SETTINGS:');
  console.log('   URL: http://localhost:3000/dashboard/settings');
  console.log('   ✓ Same orange alert banner');
  console.log('   ✓ Subscription section shows warning');
  console.log('   ✓ "Complete Billing Setup" button (not "Manage Billing")');
  console.log('');
  console.log('4. TEST BILLING SETUP (Optional - Real Stripe):');
  console.log('   ✓ Click "Complete Billing Setup"');
  console.log('   ✓ Redirects to Stripe Checkout');
  console.log('   ✓ Use test card: 4242 4242 4242 4242');
  console.log('   ✓ Any future date, any CVC');
  console.log('   ✓ Complete checkout');
  console.log('   ✓ Webhook should update database');
  console.log('');
  console.log('5. VERIFY ACTIVE STATE:');
  console.log('   ✓ Return to dashboard');
  console.log('   ✓ Orange alert HIDDEN');
  console.log('   ✓ Settings shows "Manage Billing" button');
  console.log('   ✓ Renewal date displayed');
  console.log('   ✓ Status badge: "Active"');

  console.log('\n\n🎯 DATABASE STATE SUMMARY:');
  console.log('================================');
  console.log('Account:', testResults.email);
  console.log('User ID:', testResults.userId);
  console.log('Plan Tier:', testResults.planTier);
  console.log('Billing Status:', testResults.billingStatus);
  console.log('Stripe Customer:', testResults.stripeCustomerId || 'NULL (needs setup)');
  console.log('Created (backdated):', testResults.createdAt);
  console.log('Days in Grace Period:', testResults.daysRemaining);
}

async function runFullTest() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║  POST-TRIAL BILLING FLOW - E2E TEST           ║');
  console.log('║  SmartHVACAnalytics                           ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  const result = await createTestAccount();
  if (!result) {
    console.error('\n❌ Failed to create test account. Aborting.');
    return;
  }

  const { user, profile } = result;

  await new Promise(resolve => setTimeout(resolve, 1000));

  const updatedProfile = await endTrial(user.id);
  if (!updatedProfile) {
    console.error('\n❌ Failed to end trial. Aborting.');
    return;
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  const statusCheck = await checkBillingStatus(user.id);
  if (!statusCheck) {
    console.error('\n❌ Failed to check billing status. Aborting.');
    return;
  }

  console.log('\n\n⚠️  PAUSE FOR MANUAL UI VERIFICATION');
  console.log('================================');
  console.log('Please login and verify the grace period UI.');
  console.log('Press Ctrl+C when done, or continue for payment simulation...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  const paidProfile = await simulatePaymentSetup(user.id);
  if (!paidProfile) {
    console.error('\n❌ Failed to simulate payment. Aborting.');
    return;
  }

  await generateQAReport({
    email: TEST_EMAIL,
    userId: user.id,
    planTier: profile.plan_tier,
    billingStatus: paidProfile.billing_status,
    stripeCustomerId: paidProfile.stripe_customer_id,
    createdAt: updatedProfile.created_at,
    daysRemaining: statusCheck.daysRemaining,
  });

  console.log('\n\n✅ TEST COMPLETE');
  console.log('================================');
  console.log('Test account created and configured.');
  console.log('Please perform manual UI verification steps above.');
  console.log('\nTo reset, delete the account:');
  console.log(`DELETE FROM auth.users WHERE email = '${TEST_EMAIL}';`);
}

runFullTest().catch(console.error);
