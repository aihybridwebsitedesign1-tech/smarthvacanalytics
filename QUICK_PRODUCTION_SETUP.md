# Quick Production Setup Guide

## 🚀 5-Minute Production Setup

Follow these steps to go from test to production:

### Step 1: Get Your Custom Domain (5 min)

1. **Purchase domain** (if needed): Namecheap, Google Domains, etc.
   - Recommended format: `app.yourbrand.com` or `yourbrand.app`

2. **Configure on Bolt.new:**
   - Go to your project settings in Bolt.new
   - Find "Custom Domain" section
   - Add your domain
   - Copy the DNS records provided

3. **Update DNS at your registrar:**
   - Add the A/CNAME records from Bolt.new
   - Wait 5-60 minutes for propagation
   - Verify HTTPS is working

### Step 2: Stripe Live Mode Setup (10 min)

1. **Activate Stripe Account:**
   - Go to https://dashboard.stripe.com
   - Click "Activate your account"
   - Fill in business details
   - Add bank account
   - Submit for approval

2. **Switch to Live Mode** (top-right toggle)

3. **Create 3 Products:**

   **Product 1: Starter Plan**
   ```
   Name: Starter Plan
   Price: $49/month
   Billing: Recurring monthly
   ```
   → Copy Price ID: `price_________________`

   **Product 2: Growth Plan**
   ```
   Name: Growth Plan
   Price: $99/month
   Billing: Recurring monthly
   ```
   → Copy Price ID: `price_________________`

   **Product 3: Pro Plan**
   ```
   Name: Pro Plan
   Price: $199/month
   Billing: Recurring monthly
   ```
   → Copy Price ID: `price_________________`

4. **Get API Keys:**
   - Go to Developers → API Keys
   - Copy **Publishable key**: `pk_live_________________`
   - Reveal and copy **Secret key**: `sk_live_________________`

5. **Create Webhook:**
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://YOUR-DOMAIN.com/api/webhooks`
   - Events: Select these:
     - ✅ `checkout.session.completed`
     - ✅ `customer.subscription.updated`
     - ✅ `customer.subscription.deleted`
     - ✅ `invoice.payment_failed`
   - Copy **Signing secret**: `whsec_________________`

### Step 3: Update Environment Variables (2 min)

Replace your `.env` file with production values:

```bash
# ============================================
# PRODUCTION ENVIRONMENT VARIABLES
# ============================================

# Supabase (keep existing)
NEXT_PUBLIC_SUPABASE_URL=https://kvgptvhspucsokvxwlql.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe LIVE Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE

# Stripe LIVE Price IDs
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_YOUR_STARTER_ID
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_YOUR_GROWTH_ID
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_YOUR_PRO_ID

# Your Custom Domain
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com

# App Info
NEXT_PUBLIC_APP_NAME=SmartHVACAnalytics
```

### Step 4: Test Production (5 min)

1. **Test Signup Flow:**
   - Visit your custom domain
   - Create a test account
   - Select Growth plan
   - Use test card: `4242 4242 4242 4242`
   - Verify checkout completes
   - Confirm account is activated (no warnings)

2. **Verify Webhook:**
   - Go to Stripe Dashboard → Webhooks
   - Check "Recent deliveries"
   - Should show 200 OK responses

3. **Test Billing Portal:**
   - Log into test account
   - Go to Settings
   - Click "Manage Subscription"
   - Verify Stripe portal opens

### Step 5: Go Live! (1 min)

✅ All tests passing? You're ready to accept real payments!

1. **Change to real card:**
   - Remove test mode indicator (if any)
   - Ready to process real payments

2. **Announce:**
   - Share on social media
   - Email your list
   - Submit to directories

---

## ⚠️ Important Security Notes

1. **NEVER commit live keys to Git**
   - Use environment variables only
   - Add `.env` to `.gitignore`

2. **Keep test mode for development**
   - Use test keys locally
   - Only use live keys in production

3. **Monitor webhook deliveries**
   - Check Stripe dashboard regularly
   - Set up failure alerts

---

## 🎯 Quick Checklist

Before going live, verify:

- [ ] Custom domain connected and HTTPS working
- [ ] Stripe account activated
- [ ] All 3 products created in live mode
- [ ] Live API keys added to environment
- [ ] Webhook endpoint configured
- [ ] Test payment completed successfully
- [ ] Legal pages (Terms/Privacy) accessible
- [ ] Footer links working

---

## 🆘 Need Help?

**Common Issues:**

1. **Domain not working?**
   - Wait up to 60 min for DNS propagation
   - Check DNS records match Bolt.new exactly
   - Verify CNAME/A record is correct

2. **Stripe errors?**
   - Make sure you're in LIVE mode
   - Verify keys are correct (pk_live, sk_live)
   - Check webhook secret matches

3. **Accounts stuck in trial?**
   - Check webhook is receiving events
   - Verify webhook URL is correct
   - Check database trigger is active

**Support Resources:**
- Stripe Dashboard: https://dashboard.stripe.com
- Supabase Dashboard: https://app.supabase.com
- Full Guide: See `PRODUCTION_LAUNCH_CHECKLIST.md`

---

## 📊 Post-Launch Monitoring

**First 24 Hours:**
- Monitor new signups
- Check Stripe dashboard for payments
- Watch webhook deliveries
- Review error logs

**Weekly:**
- Review conversion rates
- Check failed payments
- Analyze user feedback
- Monitor churn rate

---

## 🎉 You're Live!

Your HVAC Analytics SaaS is now accepting real customers and payments.

Monitor your metrics and iterate based on user feedback. Good luck! 🚀
