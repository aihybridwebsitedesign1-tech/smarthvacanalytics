# ✅ Production Deployment Checklist

Use this checklist to ensure everything is configured correctly before going live.

---

## 📋 Pre-Deployment Checklist

### Supabase Setup
- [ ] Created Supabase project
- [ ] Ran complete `PRODUCTION_DATABASE_SETUP.sql` in SQL Editor
- [ ] Verified all tables exist (use Table Editor to check)
- [ ] Copied Project URL
- [ ] Copied anon/public key
- [ ] Copied service_role key
- [ ] Email auth is enabled (Settings → Auth → Email)

### Stripe Setup (TEST MODE)
- [ ] Created 3 products in Stripe (Starter, Growth, Pro)
- [ ] Set correct prices ($49, $99, $199 per month)
- [ ] Copied all 3 Price IDs
- [ ] Copied Publishable Key (pk_test_...)
- [ ] Copied Secret Key (sk_test_...)
- [ ] All 6 Stripe variables ready to paste

### Code Ready
- [ ] Latest code committed to Git
- [ ] Pushed to GitHub
- [ ] `npm run build` succeeds locally
- [ ] No console errors in development

---

## 🚀 Vercel Deployment Checklist

### Initial Deployment
- [ ] Connected GitHub repository to Vercel
- [ ] Added all environment variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID`
  - [ ] `NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID`
  - [ ] `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`
  - [ ] `NEXT_PUBLIC_APP_URL`
  - [ ] `NEXT_PUBLIC_APP_NAME`
- [ ] First deployment succeeded
- [ ] Updated `NEXT_PUBLIC_APP_URL` with actual Vercel URL
- [ ] Redeployed after URL update

### Post-Deployment
- [ ] Site loads at Vercel URL
- [ ] No console errors in browser
- [ ] Homepage displays correctly
- [ ] Navigation works
- [ ] Can access /signup page
- [ ] Can access /login page
- [ ] Can access /pricing page

---

## 🔗 Stripe Webhook Checklist

- [ ] Created webhook at https://dashboard.stripe.com/test/webhooks
- [ ] Webhook endpoint URL: `https://your-app.vercel.app/api/webhooks`
- [ ] Selected events:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
- [ ] Copied webhook signing secret (whsec_...)
- [ ] Added `STRIPE_WEBHOOK_SECRET` to Vercel
- [ ] Redeployed after adding webhook secret

---

## 🧪 Testing Checklist

### Authentication Testing
- [ ] Can create new account (sign up)
- [ ] Receive confirmation in Supabase Auth Users table
- [ ] Can log in with created account
- [ ] Can log out
- [ ] Redirected to login when accessing protected routes while logged out

### Payment Flow Testing (TEST MODE)
- [ ] Can access pricing page while logged out
- [ ] All 3 plans display correctly
- [ ] Can click "Subscribe" on any plan
- [ ] Redirected to Stripe Checkout
- [ ] Can complete checkout with test card: `4242 4242 4242 4242`
- [ ] Redirected back to dashboard after payment
- [ ] Plan tier is updated in profile
- [ ] Billing status shows "active"
- [ ] Can access dashboard features

### Stripe Verification
- [ ] Payment appears in Stripe Dashboard → Payments
- [ ] Customer created in Stripe Dashboard → Customers
- [ ] Subscription created in Stripe Dashboard → Subscriptions
- [ ] Webhook delivered successfully (check webhook endpoint details)

### Database Verification
- [ ] User profile created in `profiles` table
- [ ] Correct plan_tier set in profile
- [ ] billing_status is "active"
- [ ] stripe_customer_id populated
- [ ] subscription_id populated

### Dashboard Testing
- [ ] Can access dashboard after signup
- [ ] Can create technicians
- [ ] Can create jobs
- [ ] Analytics page loads
- [ ] Can navigate between dashboard pages
- [ ] Settings page displays user info

---

## 🔴 Go-Live Checklist (Production Mode)

**Only complete this when ready to accept REAL payments!**

### Stripe Live Mode Setup
- [ ] Activated Stripe account (completed business verification)
- [ ] Switched to Live Mode in Stripe
- [ ] Created 3 products in LIVE mode (same prices)
- [ ] Copied LIVE Publishable Key (pk_live_...)
- [ ] Copied LIVE Secret Key (sk_live_...)
- [ ] Copied all 3 LIVE Price IDs
- [ ] Created webhook in LIVE mode
- [ ] Copied LIVE webhook secret (whsec_...)

### Vercel Update for Live Mode
- [ ] Updated `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → pk_live_...
- [ ] Updated `STRIPE_SECRET_KEY` → sk_live_...
- [ ] Updated `NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID` → live price
- [ ] Updated `NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID` → live price
- [ ] Updated `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` → live price
- [ ] Updated `STRIPE_WEBHOOK_SECRET` → live webhook secret
- [ ] Redeployed

### Live Testing
- [ ] Make test purchase with REAL card (you can refund it)
- [ ] Verify payment shows in Stripe Live Dashboard
- [ ] Verify user gets proper access
- [ ] Test webhook delivery
- [ ] Refund test payment if desired

---

## 🌐 Custom Domain Checklist (Optional)

- [ ] Purchased domain name
- [ ] Added domain in Vercel Settings → Domains
- [ ] Updated DNS records (as instructed by Vercel)
- [ ] Domain verified and working
- [ ] Updated `NEXT_PUBLIC_APP_URL` to custom domain
- [ ] Updated Stripe webhook URL to custom domain
- [ ] Redeployed

---

## 🔒 Security Checklist

- [ ] All API keys kept secret (never in Git)
- [ ] Service role key only in server environment
- [ ] RLS enabled on all Supabase tables
- [ ] Tested that users can't access other users' data
- [ ] HTTPS working (automatic with Vercel)
- [ ] No sensitive data in console logs

---

## 📊 Monitoring Setup (Recommended)

- [ ] Set up Vercel Analytics (Settings → Analytics)
- [ ] Check Vercel logs regularly (Deployments → Functions)
- [ ] Monitor Stripe Dashboard for failed payments
- [ ] Set up error alerts in Vercel (Settings → Integrations)

---

## 🎉 Launch Day!

- [ ] All above checklists completed
- [ ] Tested thoroughly
- [ ] Ready to accept real payments
- [ ] Marketing materials prepared
- [ ] Support email set up
- [ ] Pricing and terms clearly displayed
- [ ] Privacy policy and terms of service linked

---

## 📝 Notes

Add any custom notes or reminders here:

```
[Your notes here]
```

---

## 🆘 Emergency Contacts

- **Vercel Support**: https://vercel.com/support
- **Stripe Support**: https://support.stripe.com
- **Supabase Support**: https://supabase.com/dashboard/support/new

---

**You've got this! Follow the checklist step by step and you'll be live in no time! 🚀**
