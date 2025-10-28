# Bolt.new Deployment Fix - 404 ERROR SOLUTION

## 🚨 CURRENT ISSUE: Site Shows 404

Your Bolt.new domain `hvac-kpi-tracker-dup-lvkn.bolt.host` is published but showing 404 error.

## ✅ FIX APPLIED

Updated `next.config.js` to include:
```javascript
output: 'standalone'
```

This is REQUIRED for Bolt.new deployment.

---

## 🔥 ACTION REQUIRED: Trigger Rebuild

### DO THIS NOW:

1. In Bolt.new, click the **pencil/edit icon** next to your domain name
2. OR click the **"Update"** button in the publish modal
3. Wait 5-10 minutes for rebuild

**This will rebuild with the correct configuration and fix the 404.**

---

## Before Rebuilding: Verify Environment Variables

Make sure ALL these are set in Bolt.new project settings (NOT in code):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
NEXT_PUBLIC_APP_URL=https://hvac-kpi-tracker-dup-lvkn.bolt.host
```

Missing environment variables will cause runtime errors!

---

## 📋 Expected Timeline

```
Now         - next.config.js updated ✅ DONE
+2 min      - Click "Update" in Bolt.new
+3-5 min    - Dependencies installing
+5-8 min    - Next.js building
+8-10 min   - Deployment complete
+10 min     - Site live! 🎉
```

---

## 🧪 How to Test After Rebuild

Try these URLs once rebuild completes:

1. `https://hvac-kpi-tracker-dup-lvkn.bolt.host/`
2. `https://hvac-kpi-tracker-dup-lvkn.bolt.host/login`
3. `https://hvac-kpi-tracker-dup-lvkn.bolt.host/pricing`

All should load correctly (no 404).

---

## 🔍 Troubleshooting

### Still 404 After 15 Minutes?

**Check build logs in Bolt.new:**
- Look for "Logs" or "Deployments" tab
- Check for build errors
- Verify all env vars are set

**Common issues:**
1. **Missing env vars** - Site builds but crashes at runtime
2. **Build timeout** - Click Update again
3. **Cache issues** - Try incognito/private browser window

---

## 🚀 Alternative: Deploy to Vercel (If Bolt.new Fails)

If Bolt.new continues having deployment issues:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts
# Add environment variables in Vercel dashboard
```

Vercel is more reliable for Next.js apps and has better error messages.

---

# Custom Domain Setup (Do This AFTER Site Works)

Once your Bolt domain works, follow these steps to add a custom domain.

## Overview

Bolt.new allows you to connect a custom domain to your project so users can access it via your branded URL instead of the default Bolt.new subdomain.

---

## Step 1: Prepare Your Domain

### Option A: Purchase New Domain
If you don't have a domain yet:

**Recommended Registrars:**
- [Namecheap](https://namecheap.com) - $10-15/year
- [Google Domains](https://domains.google) - $12/year
- [Cloudflare Registrar](https://cloudflare.com) - At-cost pricing
- [Porkbun](https://porkbun.com) - $8-12/year

**Naming Tips:**
- Keep it short and memorable
- Use `.com`, `.app`, or `.io` for tech products
- Consider: `hvacanalytics.app`, `smarthvac.io`, `yourbrand.com`
- For SaaS, use subdomain: `app.yourdomain.com`

### Option B: Use Existing Domain
If you already own a domain, you can use a subdomain:
- `app.yourdomain.com` (recommended for SaaS)
- `dashboard.yourdomain.com`
- `analytics.yourdomain.com`

---

## Step 2: Configure Custom Domain on Bolt.new

### A. Access Domain Settings

1. Open your project in Bolt.new
2. Click on **Settings** or **Project Settings**
3. Navigate to **Custom Domain** or **Domains** section

### B. Add Your Domain

1. Enter your domain or subdomain:
   ```
   app.yourdomain.com
   ```
   (or just `yourdomain.com` for apex domain)

2. Click **Add Domain** or **Connect Domain**

3. Bolt.new will provide DNS configuration:
   - Usually a **CNAME record** for subdomains
   - Or **A records** for apex domains

### C. DNS Records Example

You'll see something like:

**For Subdomain (app.yourdomain.com):**
```
Type: CNAME
Name: app (or app.yourdomain.com)
Value: cname.bolt.new (or specific URL from Bolt.new)
TTL: 3600 (or Auto)
```

**For Apex Domain (yourdomain.com):**
```
Type: A
Name: @ (or leave blank)
Value: 123.456.789.10 (IP provided by Bolt.new)
TTL: 3600 (or Auto)
```

📋 **Copy these values** - you'll need them for the next step!

---

## Step 3: Update DNS at Your Registrar

### General Instructions (Works for Most Registrars)

1. **Log into your domain registrar**
   - Namecheap, Google Domains, Cloudflare, etc.

2. **Find DNS Management**
   - Usually called: DNS Settings, DNS Management, Nameservers, or Advanced DNS

3. **Add the DNS Record**
   - Click "Add Record" or "Add New Record"
   - Select type: **CNAME** (for subdomain) or **A** (for apex)
   - Enter the **Name** from Bolt.new
   - Enter the **Value** from Bolt.new
   - Set **TTL** to 3600 or Auto
   - Save changes

### Specific Registrar Guides

#### Namecheap
1. Go to Dashboard → Domain List
2. Click **Manage** next to your domain
3. Go to **Advanced DNS** tab
4. Click **Add New Record**
5. Add the CNAME/A record from Bolt.new
6. Click **Save All Changes**

#### Google Domains
1. Go to My Domains
2. Click **DNS** next to your domain
3. Scroll to **Custom records**
4. Click **Manage custom records**
5. Add the record from Bolt.new
6. Click **Save**

#### Cloudflare
1. Go to **DNS** tab
2. Click **Add record**
3. Enter record details from Bolt.new
4. **Important:** Set Proxy status to **DNS only** (gray cloud)
5. Click **Save**

#### GoDaddy
1. Go to My Products
2. Click **DNS** next to your domain
3. Click **Add** under Records
4. Select record type and enter details
5. Click **Save**

---

## Step 4: Wait for DNS Propagation

### Timing
- **Fastest:** 5-15 minutes
- **Average:** 30-60 minutes
- **Maximum:** Up to 48 hours (rare)

### Check Propagation Status

**Online Tools:**
- [whatsmydns.net](https://whatsmydns.net) - Check DNS globally
- [dnschecker.org](https://dnschecker.org) - Multi-location check

**Command Line:**
```bash
# Check CNAME
nslookup app.yourdomain.com

