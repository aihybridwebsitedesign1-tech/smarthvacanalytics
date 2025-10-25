# Stripe Integration Setup Guide

## 🎯 Overview

Your SmartHVACAnalytics application is fully integrated with Stripe for subscription billing. However, you need to configure your **real Stripe API keys** to enable payments.

**Current Status**: ⚠️ Placeholder keys detected - payments will not work until you add real keys.

---

## 📋 Quick Setup Checklist

- [ ] Create Stripe account (or login)
- [ ] Get API keys from Stripe Dashboard
- [ ] Create 3 subscription products (Starter, Growth, Pro)
- [ ] Copy Price IDs
- [ ] Update `.env` file with real keys
- [ ] Set up webhook endpoint
- [ ] Test checkout flow
- [ ] Verify webhook receives events

**Estimated Time**: 15-20 minutes

---

## 🚀 Step-by-Step Setup

### Step 1: Create/Login to Stripe Account

1. **Go to**: https://dashboard.stripe.com/register
2. **Sign up** or **login** if you already have an account
3. **Activate your account** (provide business details)
4. **Switch to Test Mode** (toggle in top-right corner)

**Note**: Always use **Test Mode** for development. Switch to **Live Mode** only for production.

---

### Step 2: Get Your API Keys

1. **Navigate to**: https://dashboard.stripe.com/test/apikeys
2. You'll see two keys:

   **Publishable Key** (starts with `pk_test_...`)
   - This is safe to use in your frontend code
   - Click "Reveal test key" to copy it

   **Secret Key** (starts with `sk_test_...`)
   - This is sensitive - NEVER expose to frontend
   - Click "Reveal test key" to copy it

3. **Copy both keys** and save them temporarily

---

### Step 3: Create Subscription Products

You need to create 3 products in Stripe for your 3 pricing plans.

#### 3.1 Create Starter Plan

1. **Go to**: https://dashboard.stripe.com/test/products
2. Click **"+ Add product"**
3. Fill in:
   - **Name**: `Starter Plan`
   - **Description**: `Perfect for small HVAC businesses. Up to 3 technicians.`
   - **Pricing model**: Standard pricing
   - **Price**: `$49.00`
   - **Billing period**: Monthly
   - **Payment type**: Recurring
4. Click **"Save product"**
5. **Copy the Price ID** (starts with `price_...`) - you'll need this!

#### 3.2 Create Growth Plan

1. Click **"+ Add product"**
2. Fill in:
   - **Name**: `Growth Plan`
   - **Description**: `For growing HVAC teams. Up to 10 technicians with advanced analytics.`
   - **Price**: `$99.00`
   - **Billing period**: Monthly
3. Click **"Save product"**
4. **Copy the Price ID**

#### 3.3 Create Pro Plan

1. Click **"+ Add product"**
2. Fill in:
   - **Name**: `Pro Plan`
   - **Description**: `For established HVAC businesses. Unlimited technicians with full features.`
   - **Price**: `$199.00`
   - **Billing period**: Monthly
3. Click **"Save product"**
4. **Copy the Price ID**

**Important**: Save all 3 Price IDs - you'll need them in the next step!

---

### Step 4: Update Your .env File

Open your `.env` file and replace the placeholder values:

```bash
# Replace these placeholder values:

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_REAL_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_REAL_KEY_HERE

NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_YOUR_STARTER_PRICE_ID
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_YOUR_GROWTH_PRICE_ID
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_YOUR_PRO_PRICE_ID
```

**Example** (your keys will look different):
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51OvRXY2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8
STRIPE_SECRET_KEY=sk_test_51OvRXY2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8

NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_1QRsTuV2L3M4N5O6P7Q8R9S0
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_1QRsTuV2L3M4N5O6P7Q8R9S1
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_1QRsTuV2L3M4N5O6P7Q8R9S2
```

**Save the file** and **restart your dev server**:
```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev
```

---

### Step 5: Test the Checkout Flow

1. **Login** to your application at: http://localhost:3000/login
   - Email: testv8@gmail.com
   - Password: TestPass123!

2. **You should see** the orange billing alert (grace period)

3. **Click** "Complete Billing Setup"

4. **You should be redirected** to Stripe Checkout page

5. **Use Stripe test card**:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

6. **Complete the checkout**

7. **You'll be redirected** back to your dashboard

**Expected Result**: The orange alert banner should disappear (after webhook processes).

---

### Step 6: Set Up Webhook Endpoint

Webhooks allow Stripe to notify your app when events happen (like successful payments).

#### 6.1 For Local Development (Using Stripe CLI)

1. **Install Stripe CLI**: https://stripe.com/docs/stripe-cli

   **Mac**:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

   **Windows**:
   Download from: https://github.com/stripe/stripe-cli/releases

2. **Login to Stripe CLI**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks
   ```

4. **Copy the webhook signing secret** (starts with `whsec_...`)

5. **Update .env**:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_LOCAL_SECRET_HERE
   ```

6. **Keep the terminal running** while testing

#### 6.2 For Production

1. **Go to**: https://dashboard.stripe.com/test/webhooks
2. Click **"+ Add endpoint"**
3. **Endpoint URL**: `https://your-domain.com/api/webhooks`
4. **Select events**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **"Add endpoint"**
6. **Copy the Signing secret** (starts with `whsec_...`)
7. **Update .env**:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_SECRET_HERE
   ```

---

## 🧪 Testing Your Integration

### Test Scenario 1: New Subscription

1. Login with testv8@gmail.com (in grace period)
2. Click "Complete Billing Setup"
3. Complete checkout with test card: `4242 4242 4242 4242`
4. Verify webhook receives `checkout.session.completed`
5. Check database - should have:
   - `stripe_customer_id` populated
   - `subscription_id` populated
   - `billing_status` = 'active'
6. Verify orange alert banner disappears
7. Verify "Manage Billing" button appears in settings

### Test Scenario 2: Manage Billing

1. Login as user with active subscription
2. Go to Settings page
3. Click "Manage Billing"
4. Should redirect to Stripe Customer Portal
5. Can update payment method
6. Can cancel subscription (test only!)

### Test Scenario 3: Failed Payment

Use test card: `4000 0000 0000 0341` (card declined)
1. Start checkout
2. Payment should fail
3. User should see error message
4. Should remain in grace period
5. Can retry with valid card

---

## 🎴 Stripe Test Cards

Stripe provides test cards for different scenarios:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | ✅ Successful payment |
| `4000 0000 0000 0341` | ❌ Card declined |
| `4000 0000 0000 9995` | ❌ Insufficient funds |
| `4000 0000 0000 0002` | ❌ Card declined |
| `4000 0027 6000 3184` | ✅ 3D Secure authentication |

**For all cards**:
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

More test cards: https://stripe.com/docs/testing

---

## 🔍 Verifying Everything Works

### Checklist

- [ ] Publishable key starts with `pk_test_` (not placeholder)
- [ ] Secret key starts with `sk_test_` (not placeholder)
- [ ] All 3 price IDs start with `price_`
- [ ] Dev server restarted after updating .env
- [ ] Test checkout completes successfully
- [ ] Redirects to Stripe Checkout page
- [ ] Can complete payment with test card
- [ ] Returns to dashboard after payment
- [ ] Orange alert disappears
- [ ] "Manage Billing" button appears
- [ ] Webhook receives events (if using Stripe CLI)
- [ ] Database updates with customer/subscription IDs

---

## 🐛 Troubleshooting

### Error: "Failed to start checkout"

**Cause**: Invalid or placeholder Stripe keys

**Solution**:
1. Verify keys in `.env` are real Stripe keys
2. Ensure keys start with `pk_test_` and `sk_test_`
3. Restart dev server: `npm run dev`
4. Clear browser cache
5. Check browser console for errors

### Error: "No such price: price_..."

**Cause**: Price ID doesn't exist in your Stripe account

**Solution**:
1. Go to https://dashboard.stripe.com/test/products
2. Verify your products exist
3. Copy the correct Price IDs
4. Update `.env` with correct IDs
5. Restart dev server

### Checkout page doesn't load

**Cause**: Invalid publishable key or network error

**Solution**:
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is correct
3. Ensure you're in Test Mode in Stripe Dashboard
4. Try a different browser

### Webhook not receiving events

**Cause**: Webhook not configured or secret incorrect

**Solution**:
1. For local: Ensure `stripe listen` is running
2. For local: Copy the signing secret from terminal
3. For production: Verify webhook endpoint is reachable
4. Check webhook logs in Stripe Dashboard
5. Verify `STRIPE_WEBHOOK_SECRET` matches

### Database not updating after payment

**Cause**: Webhook not processing or database error

**Solution**:
1. Check webhook logs in Stripe Dashboard
2. Check server logs for errors
3. Verify webhook secret is correct
4. Ensure webhook is listening for `checkout.session.completed`
5. Run SQL query to check profile:
   ```sql
   SELECT * FROM profiles WHERE email = 'testv8@gmail.com';
   ```

---

## 🎯 What Happens After Setup

Once Stripe is properly configured:

1. **Trial Period (14 days)**:
   - Users can use all features
   - No payment required
   - No billing alerts

2. **Grace Period (5 days after trial)**:
   - Orange alert banner appears
   - Shows days remaining countdown
   - "Complete Billing Setup" button visible
   - All features still accessible

3. **After Payment Setup**:
   - User completes Stripe Checkout
   - Webhook updates database
   - Alert banner disappears
   - "Manage Billing" button appears
   - Subscription is active

4. **Active Subscription**:
   - Monthly billing
   - Can manage billing via Stripe Portal
   - Can upgrade/downgrade plans
   - Can update payment methods
   - Can cancel subscription

---

## 📊 Monitoring Subscriptions

### Stripe Dashboard

Monitor your subscriptions at: https://dashboard.stripe.com/test/subscriptions

You can see:
- Active subscriptions
- Upcoming invoices
- Failed payments
- Cancellations
- Revenue analytics

### Your Database

Check subscription status:

```sql
SELECT
  email,
  company_name,
  plan_tier,
  billing_status,
  stripe_customer_id,
  subscription_id,
  subscription_start,
  subscription_end
