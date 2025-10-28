# 🚀 QUICK START - Get Live in 20 Minutes!

**Everything you need to deploy your SaaS and start accepting payments.**

---

## 📂 Important Files You Need

1. **`PRODUCTION_DATABASE_SETUP.sql`** - Run this in Supabase SQL Editor (one time)
2. **`FAST_PRODUCTION_DEPLOY.md`** - Complete step-by-step deployment guide
3. **`DEPLOYMENT_CHECKLIST.md`** - Checklist to ensure nothing is missed

---

## ⚡ Ultra-Quick Summary

### 1️⃣ Supabase (5 min)
- Create project at https://supabase.com/dashboard
- Run `PRODUCTION_DATABASE_SETUP.sql` in SQL Editor
- Get: URL, anon key, service_role key

### 2️⃣ Stripe (5 min)
- Create 3 products at https://dashboard.stripe.com/test/products
  - Starter: $49/month
  - Growth: $99/month
  - Pro: $199/month
- Get: Publishable key, Secret key, 3 Price IDs

### 3️⃣ Vercel (5 min)
- Import GitHub repo at https://vercel.com/new
- Add 10 environment variables (see below)
- Deploy!

### 4️⃣ Stripe Webhook (5 min)
- Create webhook at https://dashboard.stripe.com/test/webhooks
- Point to: `https://your-app.vercel.app/api/webhooks`
- Get webhook secret, add to Vercel
- Redeploy

✅ **DONE!** Test with card `4242 4242 4242 4242`

---

## 📋 Environment Variables for Vercel

Copy these and fill in YOUR values:

```bash
# From Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# From Stripe Dashboard → Developers → API Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# From Stripe Dashboard → Products (Price IDs)
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...

# Your Vercel URL (update after first deploy)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_NAME=SmartHVACAnalytics
```

**Add AFTER webhook created:**
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🧪 Test Card Numbers

Use these in Stripe Checkout (TEST mode only):

| Card Number | Result |
|------------|--------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 0002` | ❌ Card declined |
| `4000 0000 0000 9995` | ❌ Insufficient funds |

Use any future expiry date, any 3-digit CVC, any ZIP code.

---

## 🔄 Switching to LIVE Mode (Real Money)

When ready for customers:

1. Toggle Stripe to **Live Mode**
2. Create 3 products in Live Mode
3. Create webhook in Live Mode
4. Replace ALL test keys with live keys in Vercel:
   - `pk_test_` → `pk_live_`
   - `sk_test_` → `sk_live_`
   - `price_test_` → `price_live_`
   - `whsec_test_` → `whsec_live_`
5. Redeploy in Vercel

---

## 🆘 Common Issues

**Build fails:**
- Run `npm run build` locally to see error
- Check all env vars are set in Vercel

**Can't sign up:**
- Verify Supabase Auth email is enabled
- Check browser console for errors

**Payment fails:**
- Use test card `4242 4242 4242 4242`
- Verify all 6 Stripe env vars are correct
- Check Stripe webhook is created

**Webhook not working:**
- Verify `STRIPE_WEBHOOK_SECRET` is set
- Check webhook URL matches your Vercel URL
- Look at webhook delivery logs in Stripe

---

## 📚 Full Documentation

- **Detailed Guide**: Read `FAST_PRODUCTION_DEPLOY.md`
- **Checklist**: Use `DEPLOYMENT_CHECKLIST.md`
- **Database**: Review `PRODUCTION_DATABASE_SETUP.sql`

---

## 🎯 Next Steps After Launch

1. **Custom Domain**: Add your own domain in Vercel
2. **Analytics**: Enable Vercel Analytics
3. **Monitoring**: Set up error alerts
4. **Marketing**: Start driving traffic!
5. **Support**: Set up customer support email

---

## 💰 Your SaaS Revenue

At full capacity with proper marketing:

| Customers | MRR |
|-----------|-----|
| 10 Starter | $490/month |
| 10 Growth | $990/month |
| 10 Pro | $1,990/month |
| **Total** | **$3,470/month** |

Scale from there! 🚀

---

**Good luck with your launch! You've got everything you need to succeed! 💪**

Questions? Review the detailed guides or test everything thoroughly before going live.