# Check A record
nslookup yourdomain.com
```

### While You Wait
- ☕ Grab coffee
- 📧 Configure your Stripe production keys
- 📝 Update your `.env` file
- 🧪 Prepare test accounts

---

## Step 5: Verify Domain Connection

### A. Check Bolt.new Dashboard

1. Return to your project settings
2. Check domain status
3. Should show: ✅ **Connected** or **Active**

### B. Test Your Domain

1. Visit your custom domain in browser:
   ```
   https://app.yourdomain.com
   ```

2. Verify:
   - ✅ Page loads correctly
   - ✅ HTTPS (lock icon) is present
   - ✅ No certificate warnings
   - ✅ All pages navigate properly

### C. Test Stripe Integration

1. Create test account
2. Complete checkout flow
3. Verify redirect works with custom domain
4. Check webhook is receiving events at custom domain

---

## Step 6: Update Environment Variables

Once domain is working, update your `.env`:

```bash
# Old
NEXT_PUBLIC_APP_URL=https://random-id.bolt.new

# New
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
```

**Also update Stripe webhook URL:**
1. Go to Stripe Dashboard → Webhooks
2. Edit your webhook endpoint
3. Change URL to: `https://app.yourdomain.com/api/webhooks`
4. Save changes

---

## Troubleshooting

### Domain Not Loading

**Issue:** DNS not propagated yet
**Solution:** Wait 15-30 more minutes, clear browser cache

**Issue:** Wrong DNS records
**Solution:**
- Verify CNAME/A record values match exactly
- Check for typos in subdomain name
- Ensure TTL is not too high

**Issue:** Cloudflare proxy interfering
**Solution:** Set to "DNS only" (gray cloud icon)

### SSL Certificate Errors

**Issue:** "Not Secure" or certificate warning
**Solution:**
- Wait for SSL provisioning (5-15 min after DNS)
- Ensure DNS is fully propagated first
- Hard refresh browser (Ctrl+Shift+R)

### Stripe Webhook Failing

**Issue:** Webhooks going to old URL
**Solution:**
- Update webhook URL in Stripe Dashboard
- Test with Stripe CLI:
  ```bash
  stripe trigger checkout.session.completed
  ```

### Redirect Issues

**Issue:** Checkout redirects to wrong domain
**Solution:**
- Update `NEXT_PUBLIC_APP_URL` in `.env`
- Rebuild and redeploy:
  ```bash
  npm run build
  ```

---

## Post-Setup Checklist

After custom domain is working:

- [ ] Domain loads with HTTPS
- [ ] No certificate warnings
- [ ] All pages navigate correctly
- [ ] Login/signup works
- [ ] Stripe checkout completes
- [ ] Webhook receives events
- [ ] Updated `.env` with new URL
- [ ] Updated Stripe webhook URL
- [ ] Tested end-to-end flow
- [ ] Announced new domain to users (if applicable)

---

## DNS Record Reference

### CNAME Record (Subdomain)
```
Type: CNAME
Host: app
Points to: [value from Bolt.new]
TTL: 3600
```

### A Record (Apex Domain)
```
Type: A
Host: @
Points to: [IP from Bolt.new]
TTL: 3600
```

### Multiple Records (www + apex)
```
# Apex domain
Type: A
Host: @
Points to: [IP from Bolt.new]

# www subdomain
Type: CNAME
Host: www
Points to: [domain from Bolt.new]
```

---

## Best Practices

1. **Use Subdomain for SaaS**
   - `app.yourdomain.com` is cleaner than apex
   - Easier to manage multiple environments
   - Example: `app`, `staging`, `dev`

2. **Enable HTTPS Only**
   - Bolt.new should handle this automatically
   - Verify SSL certificate is valid
   - Force HTTPS redirects

3. **Set Up www Redirect**
   - Forward `www.yourdomain.com` to `yourdomain.com`
   - Or vice versa for consistency

4. **Monitor DNS**
   - Set up alerts for DNS changes
   - Regular checks with monitoring tools
   - Keep registrar login secure

5. **Document Your Setup**
   - Note which records were added
   - Save Bolt.new configuration
   - Keep credentials secure

---

## Need Help?

### Bolt.new Support
- Check Bolt.new documentation
- Contact Bolt.new support
- Community forums/Discord

### DNS/Domain Issues
- Contact your registrar support
- Use DNS checker tools
- Review registrar documentation

### Application Issues
- Review `PRODUCTION_DEPLOYMENT_GUIDE.md`
- Check Stripe/Supabase dashboards
- Test with browser dev tools

---

## Next Steps

Once domain is connected:

1. ✅ Follow `QUICK_PRODUCTION_SETUP.md`
2. ✅ Configure production Stripe keys
3. ✅ Test complete payment flow
4. ✅ Announce your launch! 🚀

---

**Your custom domain is ready!** Users can now access your HVAC Analytics SaaS at your professional branded URL.
