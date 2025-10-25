# SmartHVACAnalytics - Production-Ready SaaS

A complete HVAC business analytics and management platform with subscription billing.

## 🎉 Current Status: READY FOR PRODUCTION

Your application is **fully functional** with test Stripe integration. Follow the guides below to launch with real payments.

---

## ✅ What's Working

### Core Features
- ✅ User authentication (Supabase Auth)
- ✅ Multi-tier subscription plans (Starter, Growth, Pro)
- ✅ Automatic billing activation for paid plans
- ✅ 14-day free trial for Starter plan
- ✅ Stripe checkout integration
- ✅ Subscription management portal
- ✅ Real-time billing status tracking
- ✅ Renewal date display and warnings

### Analytics Features
- ✅ Job tracking and management
- ✅ Technician performance monitoring
- ✅ KPI dashboard (revenue, completion rate, satisfaction)
- ✅ Business insights and recommendations
- ✅ Time range filters (7d, 30d, 90d, 1y)
- ✅ Data export (PDF, CSV)
- ✅ Demo data for testing

### Technical Infrastructure
- ✅ Database triggers for auto-activation
- ✅ Stripe webhook integration
- ✅ Row Level Security (RLS) on all tables
- ✅ Secure payment processing
- ✅ Legal pages (Terms, Privacy)
- ✅ Responsive design (mobile + desktop)

---

## 🚀 Quick Start: Go Live in 20 Minutes

### Option 1: Quick Setup (Recommended)
Follow: **`QUICK_PRODUCTION_SETUP.md`**

This guide walks you through:
1. Custom domain setup (5 min)
2. Stripe live mode activation (10 min)
3. Environment variable updates (2 min)
4. Testing and verification (5 min)

### Option 2: Detailed Setup
Follow: **`PRODUCTION_LAUNCH_CHECKLIST.md`**

Comprehensive checklist with:
- Step-by-step instructions
- Legal considerations
- Post-launch monitoring
- Troubleshooting guide

### Option 3: Technical Details
Follow: **`PRODUCTION_DEPLOYMENT_GUIDE.md`**

Deep dive into:
- Architecture overview
- Database migrations
- Security best practices
- Rollback procedures

---

## 📋 Pre-Launch Checklist

### Domain Setup
- [ ] Purchase custom domain
- [ ] Configure DNS records
- [ ] Verify HTTPS is working
- [ ] Update `NEXT_PUBLIC_APP_URL` in `.env`

### Stripe Configuration
- [ ] Activate Stripe account
- [ ] Switch to Live Mode
- [ ] Create 3 products (Starter, Growth, Pro)
- [ ] Copy production Price IDs
- [ ] Get live API keys (pk_live, sk_live)
- [ ] Set up webhook endpoint
- [ ] Copy webhook signing secret

### Environment Variables
- [ ] Update all Stripe keys to live mode
- [ ] Update all Price IDs to production
- [ ] Update APP_URL to custom domain
- [ ] Verify Supabase credentials

### Testing
- [ ] Test complete signup flow
- [ ] Test Stripe checkout
- [ ] Verify automatic activation
- [ ] Check webhook deliveries
- [ ] Test billing portal
- [ ] Verify legal pages load

---

## 🔑 Environment Variables

### Current (Test Mode)
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (test)
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_... (test)
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_... (test)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_... (test)
```

### Production (To Deploy)
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (live)
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_... (live)
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_... (live)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_... (live)
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
```

---

## 💰 Pricing Plans

### Starter Plan - $49/month
- Up to 3 technicians
- Basic job tracking
- KPI dashboard
- 14-day free trial
- Email support

### Growth Plan - $99/month
- Up to 10 technicians
- Advanced analytics
- Business insights
- Priority support
- No trial (instant activation)

### Pro Plan - $199/month
- Unlimited technicians
- Premium analytics
- Custom reports
- White-glove support
- No trial (instant activation)

---

## 🏗️ Architecture

### Tech Stack
- **Framework:** Next.js 13 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Payments:** Stripe
- **Hosting:** Bolt.new / Vercel
- **Styling:** Tailwind CSS + shadcn/ui

### Key Components

**Frontend:**
- `/app` - Next.js pages
- `/components` - Reusable UI components
- `/lib` - Utilities and helpers

