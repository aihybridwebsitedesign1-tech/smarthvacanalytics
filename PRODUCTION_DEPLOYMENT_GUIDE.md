# Production Deployment Guide

This guide covers migrating from test Stripe keys to production Stripe keys and deploying the billing system.

## Current Status

✅ **Working Features:**
- Database trigger automatically activates Growth and Pro plan signups
- Stripe webhook handles subscription updates
- Billing status tracking and renewal date display
- Portal for subscription management
- Trial period warnings for starter plan

## Pre-Deployment Checklist

### 1. Stripe Production Setup

#### A. Create Production Products and Prices

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to **Live Mode** (toggle in top right)
3. Navigate to **Products** → **Add product**
4. Create three products:

**Starter Plan**
- Name: "Starter Plan"
- Description: "Up to 3 technicians"
- Pricing: $49/month recurring
- Copy the **Price ID** (starts with `price_`)

**Growth Plan**
- Name: "Growth Plan"
- Description: "Up to 10 technicians"
- Pricing: $99/month recurring
- Copy the **Price ID** (starts with `price_`)

**Pro Plan**
- Name: "Pro Plan"
- Description: "Unlimited technicians"
- Pricing: $199/month recurring
- Copy the **Price ID** (starts with `price_`)

#### B. Get Production API Keys

1. Go to [API Keys](https://dashboard.stripe.com/apikeys)
2. Make sure you're in **Live Mode**
3. Copy your **Publishable key** (starts with `pk_live_`)
4. Reveal and copy your **Secret key** (starts with `sk_live_`)

⚠️ **CRITICAL:** Never commit live keys to version control!

#### C. Set Up Production Webhook

1. Go to [Webhooks](https://dashboard.stripe.com/webhooks)
2. Switch to **Live Mode**
3. Click **Add endpoint**
4. Enter endpoint URL: `https://yourdomain.com/api/webhooks`
5. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
6. Click **Add endpoint**
7. Copy the **Signing secret** (starts with `whsec_`)

### 2. Update Environment Variables

Update your `.env` file (or production environment) with the production values:

```bash
# Stripe Production Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_PRODUCTION_SECRET
STRIPE_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_WEBHOOK_SECRET

# Stripe Production Price IDs
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_YOUR_STARTER_PRICE_ID
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_YOUR_GROWTH_PRICE_ID
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_YOUR_PRO_PRICE_ID

# Production App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Verify Database Migrations

Ensure all migrations are applied to your production database:

```sql
-- Check that auto-activation triggers exist
SELECT proname FROM pg_proc WHERE proname IN ('auto_activate_paid_plan', 'auto_activate_plan_upgrade');

-- Should return both function names
```

### 4. Test in Production

#### Test Flow:
1. Create a test account with a Growth plan
2. Use Stripe test card: `4242 4242 4242 4242`
3. Verify account is automatically activated
4. Check that billing status shows "Active"
5. Verify renewal date displays correctly
6. Test the billing portal link

#### Verify Webhooks:
1. Go to Stripe Dashboard → Webhooks
2. Click on your webhook endpoint
3. Check "Recent events" to see if events are being received
4. Click on an event to see the payload and response

## Architecture Overview

### Activation Flow

```
User Signs Up (Growth/Pro)
         ↓
Profile Created in DB
         ↓
Database Trigger Fires ← PRIMARY ACTIVATION METHOD
         ↓
   billing_status = 'active'
   subscription_start = NOW()
   subscription_end = NOW() + 30 days
         ↓
User Sees Dashboard (No Warnings)
```

### Backup Activation (Client-Side)

If database trigger doesn't activate (edge case):
```
User Loads Dashboard
         ↓
Detects: paid plan + trialing status
         ↓
Calls /api/checkout/activate
         ↓
Manual activation
```

### Webhook Integration (Updates)

```
Stripe Webhook Event
         ↓
/api/webhooks
         ↓
Updates subscription status
Updates billing dates
Updates plan tier
```

## Monitoring

### Check Activation Status

```sql
-- View all trialing paid accounts (should be empty)
SELECT email, plan_tier, billing_status, created_at
FROM profiles
WHERE plan_tier IN ('growth', 'pro')
AND billing_status = 'trialing';

-- View recently activated accounts
SELECT email, plan_tier, billing_status, subscription_start
FROM profiles
WHERE billing_status = 'active'
AND subscription_start > NOW() - INTERVAL '24 hours'
ORDER BY subscription_start DESC;
```

### Monitor Stripe Webhooks

1. Stripe Dashboard → Developers → Webhooks
2. Click your webhook endpoint
3. Monitor "Recent deliveries"
4. Check for any failed deliveries

## Troubleshooting

### Issue: Paid accounts stuck in "trialing"

**Cause:** Database trigger not firing or webhook not reaching server

**Solution:**
1. Check database trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE '%activate%';
   ```
2. Check webhook secret is correct in `.env`
3. Manually activate:
   ```sql
   UPDATE profiles
   SET billing_status = 'active',
       subscription_start = NOW(),
       subscription_end = NOW() + INTERVAL '30 days'
   WHERE id = 'USER_ID';
   ```

### Issue: Webhook signature verification fails

**Cause:** Wrong webhook secret or payload manipulation

**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
2. Check server logs for exact error message
3. Test webhook using Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks
   ```

### Issue: Checkout returns but no activation

**Cause:** Stripe redirect not including session_id parameter

**Solution:**
- Database trigger should handle this automatically
- Client-side fallback will activate based on plan_tier
- Check browser console for activation logs

## Security Checklist

✅ Live Stripe keys stored in environment variables (not in code)
✅ Webhook signature verification enabled
✅ Row Level Security (RLS) enabled on all tables
✅ Service role key used only on server-side
✅ No sensitive data logged to console in production

## Post-Deployment Verification

1. ✅ Test signup with each plan tier
2. ✅ Verify automatic activation for paid plans
3. ✅ Test Stripe webhook delivery
4. ✅ Verify billing portal access
5. ✅ Check trial warnings show for starter plan only
6. ✅ Test subscription cancellation flow
7. ✅ Verify failed payment handling

## Support

If you encounter issues during production deployment:

1. Check server logs for error messages
2. Verify all environment variables are set
3. Test webhook delivery in Stripe Dashboard
4. Check database triggers are active
5. Monitor SQL queries for profile updates

## Rollback Plan

If critical issues occur:

1. Revert environment variables to test keys
2. Disable webhook endpoint in Stripe
3. Manually set affected accounts to 'active':
   ```sql
   UPDATE profiles
   SET billing_status = 'active'
   WHERE plan_tier IN ('growth', 'pro')
   AND billing_status = 'trialing';
   ```
