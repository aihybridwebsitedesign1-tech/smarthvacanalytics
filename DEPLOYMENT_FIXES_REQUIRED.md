# Deployment Fixes Required

## Issue
The Vercel deployment is showing "Service authentication failed" because:
1. Code changes haven't been pushed to GitHub
2. Vercel environment variables may be incorrect

## Files That Need to Be Updated in GitHub

### 1. `.env`
Update with correct Supabase project (imxmvqxugbrhwxhfrmje):
```env
NEXT_PUBLIC_SUPABASE_URL=https://imxmvqxugbrhwxhfrmje.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlteG12cXh1Z2JyaHd4aGZybWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTc5NjcsImV4cCI6MjA3Njk5Mzk2N30.HNHN7jImshwOP2VLDd1CgAEUcqH14uDbRi54q-yfnxI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlteG12cXh1Z2JyaHd4aGZybWplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQxNzk2NywiZXhwIjoyMDc2OTkzOTY3fQ.HH3a7nSdEewodI_RJjTCdjUTM_GMMH0vWDu2Jkbnf4s
```

### 2. `lib/demo-data.ts`
The beginning of the file needs to include retry logic for profile creation.

See the updated file in your local project.

### 3. `app/dashboard/settings/page.tsx`
Lines 315-343 need updated trial status display logic.

See the updated file in your local project.

### 4. Database Migration (Already Applied ✓)
The migration `20251028020641_fix_profile_creation_with_trial.sql` has already been applied to your production database.

## Steps to Deploy

### Option 1: Using GitHub (Recommended)

1. **Commit the changes** in your local repository:
   ```bash
   git add .env lib/demo-data.ts app/dashboard/settings/page.tsx
   git commit -m "Fix: Update Supabase config and trial display"
   git push origin main
   ```

2. **Update Vercel Environment Variables**:
   - Go to: https://vercel.com/your-project/settings/environment-variables
   - Update all three Supabase variables to match the correct project (imxmvqxugbrhwxhfrmje)
   - Click "Save"

3. **Redeploy**:
   Vercel will automatically redeploy when you push to GitHub

### Option 2: Manual Deployment

If you can't push to GitHub right now:

1. **Update Vercel Environment Variables** (same as above)

2. **Download the files** from this project:
   - `lib/demo-data.ts`
   - `app/dashboard/settings/page.tsx`

3. **Update them in your GitHub repo** via web interface or locally

4. **Push to GitHub** to trigger redeployment

## Verifying the Fix

After deployment:
1. Create a new test account
2. Check that the settings page shows "14-day free trial active"
3. Verify demo data seeds without foreign key errors
4. Console should be clean (no 409 errors)

## Critical: Vercel Environment Variables

Make absolutely sure these are set in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://imxmvqxugbrhwxhfrmje.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlteG12cXh1Z2JyaHd4aGZybWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTc5NjcsImV4cCI6MjA3Njk5Mzk2N30.HNHN7jImshwOP2VLDd1CgAEUcqH14uDbRi54q-yfnxI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlteG12cXh1Z2JyaHd4aGZybWplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQxNzk2NywiZXhwIjoyMDc2OTkzOTY3fQ.HH3a7nSdEewodI_RJjTCdjUTM_GMMH0vWDu2Jkbnf4s
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=(your key)
STRIPE_SECRET_KEY=(your key)
STRIPE_WEBHOOK_SECRET=(your key)
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=(your key)
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=(your key)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=(your key)
NEXT_PUBLIC_APP_NAME=SmartHVACAnalytics
NEXT_PUBLIC_APP_URL=(your vercel URL)
```

**IMPORTANT**: After updating environment variables in Vercel, you MUST redeploy for them to take effect!
