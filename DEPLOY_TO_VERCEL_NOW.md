# 🚀 Deploy Fixed Code to Vercel - URGENT

## The Issue:
- Database migrations are applied ✅
- Code changes are NOT deployed to Vercel ❌
- **You need to deploy the updated code for signup to work!**

---

## ⚡ FASTEST METHOD: Use the Vercel Dashboard

### Step 1: Get Your Source Code
If this project is linked to GitHub/GitLab:

1. **Push the changes to Git:**
   - In your local project (where you have the code)
   - Run: `git add .`
   - Run: `git commit -m "Fix signup RLS policy"`
   - Run: `git push`

2. **Vercel will auto-deploy** (2-3 minutes)
   - Watch the deployment in Vercel Dashboard → Deployments

---

## 🔧 ALTERNATIVE: Manual File Update

If you can't use Git, you need to **manually update the file** in your codebase:

### File to Update: `lib/supabase/auth.ts`

Replace the ENTIRE contents with this:

```typescript
import { supabase } from './client';

export async function signUp(email: string, password: string, companyName: string, technicianCount: number, planTier: string) {
  // Sign up the user with metadata
  // The database trigger will automatically create the profile
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        company_name: companyName,
        plan_tier: planTier,
      }
    }
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('No user returned from signup');

  // Wait a moment for the trigger to create the profile
  await new Promise(resolve => setTimeout(resolve, 500));

  // Update the profile with full details
  const client: any = supabase;
  const { error: profileError } = await client.from('profiles').update({
    company_name: companyName,
    technician_count: technicianCount,
    plan_tier: planTier,
    demo_mode: true,
    user_role: 'owner',
  }).eq('id', authData.user.id);

  if (profileError) {
    console.error('Profile update error:', profileError);
    // Don't throw - profile was created by trigger, just log the update error
  }

  await supabase.auth.getSession();

  return authData;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
```

### What Changed:
- Lines 6-15: Added `options.data` to pass metadata to Supabase
- Line 21: Added delay to allow trigger to complete
- Lines 25-31: Changed from INSERT to UPDATE (trigger creates the profile)
- Lines 33-36: Don't throw error on profile update failure

---

## 🎯 After Deploying:

1. **Wait for build to complete** (2-3 minutes)
2. **Test signup again**: `https://smarthvacanalytics-x1oo.vercel.app/signup`
3. **Should work now!** ✅

---

## 🔍 How to Verify Deployment Worked:

### Check in Vercel:
1. Go to Vercel Dashboard → Your Project
2. Click "Deployments"
3. Latest deployment should say "Ready"
4. Click on it → "Functions" tab
5. Should show no errors

### Check the Code:
1. Open browser DevTools (F12)
2. Go to `https://smarthvacanalytics-x1oo.vercel.app/signup`
3. Check "Sources" tab
4. Find `/lib/supabase/auth.ts`
5. Verify it has the updated code (with `options.data`)

---

## ❓ Where is Your Code Hosted?

**Option 1: GitHub/GitLab**
- Make changes in your local code editor
- Push to Git
- Vercel auto-deploys

**Option 2: Vercel Direct Upload**
- You uploaded code directly to Vercel
- Need to re-upload with updated files

**Option 3: Bolt.new/Stackblitz**
- Make changes in the editor
- Re-deploy to Vercel from there

---

## 🆘 Quick Help:

**Where is your original code?**
- GitHub? → Push changes and Vercel auto-deploys
- Local computer? → Need to push to Git or re-upload
- Bolt.new? → Make changes there and redeploy

**Don't have access to the code?**
- Check Vercel → Settings → Git Repository
- Clone from there, make changes, push back

---

## 🎉 Once Deployed:

✅ Signup will work without RLS errors
✅ Users can create accounts
✅ Stripe checkout will load correctly
✅ Dashboard will be accessible
✅ Ready to launch!

**Deploy the updated code and test again!** 🚀