FROM profiles
WHERE stripe_customer_id IS NOT NULL;
```

---

## 🔐 Security Best Practices

1. **NEVER commit your .env file** to git (already in .gitignore)
2. **NEVER expose secret key** to frontend code
3. **Use environment variables** for all sensitive data
4. **Verify webhook signatures** (already implemented)
5. **Use HTTPS** in production
6. **Keep Stripe.js up to date**
7. **Test thoroughly** before going live
8. **Monitor webhook logs** for suspicious activity
9. **Rotate keys** if compromised
10. **Use Stripe's security tools** (Radar for fraud detection)

---

## 🚀 Going Live (Production)

When you're ready for real payments:

1. **Complete Stripe activation** (business info, bank details)
2. **Switch to Live Mode** in Stripe Dashboard
3. **Get Live API keys** from https://dashboard.stripe.com/apikeys
4. **Create Live products** (same as test products)
5. **Update .env** with live keys:
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_... (live)
   NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_... (live)
   NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_... (live)
   ```
6. **Set up production webhook** with your live domain
7. **Test with a real card** (small amount)
8. **Monitor first transactions** closely
9. **Set up email notifications** for failed payments
10. **Enable Stripe Radar** for fraud protection

---

## 📚 Additional Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe API Reference**: https://stripe.com/docs/api
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
- **Stripe Testing**: https://stripe.com/docs/testing
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Support**: https://support.stripe.com

---

## 🎉 You're All Set!

Once you've completed these steps, your SmartHVACAnalytics billing system will be fully operational with:

✅ Subscription checkout
✅ Payment processing
✅ Webhook integration
✅ Customer portal
✅ Automatic billing
✅ Grace period handling
✅ Trial management

**Need help?** Check the troubleshooting section or refer to Stripe's excellent documentation.

**Good luck! 🚀**