**Backend:**
- `/app/api` - API routes
- `/supabase/migrations` - Database schema
- `/supabase/functions` - Edge functions (if needed)

**Billing Flow:**
```
User Signs Up → Selects Plan → Stripe Checkout
→ Payment Success → Webhook Event → Auto-Activation
→ User Dashboard (No Warnings, Shows Renewal Date)
```

---

## 🔒 Security Features

- ✅ HTTPS encryption (via Bolt.new/custom domain)
- ✅ Password hashing (bcrypt via Supabase)
- ✅ Row Level Security on all database tables
- ✅ Stripe webhook signature verification
- ✅ Environment variables for secrets
- ✅ No credit card storage (handled by Stripe)
- ✅ GDPR & CCPA compliant data practices

---

## 📊 Monitoring & Analytics

### Recommended Tools
- **Uptime:** UptimeRobot, Pingdom
- **Errors:** Sentry, LogRocket
- **Analytics:** Plausible, Google Analytics
- **Payments:** Stripe Dashboard

### Key Metrics to Track
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Churn Rate
- Trial-to-Paid Conversion
- Average Revenue Per User (ARPU)

---

## 🆘 Troubleshooting

### Accounts Stuck in Trial
**Cause:** Database trigger or webhook not firing

**Solution:**
```sql
UPDATE profiles
SET billing_status = 'active',
    subscription_start = NOW(),
    subscription_end = NOW() + INTERVAL '30 days'
WHERE plan_tier IN ('growth', 'pro')
AND billing_status = 'trialing';
```

### Webhook Failures
**Cause:** Wrong secret or unreachable endpoint

**Solution:**
1. Check webhook secret matches `.env`
2. Verify URL is publicly accessible
3. Test with Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks
   ```

### Payment Not Processing
**Cause:** Test vs live mode mismatch

**Solution:**
- Verify all keys are from same mode (all test or all live)
- Check Price IDs match the mode
- Ensure webhook is configured for correct mode

---

## 📝 Development

### Local Development
```bash
npm install
npm run dev
```

### Build Production
```bash
npm run build
npm run start
```

### Database Migrations
```sql
-- Migrations are in /supabase/migrations/
-- Apply via Supabase Dashboard SQL Editor
```

---

## 📚 Documentation Files

- **`QUICK_PRODUCTION_SETUP.md`** - 20-minute setup guide
- **`PRODUCTION_LAUNCH_CHECKLIST.md`** - Comprehensive checklist
- **`PRODUCTION_DEPLOYMENT_GUIDE.md`** - Technical deep dive
- **`STRIPE_INTEGRATION.md`** - Stripe-specific docs (if exists)

---

## 🎯 Roadmap (Post-Launch)

### Phase 1 (Months 1-3)
- Email notifications (welcome, billing reminders)
- Invoice generation and history
- Team member invitations
- Custom reporting

### Phase 2 (Months 4-6)
- Mobile app (React Native)
- Advanced analytics (predictive insights)
- Integration with HVAC software (ServiceTitan, etc.)
- API for third-party developers

### Phase 3 (Months 7-12)
- White-label solutions
- Enterprise plan with custom pricing
- Multi-location support
- Advanced permissions and roles

---

## 💼 Business Considerations

### Customer Support
- Email: support@smarthvacanalytics.com
- Response time: 24 hours (48h for free trial)
- Priority support for Growth/Pro plans

### Refund Policy
- 7-day money-back guarantee
- Prorated refunds for annual plans
- No refunds for trial cancellations

### Churn Prevention
- Exit surveys on cancellation
- Win-back campaigns (30/60/90 days)
- Feature requests and feedback loops

---

## 📞 Support

### For Technical Issues
- Check troubleshooting section above
- Review `PRODUCTION_DEPLOYMENT_GUIDE.md`
- Contact Stripe/Supabase support

### For Business Questions
- Stripe Dashboard: https://dashboard.stripe.com
- Supabase Dashboard: https://app.supabase.com

---

## 🎉 Ready to Launch?

Your HVAC Analytics SaaS is production-ready!

**Next Steps:**
1. Follow `QUICK_PRODUCTION_SETUP.md`
2. Test with real payment
3. Go live and start selling!

**Questions?** Review the comprehensive guides included in this project.

---

**Built with ❤️ for HVAC businesses everywhere**
