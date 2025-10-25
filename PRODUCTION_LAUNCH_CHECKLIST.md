# Production Launch Checklist

Complete guide to take your HVAC Analytics SaaS from test to live production.

## Phase 1: Domain Setup

### 1.1 Purchase Domain (if not already owned)
- [ ] Purchase domain from registrar (Namecheap, Google Domains, etc.)
- [ ] Recommended: `yourbrand.com` or `hvacanalytics.app`

### 1.2 Configure Custom Domain on Bolt.new
- [ ] Go to Bolt.new project settings
- [ ] Navigate to "Custom Domain" section
- [ ] Add your custom domain (e.g., `app.yourdomain.com`)
- [ ] Copy the DNS records provided by Bolt.new
- [ ] Add DNS records to your domain registrar:
  - A record or CNAME record as specified
  - Wait for DNS propagation (5-60 minutes)
- [ ] Verify domain is accessible via HTTPS

### 1.3 Update Environment Variables
```bash
# Update to your production domain
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
```

## Phase 2: Stripe Production Setup

### 2.1 Activate Stripe Account for Live Payments
- [ ] Go to [Stripe Dashboard](https://dashboard.stripe.com)
- [ ] Complete account activation:
  - [ ] Add business details
  - [ ] Add bank account for payouts
  - [ ] Verify identity (if required)
  - [ ] Accept terms of service
- [ ] Wait for approval (usually instant, can take 1-2 days)

### 2.2 Create Production Products
- [ ] Switch to **Live Mode** in Stripe Dashboard
- [ ] Go to Products → Create Product

**Starter Plan:**
```
Name: Starter Plan
Description: Perfect for small HVAC businesses
Price: $49/month (recurring)
Features: Up to 3 technicians, Basic analytics, Job tracking
```
- [ ] Copy Price ID: `price_________________`

**Growth Plan:**
```
Name: Growth Plan
Description: For growing HVAC companies
Price: $99/month (recurring)
Features: Up to 10 technicians, Advanced analytics, Priority support
```
- [ ] Copy Price ID: `price_________________`

**Pro Plan:**
```
Name: Pro Plan
Description: For large HVAC operations
Price: $199/month (recurring)
Features: Unlimited technicians, Premium analytics, White-glove support
```
- [ ] Copy Price ID: `price_________________`

### 2.3 Get Production API Keys
- [ ] Go to [Stripe API Keys](https://dashboard.stripe.com/apikeys)
- [ ] Ensure you're in **Live Mode**
- [ ] Copy Publishable Key: `pk_live_________________`
- [ ] Reveal and copy Secret Key: `sk_live_________________`

⚠️ **SECURITY:** Never commit these keys to version control!

### 2.4 Configure Production Webhook
- [ ] Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
- [ ] Switch to **Live Mode**
- [ ] Click "Add endpoint"
- [ ] Endpoint URL: `https://app.yourdomain.com/api/webhooks`
- [ ] Description: "Production Subscription Webhooks"
- [ ] Select events:
  - [x] `checkout.session.completed`
  - [x] `customer.subscription.created`
  - [x] `customer.subscription.updated`
  - [x] `customer.subscription.deleted`
  - [x] `invoice.payment_succeeded`
  - [x] `invoice.payment_failed`
- [ ] Click "Add endpoint"
- [ ] Copy Signing Secret: `whsec_________________`

### 2.5 Update Production Environment Variables

Update your `.env` file or Bolt.new environment settings:

```bash
# ============================================
# PRODUCTION STRIPE CONFIGURATION
# ============================================

# Publishable Key (Live Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE

# Secret Key (Live Mode)
STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE

# Webhook Secret (Live Mode)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE

# Production Price IDs
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_YOUR_STARTER_ID
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_YOUR_GROWTH_ID
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_YOUR_PRO_ID

# Production Domain
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com

# App Name
NEXT_PUBLIC_APP_NAME=SmartHVACAnalytics
```

## Phase 3: Supabase Production Setup

### 3.1 Verify Production Database
- [ ] Confirm Supabase project is on paid plan (if needed)
- [ ] Verify all migrations are applied
- [ ] Check database has proper indexes
- [ ] Verify RLS policies are enabled on all tables

### 3.2 Database Health Check
Run these queries in Supabase SQL Editor:

```sql
-- Verify all triggers exist
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%activate%';

-- Check RLS is enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;

-- Should return empty result (all tables have RLS)
```

### 3.3 Review Database Policies
- [ ] Verify users can only access their own data
- [ ] Test that unauthenticated users can't access protected data
- [ ] Confirm service role is only used on server-side

## Phase 4: Application Configuration

### 4.1 Update Branding (if needed)
- [ ] Update `NEXT_PUBLIC_APP_NAME` in `.env`
- [ ] Update logo/favicon if needed
- [ ] Update meta tags for SEO
- [ ] Update pricing page copy

### 4.2 Remove Demo Data (Optional)
If you want to start with clean database:
```sql
-- Clear demo data (CAUTION: Only run if you want fresh start)
TRUNCATE jobs, technicians, kpi_snapshots, recommendations CASCADE;
```

### 4.3 Configure Email (Optional but Recommended)
Set up transactional emails for:
- Welcome emails
- Billing notifications
- Trial expiration reminders

Options:
- Use Supabase Auth email templates
- Integrate SendGrid, Mailgun, or Resend

### 4.4 Analytics & Monitoring (Recommended)
- [ ] Add Google Analytics or Plausible
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom)

## Phase 5: Testing in Production

### 5.1 Test Complete Signup Flow
- [ ] Create test account with real email
- [ ] Select Starter plan (free trial)
- [ ] Verify account is created with "trialing" status
- [ ] Check 14-day trial warning appears
- [ ] Verify dashboard loads correctly

### 5.2 Test Paid Signup Flow
- [ ] Create test account with real email
- [ ] Select Growth plan
- [ ] Use Stripe test card: `4242 4242 4242 4242`
  - Use any future expiry date
  - Use any 3-digit CVC
  - Use any 5-digit ZIP
- [ ] Complete checkout
- [ ] Verify redirect to dashboard
- [ ] Confirm no warnings appear
- [ ] Verify renewal date shows correctly
- [ ] Check Stripe Dashboard for successful payment

### 5.3 Test Billing Portal
- [ ] Log in to account with paid plan
- [ ] Go to Settings
- [ ] Click "Manage Subscription"
- [ ] Verify Stripe portal opens
- [ ] Test updating payment method
- [ ] Test viewing invoices

### 5.4 Test Webhook Delivery
- [ ] Complete a test payment
- [ ] Go to Stripe Dashboard → Webhooks
- [ ] Click your webhook endpoint
- [ ] Verify "Recent deliveries" shows successful events
- [ ] Check response is 200 OK

### 5.5 Test Trial Expiration (Starter Plan)
- [ ] Create account with Starter plan
- [ ] Manually set trial to expire soon:
```sql
UPDATE profiles
SET subscription_end = NOW() + INTERVAL '1 day'
WHERE email = 'test@example.com';
```
- [ ] Verify warning banner appears
- [ ] Click "Upgrade Plan"
- [ ] Verify pricing page loads

## Phase 6: Legal & Compliance

### 6.1 Terms & Privacy
- [ ] Add Terms of Service page
- [ ] Add Privacy Policy page
- [ ] Add Cookie Policy (if using cookies)
- [ ] Link from footer navigation
- [ ] Include acceptance in signup flow

### 6.2 GDPR Compliance (if applicable)
- [ ] Add data deletion functionality
- [ ] Provide data export option
- [ ] Add cookie consent banner
- [ ] Update privacy policy with GDPR info

### 6.3 Payment Terms
- [ ] Clearly state refund policy
- [ ] Disclose auto-renewal terms
- [ ] Provide cancellation instructions
- [ ] Link to Stripe's privacy policy

## Phase 7: Launch

### 7.1 Pre-Launch
- [ ] Run full test suite
- [ ] Check all links work
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Verify SSL certificate is valid
- [ ] Check page load times

### 7.2 Soft Launch
- [ ] Share with small group of beta testers
- [ ] Collect feedback
- [ ] Monitor error logs
- [ ] Watch Stripe dashboard for issues
- [ ] Check Supabase logs for errors

### 7.3 Public Launch
- [ ] Announce on social media
- [ ] Email marketing (if you have list)
- [ ] Submit to product directories:
  - Product Hunt
  - BetaList
  - SaaSHub
  - AlternativeTo
- [ ] Share in relevant communities:
  - Reddit (r/HVAC, r/SaaS)
  - HVAC forums
  - Industry Facebook groups

## Phase 8: Post-Launch Monitoring

### 8.1 Daily Checks (First Week)
- [ ] Monitor new signups
- [ ] Check for failed payments
- [ ] Review error logs
- [ ] Monitor webhook deliveries
- [ ] Check customer feedback

### 8.2 Weekly Tasks
- [ ] Review Stripe dashboard metrics
- [ ] Check database performance
- [ ] Analyze user behavior
- [ ] Address support tickets
- [ ] Monitor churn rate

### 8.3 Key Metrics to Track
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Churn rate
- Trial-to-paid conversion rate

## Quick Reference: Environment Variables Checklist

**Test Environment (Current):**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (test)
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_... (test)
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_... (test)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_... (test)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Production Environment (To Deploy):**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (live)
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_... (live)
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_... (live)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_... (live)
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
```

## Rollback Plan

If critical issues arise after launch:

1. **Immediate:** Disable new signups (add maintenance mode)
2. **Stripe:** Pause webhook endpoint to prevent bad data
3. **Database:** Restore from backup if needed
4. **Code:** Revert to previous stable version
5. **Communication:** Email affected users with status update

## Support Resources

**Stripe Support:**
- Dashboard: https://dashboard.stripe.com
- Docs: https://stripe.com/docs
- Support: https://support.stripe.com

**Supabase Support:**
- Dashboard: https://app.supabase.com
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

**Bolt.new Support:**
- Documentation: Check Bolt.new docs for deployment
- Community: Bolt.new Discord/forums

---

## Ready to Launch? 🚀

Before going live, ensure:
- ✅ All test checkboxes above are checked
- ✅ Production Stripe keys are configured
- ✅ Custom domain is connected and verified
- ✅ Webhook is receiving events successfully
- ✅ Test payment completed successfully
- ✅ Legal pages (Terms/Privacy) are published

**Need help?** Review `PRODUCTION_DEPLOYMENT_GUIDE.md` for detailed technical steps.
