# Deploy to Vercel - Easy Setup Guide

## Why Vercel?

- ✅ Built by the creators of Next.js
- ✅ Zero configuration needed
- ✅ Automatic HTTPS
- ✅ Free custom domains
- ✅ Better error messages
- ✅ Faster deployments
- ✅ More reliable than Bolt.new

---

## 🚀 Quick Deploy (5 Minutes)

### Option 1: Deploy from GitHub (Recommended)

**Step 1: Push to GitHub**

```bash
# If not already a git repo
git init
git add .
git commit -m "Initial commit"

# Create new repo on GitHub, then:
git remote add origin https://github.com/yourusername/hvac-kpi-tracker.git
git branch -M main
git push -u origin main
```

**Step 2: Deploy on Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** (use your GitHub account)
3. Click **"Add New Project"**
4. Select your GitHub repository
5. Click **"Import"**
6. Vercel auto-detects Next.js settings ✅
7. Click **"Deploy"**

**Step 3: Add Environment Variables**

While deployment is running:

1. Go to **Project Settings → Environment Variables**
2. Add all your variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_xxx
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

3. Click **"Redeploy"** after adding env vars

**Done! 🎉** Your site will be live at `https://your-project.vercel.app`

---

### Option 2: Deploy with Vercel CLI

**Step 1: Install Vercel CLI**

```bash
npm i -g vercel
```

**Step 2: Login**

```bash
vercel login
```

Enter your email and verify the link sent to your inbox.

**Step 3: Deploy**

```bash
# From your project directory
vercel
```

Follow the prompts:

```
? Set up and deploy "~/project"? [Y/n] Y
? Which scope do you want to deploy to? Your Name
? Link to existing project? [y/N] N
? What's your project's name? hvac-kpi-tracker
? In which directory is your code located? ./
```

Vercel auto-detects Next.js and builds automatically!

**Step 4: Add Environment Variables**

```bash
# Add each variable
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID
vercel env add NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID
vercel env add NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
vercel env add NEXT_PUBLIC_APP_URL

# Or add all at once via Vercel dashboard
```

**Step 5: Redeploy with Env Vars**

```bash
vercel --prod
```

**Done! 🎉** Your site is live!

---

## 🌐 Add Custom Domain (Optional)

### Step 1: Add Domain in Vercel

1. Go to **Project Settings → Domains**
2. Click **"Add Domain"**
3. Enter your domain: `app.yourdomain.com`
4. Vercel provides DNS instructions

### Step 2: Update DNS

Add these records at your registrar:

**For subdomain (app.yourdomain.com):**
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: 3600
```

**For apex domain (yourdomain.com):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

### Step 3: Wait for DNS Propagation

- Usually 5-15 minutes
- Max 1-2 hours
- Vercel automatically provisions SSL

### Step 4: Update Environment Variables

```bash
# Update this in Vercel dashboard
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com

# Also update Stripe webhook:
# https://app.yourdomain.com/api/webhooks
```

**Done! 🎉** Your custom domain is live with HTTPS!

---

## 📋 Post-Deployment Checklist

- [ ] Site loads at Vercel URL
- [ ] All pages navigate correctly
- [ ] Can create account
- [ ] Can login
- [ ] Dashboard loads
- [ ] Stripe checkout works
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] Stripe webhook URL updated
- [ ] End-to-end test complete

---

## 🔧 Troubleshooting

### Build Failing?

**Check build logs in Vercel dashboard:**
- Click on failed deployment
- View detailed error messages
- Much better than Bolt.new logs!

**Common fixes:**
```bash
# Run locally first
npm run build

# Fix any TypeScript errors
npm run typecheck

# Then redeploy
vercel --prod
```

### Site Crashes After Deploy?

**Missing environment variables:**
1. Go to Vercel dashboard
2. Settings → Environment Variables
3. Add missing variables
4. Redeploy

**Check function logs:**
- Vercel dashboard → Functions tab
- Real-time logs for debugging
- Much better than Bolt.new!

### Stripe Webhook Not Working?

**Update webhook URL:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Edit your webhook
3. Change URL to: `https://your-project.vercel.app/api/webhooks`
4. Save and test

**Test webhook locally:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks
```

---

## 🎯 Vercel vs Bolt.new

| Feature | Vercel | Bolt.new |
|---------|--------|----------|
| Next.js Support | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Build Speed | Fast (2-3 min) | Slow (5-10 min) |
| Error Messages | Excellent | Limited |
| Custom Domains | Easy + Free | Limited |
| Environment Variables | Easy UI | Varies |
| Function Logs | Real-time | Limited |
| Reliability | Excellent | Good |
| Free Tier | Generous | Limited |

**Verdict:** Vercel is better for production Next.js apps!

---

## 💰 Pricing

### Vercel Free Tier (Hobby)

**Includes:**
- ✅ Unlimited projects
- ✅ 100 GB bandwidth/month
- ✅ 100 deployments/day
- ✅ Custom domains (unlimited)
- ✅ Automatic HTTPS
- ✅ Edge functions
- ✅ Analytics (basic)

**Perfect for:**
- Personal projects
- Small businesses
- MVPs
- Side projects

### Vercel Pro ($20/month)

**Adds:**
- ✅ 1 TB bandwidth
- ✅ Priority support
- ✅ Advanced analytics
- ✅ Password protection
- ✅ Team collaboration

**For:** Growing SaaS, production apps

---

## 🚀 Continuous Deployment

Once connected to GitHub:

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Update feature"
   git push
   ```

2. **Vercel auto-deploys** (no manual action needed!)

3. **Live in 2-3 minutes** ✅

**Every push = automatic deployment!**

---

## 🌟 Advanced Features

### Preview Deployments

- Every branch gets its own URL
- Test features before merging
- Share with team/clients

### Environment Variables per Environment

```bash
# Production
vercel env add STRIPE_SECRET_KEY production

# Preview
vercel env add STRIPE_SECRET_KEY preview

# Development
vercel env add STRIPE_SECRET_KEY development
```

### Custom Build Command

In `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

---

## 📊 Monitoring

### Function Logs

1. Go to Vercel dashboard
2. Click **Functions** tab
3. See real-time logs for all API routes
4. Debug errors instantly

### Analytics

1. Go to **Analytics** tab
2. See visitor stats
3. Track performance
4. Monitor Web Vitals

---

## 🎉 Next Steps After Deployment

1. ✅ Test site thoroughly
2. ✅ Add custom domain
3. ✅ Configure production Stripe
4. ✅ Update webhook endpoints
5. ✅ Enable Vercel Analytics
6. ✅ Set up monitoring
7. ✅ GO LIVE! 🚀

---

## 📝 Quick Command Reference

```bash
# Deploy
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Add env variable
vercel env add VARIABLE_NAME

# Pull env variables locally
vercel env pull

# Link project
vercel link

# Remove project
vercel rm project-name
```

---

## ❓ Need Help?

### Vercel Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

### Still Issues?
- Check function logs in Vercel dashboard
- Review build logs for errors
- Test locally first: `npm run build && npm start`
- Use Vercel's built-in preview deployments

---

**Vercel deployment is much more reliable than Bolt.new for Next.js apps!** 🚀

**Your site will be live in under 5 minutes with better performance and reliability.**
