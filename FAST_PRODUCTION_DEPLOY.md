# 🚀 FAST Production Deployment Guide

**Get your SaaS live and accepting payments in 20 minutes!**

---

## ⚡ STEP 1: Create Supabase Database (5 minutes)

### 1.1 Create New Project
1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name**: Smart HVAC Analytics (or anything you like)
   - **Database Password**: Save this somewhere safe!
   - **Region**: Choose closest to your customers
4. Click **"Create new project"**
5. ☕ Wait 2-3 minutes while it sets up

### 1.2 Run Database Setup
1. In your Supabase project, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `PRODUCTION_DATABASE_SETUP.sql` from your project
4. **Copy the ENTIRE file** and paste it into the SQL editor
5. Click **"RUN"** (bottom right)
6. ✅ You should see "Success. No rows returned" - that's perfect!

### 1.3 Get Your Credentials
1. Go to **Settings** (gear icon) → **API**
2. Copy these 3 values (you'll need them in Step 3):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)
   - **service_role key** (click "Reveal" button, another long string)

---

## 💳 STEP 2: Configure Stripe (5 minutes)

### 2.1 Create Stripe Products
1. Go to https://dashboard.stripe.com/test/products
2. Click **"Add product"** - create 3 products:

**Product 1: Starter Plan**
- Name: `Starter Plan`
- Price: `$49.00`
- Billing: `Recurring` → `Monthly`
- Click "Save product"
- **Copy the Price ID** (starts with `price_...`)

**Product 2: Growth Plan**
- Name: `Growth Plan`
- Price: `$99.00`
- Billing: `Recurring` → `Monthly`
- Click "Save product"
- **Copy the Price ID** (starts with `price_...`)

**Product 3: Pro Plan**
- Name: `Pro Plan`
- Price: `$199.00`
- Billing: `Recurring` → `Monthly`
- Click "Save product"
- **Copy the Price ID** (starts with `price_...`)

### 2.2 Get Your Stripe Keys
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy these 2 keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...` - click "Reveal")

**⚠️ NOTE:** You're using TEST mode keys. Switch to LIVE mode when ready to accept real payments!

---

## 🚀 STEP 3: Deploy to Vercel (10 minutes)

### 3.1 Push to GitHub
1. Make sure your code is pushed to GitHub
2. If not:
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

### 3.2 Import to Vercel
1. Go to https://vercel.com/new
2. Select your GitHub repository
3. Click **"Import"**

### 3.3 Add Environment Variables
In the "Configure Project" section, add these environment variables:

```bash
# Supabase (from Step 1.3)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe (from Step 2.1 and 2.2)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...

# App Config
NEXT_PUBLIC_APP_NAME=SmartHVACAnalytics
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Note:** For `NEXT_PUBLIC_APP_URL`, you can use your Vercel URL for now (you'll get it after deployment). We'll update it in Step 4.

### 3.4 Deploy!
1. Leave all other settings as default
2. Click **"Deploy"**
3. ☕ Wait 2-3 minutes for the build
4. ✅ Your app is LIVE!

### 3.5 Update App URL
1. Copy your Vercel deployment URL (looks like `https://your-app.vercel.app`)
2. In Vercel dashboard, go to **Settings** → **Environment Variables**
3. Find `NEXT_PUBLIC_APP_URL` and click **"Edit"**
4. Replace with your actual URL: `https://your-app.vercel.app`
5. Click **"Save"**
6. Go to **Deployments** tab → Click "..." on latest deployment → **"Redeploy"**

---

## 🔗 STEP 4: Configure Stripe Webhook

**IMPORTANT:** This enables Stripe to notify your app when payments succeed!

### 4.1 Create Webhook
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. Fill in:
   - **Endpoint URL**: `https://your-app.vercel.app/api/webhooks`
   - **Description**: Production webhook
4. Click **"Select events"**
5. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
6. Click **"Add events"**
7. Click **"Add endpoint"**

### 4.2 Get Webhook Secret
1. Click on your newly created webhook
2. Click **"Reveal"** under "Signing secret"
3. Copy the webhook secret (starts with `whsec_...`)

### 4.3 Add to Vercel
1. Go to your Vercel dashboard
2. Go to **Settings** → **Environment Variables**
3. Click **"Add New"**
4. Add:
   - **Name**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: `whsec_...` (your webhook secret)
5. Click **"Save"**
6. Go to **Deployments** → Redeploy latest

---

## ✅ STEP 5: Test Everything!

### 5.1 Test Signup
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Click **"Get Started"** or **"Sign Up"**
3. Create a test account
4. You should be able to log in!

### 5.2 Test Payment Flow
1. Go to the pricing page
2. Select a plan
3. Click "Subscribe"
4. Use Stripe test card: `4242 4242 4242 4242`
   - **Expiry**: Any future date
   - **CVC**: Any 3 digits
   - **ZIP**: Any 5 digits
5. Complete checkout
6. You should be redirected to the dashboard with the plan activated!

### 5.3 Verify in Stripe
1. Go to https://dashboard.stripe.com/test/payments
2. You should see your test payment!

---

## 🎉 YOU'RE LIVE!

Your SaaS is now:
- ✅ Live on the internet
- ✅ Accepting payments (test mode)
- ✅ Securely storing data
- ✅ Ready for customers!

---

## 🔥 NEXT STEPS

### Switch to Production (Real Payments)

When ready to accept real money:

1. **Activate your Stripe account**
   - Complete business verification at https://dashboard.stripe.com

2. **Switch to Live Mode in Stripe**
   - Toggle "Test mode" OFF in Stripe dashboard
   - Get your LIVE keys from https://dashboard.stripe.com/apikeys
   - Create the same 3 products in LIVE mode
   - Create a webhook in LIVE mode pointing to your URL

3. **Update Vercel Environment Variables**
   - Replace all `pk_test_` → `pk_live_`
   - Replace all `sk_test_` → `sk_live_`
   - Replace all `price_test_` → `price_live_` (your live price IDs)
   - Replace `whsec_test_` → `whsec_live_` (your live webhook secret)
   - Redeploy

### Add Custom Domain (Optional)

1. Buy a domain (Namecheap, GoDaddy, etc.)
2. In Vercel: **Settings** → **Domains** → Add your domain
3. Follow Vercel's instructions to update DNS
4. Update `NEXT_PUBLIC_APP_URL` in environment variables
5. Update Stripe webhook URL to use your custom domain

---

## 🆘 TROUBLESHOOTING

### Database Not Working
- Double-check you copied ALL 3 Supabase credentials correctly
- Make sure you ran the ENTIRE `PRODUCTION_DATABASE_SETUP.sql` file
- Check Vercel logs: **Deployments** → Click deployment → **"Functions"** tab

### Payments Not Working
- Verify you're using the correct Stripe keys (test vs live)
- Check all 6 Stripe environment variables are set in Vercel
- Make sure webhook is configured and secret is added to Vercel
- Test with card `4242 4242 4242 4242`

### Build Failing
- Check Vercel deployment logs
- Run `npm run build` locally to see errors
- Make sure all environment variables are set

### Users Can't Sign Up
- Check Supabase Auth settings: **Authentication** → **Providers** → **Email** should be enabled
- Check Vercel logs for error messages

---

## 💰 START MAKING MONEY!

Your SaaS is live. Now go get customers! 🚀

Questions? Check the docs or test everything thoroughly before going live.

**Remember:** You're in TEST mode. Switch to LIVE mode when ready for real payments!
