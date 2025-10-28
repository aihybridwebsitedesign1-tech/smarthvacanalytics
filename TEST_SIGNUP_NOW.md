# 🧪 Test Signup Now - Quick Guide

## ✅ The Fix Has Been Applied

The database trigger has been created and the signup code has been updated. Now you need to test!

---

## 🚀 If Code Changes Are Already on Vercel

If your code is already deployed (or auto-deploys via Git), **test immediately**:

### Test Steps:

1. **Open Your App**
   - Go to: `https://smarthvacanalytics-x1oo.vercel.app/signup`
   - Or your custom domain if you added it

2. **Sign Up with New Account**
   - Select any plan (Growth recommended for testing)
   - Company Name: `Test Company`
   - Technicians: `5`
   - Email: Use a real email you can access
   - Password: Create a strong password (min 6 characters)
   - Click **"Create Account"**

3. **Expected Result**
   - ✅ No "row-level security" error!
   - ✅ Redirected to Stripe checkout
   - ✅ Can complete payment

4. **Verify in Supabase**
   - Go to Supabase → Table Editor → `profiles`
   - You should see your new user's profile
   - All fields should be populated correctly

---

## 📦 If You Need to Deploy Code Changes

If this codebase is not yet on Vercel, you need to push the changes:

### Option 1: If Using Git (Recommended)

```bash
git add .
git commit -m "Fix signup RLS policy with database trigger"
git push
```

Vercel will auto-deploy in 2-3 minutes.

### Option 2: Manual Deployment

1. Go to Vercel Dashboard
2. Click your project
3. Click "Deployments" tab
4. Click "..." menu on latest deployment
5. Click "Redeploy"

---

## 🔍 If Signup Still Fails

### Check These:

1. **Database Trigger Exists**
   - Go to Supabase Dashboard
   - SQL Editor → New Query
   - Run: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
   - Should return 1 row

2. **RLS Policy Exists**
   - SQL Editor → New Query
   - Run: `SELECT * FROM pg_policies WHERE tablename = 'profiles';`
   - Should show policies for SELECT, UPDATE, and INSERT

3. **Check Logs**
   - Vercel: Deployments → Click deployment → "Functions" tab
   - Supabase: Logs → Look for errors

4. **Test Environment Variables**
   - Vercel → Settings → Environment Variables
   - Verify all Supabase variables are correct:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

---

## 🎯 Success Indicators

You'll know it's working when:

✅ Signup form submits without errors
✅ Browser redirects to Stripe checkout page
✅ Profile appears in Supabase `profiles` table
✅ User can log in after completing payment
✅ Dashboard loads with user's data

---

## 🔴 If You See Errors

### "new row violates row-level security policy"
- Database trigger didn't run
- Solution: Verify trigger exists (see above)

### "No user returned from signup"
- Supabase auth issue
- Solution: Check email confirmation settings in Supabase → Auth → Settings
- Should be: "Enable email confirmations" = OFF (for testing)

### "Failed to create checkout session"
- Stripe configuration issue
- Solution: Verify Stripe keys in Vercel environment variables

### "Profile update error" (in console)
- This is OK! The trigger created the profile, update just failed
- Signup should still succeed
- Profile should still exist in database

---

## 🚀 Production Checklist

Once signup works on your test account:

- [ ] Test with real Stripe payment (you can refund it)
- [ ] Verify user can log in
- [ ] Verify dashboard shows correct plan tier
- [ ] Test creating technicians and jobs
- [ ] Add custom domain (if not done yet)
- [ ] Update Stripe webhook URL to custom domain
- [ ] Test payment flow on custom domain
- [ ] Share with real users!

---

## 📞 Need Help?

If signup still fails after following this guide:

1. Check browser console (F12) for JavaScript errors
2. Check Vercel function logs for server errors
3. Check Supabase logs for database errors
4. Share the specific error message

**The fix is in place - your signup should work now!** 🎉
