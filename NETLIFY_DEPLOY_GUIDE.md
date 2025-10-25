# Deploy to Netlify - Quick Setup Guide

## Why Netlify?

- ✅ Simple drag-and-drop deployment
- ✅ Free tier with generous limits
- ✅ Good Next.js support
- ✅ Easy custom domains
- ✅ Built-in forms and functions
- ✅ Great for static sites and SSR

**Note:** Vercel is better optimized for Next.js, but Netlify works great too!

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

**Step 2: Deploy on Netlify**

1. Go to [netlify.com](https://netlify.com)
2. Click **"Sign Up"** (use your GitHub account)
3. Click **"Add new site → Import an existing project"**
4. Choose **GitHub**
5. Select your repository
6. Configure build settings:

```
Build command: npm run build
Publish directory: .next
```

7. Click **"Deploy site"**

**Step 3: Add Environment Variables**

1. Go to **Site settings → Environment variables**
2. Click **"Add a variable"**
3. Add all variables:

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
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
```

4. Go to **Deploys → Trigger deploy → Deploy site**

**Done! 🎉** Your site will be live at `https://your-site.netlify.app`

---

### Option 2: Deploy with Netlify CLI

**Step 1: Install Netlify CLI**

```bash
npm install -g netlify-cli
```

**Step 2: Login**

```bash
netlify login
```

A browser window opens - authorize Netlify CLI.

**Step 3: Initialize Project**

```bash
netlify init
```

Follow the prompts:

```
? What would you like to do? Create & configure a new site
? Team: Your team name
? Site name (optional): hvac-kpi-tracker
? Build command: npm run build
? Directory to deploy: .next
? Netlify functions folder: netlify/functions
```

**Step 4: Deploy**

```bash
# Build first
npm run build

# Deploy to production
netlify deploy --prod
```

**Step 5: Add Environment Variables**

```bash
# Via CLI
netlify env:set NEXT_PUBLIC_SUPABASE_URL "your_value"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your_value"
# ... repeat for all variables

# Or via dashboard (easier)
# Go to Site settings → Environment variables
```

**Step 6: Redeploy**

```bash
netlify deploy --prod --build
```

**Done! 🎉** Your site is live!

---

### Option 3: Drag & Drop Deploy (Fastest)

**Step 1: Build Locally**

```bash
npm run build
```

**Step 2: Drag & Drop**

1. Go to [netlify.com/drop](https://app.netlify.com/drop)
2. Drag your `.next` folder to the page
3. Wait for upload (30 seconds)

**Done! 🎉** Instant live site!

**Limitation:** No environment variables, manual process, not recommended for production.

---

## 🌐 Add Custom Domain

### Step 1: Add Domain in Netlify

1. Go to **Domain settings**
2. Click **"Add custom domain"**
3. Enter your domain: `app.yourdomain.com`
4. Click **"Verify"**

### Step 2: Update DNS

Netlify provides DNS instructions:

**For subdomain (app.yourdomain.com):**
```
Type: CNAME
Name: app
Value: your-site.netlify.app
TTL: 3600
```

**For apex domain (yourdomain.com):**
```
Type: A
Name: @
Value: 75.2.60.5
TTL: 3600
```

### Step 3: Enable HTTPS

1. Netlify detects DNS propagation
2. Click **"Verify DNS configuration"**
3. Click **"Provision certificate"**
4. HTTPS enabled automatically! ✅

### Step 4: Update Environment Variables

```bash
# Update in Netlify dashboard
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com

# Also update Stripe webhook:
# https://app.yourdomain.com/api/webhooks
```

**Done! 🎉** Custom domain with HTTPS!

---

## ⚙️ Netlify Configuration File

Create `netlify.toml` in your project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

Commit and push:

```bash
git add netlify.toml
git commit -m "Add Netlify config"
git push
```

Netlify auto-deploys!

---

## 📋 Post-Deployment Checklist

- [ ] Site loads at Netlify URL
- [ ] All pages navigate correctly
- [ ] Can create account
- [ ] Can login
- [ ] Dashboard loads
- [ ] Stripe checkout works
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled
- [ ] Stripe webhook URL updated
- [ ] End-to-end test complete

---

## 🔧 Troubleshooting

### Build Failing?

**Check deploy logs:**
1. Go to Netlify dashboard
2. Click **Deploys**
3. Click on failed deploy
4. View detailed logs

**Common fixes:**
```bash
# Test build locally first
npm run build

# Check for errors
npm run typecheck

# Then redeploy
netlify deploy --prod --build
```

### Site Shows 404 or Blank Page?

**Check publish directory:**
- Should be `.next` for Next.js
- Go to Site settings → Build & deploy
- Verify "Publish directory" is `.next`

**Redeploy:**
```bash
netlify deploy --prod --build
```

### Environment Variables Not Working?

**Verify variables:**
1. Site settings → Environment variables
2. Check all variables are present
3. Must start with `NEXT_PUBLIC_` for client-side
4. Redeploy after adding variables

### Stripe Webhook Failing?

**Update webhook URL:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Edit webhook endpoint
3. Change to: `https://your-site.netlify.app/api/webhooks`
4. Test webhook

---

## 🎯 Netlify vs Vercel vs Bolt.new

| Feature | Netlify | Vercel | Bolt.new |
|---------|---------|--------|----------|
| Next.js Support | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Build Speed | Medium | Fast | Slow |
| Error Messages | Good | Excellent | Limited |
| Custom Domains | Easy + Free | Easy + Free | Limited |
| Forms/Functions | Built-in | Separate | N/A |
| Drag & Drop | ✅ Yes | ❌ No | ❌ No |
| Free Tier | Very Generous | Generous | Limited |

**Recommendation:**
- **Vercel** for Next.js apps (best performance)
- **Netlify** for simpler deployments and forms
- **Bolt.new** for quick prototypes only

---

## 💰 Pricing

### Netlify Free Tier

**Includes:**
- ✅ 100 GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Unlimited sites
- ✅ Custom domains (unlimited)
- ✅ Automatic HTTPS
- ✅ Forms (100 submissions/month)
- ✅ Functions (125k requests/month)

**Perfect for:** Most small to medium projects!

### Netlify Pro ($19/month)

**Adds:**
- ✅ 400 GB bandwidth
- ✅ 1000 build minutes
- ✅ Priority support
- ✅ Analytics
- ✅ Background functions

---

## 🚀 Continuous Deployment

Once connected to GitHub:

1. **Push code:**
   ```bash
   git add .
   git commit -m "Update feature"
   git push
   ```

2. **Netlify auto-builds and deploys!**

3. **Live in 3-5 minutes** ✅

---

## 🌟 Advanced Features

### Deploy Previews

- Every pull request gets preview URL
- Test before merging to main
- Share with team/stakeholders

### Split Testing

```toml
# netlify.toml
[[redirects]]
  from = "/*"
  to = "/version-a/:splat"
  status = 200
  conditions = {Cookie = ["netlify-variant=a"]}
  force = true

[[redirects]]
  from = "/*"
  to = "/version-b/:splat"
  status = 200
  conditions = {Cookie = ["netlify-variant=b"]}
  force = true
```

### Forms (No Backend Needed!)

```html
<form name="contact" method="POST" data-netlify="true">
  <input type="text" name="name" />
  <input type="email" name="email" />
  <textarea name="message"></textarea>
  <button type="submit">Send</button>
</form>
```

Netlify handles form submissions automatically!

---

## 📊 Monitoring

### Deploy Notifications

Set up notifications for:
- Deploy started
- Deploy succeeded
- Deploy failed
- Build warnings

Connect to:
- Email
- Slack
- Discord
- Webhook

### Function Logs

1. Go to Functions tab
2. Click on function
3. View invocations and logs
4. Debug errors in real-time

---

## 📝 Quick Command Reference

```bash
# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod

# Deploy with build
netlify deploy --prod --build

# View logs
netlify logs

# List sites
netlify sites:list

# Set env variable
netlify env:set KEY value

# Import env variables from file
netlify env:import .env

# Open site
netlify open

# Open admin dashboard
netlify open:admin

# Link to existing site
netlify link
```

---

## ❓ Need Help?

### Netlify Resources
- [Netlify Documentation](https://docs.netlify.com)
- [Next.js on Netlify](https://docs.netlify.com/frameworks/next-js/)
- [Netlify Community](https://community.netlify.com)

### Common Issues
- **Build fails:** Check Node version in build settings
- **404 errors:** Verify publish directory is `.next`
- **Env vars not working:** Must redeploy after adding
- **Functions failing:** Check function logs in dashboard

---

## 🎉 Next Steps After Deployment

1. ✅ Test site thoroughly
2. ✅ Add custom domain
3. ✅ Enable HTTPS
4. ✅ Configure production Stripe
5. ✅ Update webhook endpoints
6. ✅ Set up deploy notifications
7. ✅ GO LIVE! 🚀

---

**Netlify is a great alternative to Bolt.new with better reliability and features!** 🚀

**Choose Vercel for best Next.js performance, or Netlify for simplicity and forms.**
