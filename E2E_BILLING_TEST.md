# End-to-End Post-Trial Billing Verification Guide

## 🎯 Test Objective

Verify the complete post-trial billing flow works correctly in SmartHVACAnalytics from trial creation → grace period → payment setup → active subscription.

---

## 📋 Test Account Information

**Email**: `testv8@gmail.com`
**Password**: `TestPass123!`
**Company Name**: `testv8`
**Plan Tier**: Starter

---

## 🚀 Step-by-Step Testing Procedure

### Step 1: Create Test Account

**Method A: Using Signup UI (Recommended)**

1. Navigate to: `http://localhost:3000/signup`
2. Fill in the form:
   - Email: `testv8@gmail.com`
   - Password: `TestPass123!`
   - Company Name: `testv8`
   - Select: **Starter Plan** (3 technicians)
3. Click "Create Account"
4. You should be redirected to the dashboard
5. **Verify Initial State**:
   - [ ] Dashboard loads successfully
   - [ ] No orange billing alert (trial is active)
   - [ ] Can see demo data or empty state

**Method B: Using Supabase Auth (Alternative)**

If you have access to Supabase dashboard:
1. Go to Authentication > Users
2. Click "Add User"
3. Email: `testv8@gmail.com`
4. Password: `TestPass123!`
5. Auto-confirm user
6. Then update the profile using SQL below

---

### Step 2: Verify Initial "Trialing" State

**SQL Query to Check:**
```sql
SELECT
  id,
  email,
  company_name,
  plan_tier,
  billing_status,
  stripe_customer_id,
  subscription_id,
  created_at
FROM profiles
WHERE email = 'testv8@gmail.com';
```

**Expected Results:**
```
billing_status: 'trialing'
stripe_customer_id: NULL
subscription_id: NULL
created_at: [current timestamp]
```

**UI Verification:**
- [ ] Login at `/login` with credentials above
- [ ] Dashboard shows no billing alerts
- [ ] Settings page shows trial status
- [ ] No "Complete Billing Setup" button visible

---

### Step 3: Simulate Trial End (Enter Grace Period)

**Run this SQL to backdate account and end trial:**

```sql
-- Backdate the account to 16 days ago (trial ended 2 days ago)
UPDATE profiles
SET
  created_at = NOW() - INTERVAL '16 days',
  billing_status = 'active'
WHERE email = 'testv8@gmail.com'
RETURNING
  email,
  created_at,
  billing_status,
  stripe_customer_id;
```

**Expected SQL Results:**
```
email: testv8@gmail.com
created_at: [16 days ago]
billing_status: active
stripe_customer_id: NULL  ← This triggers grace period!
```

**Grace Period Calculation:**
- Created: 16 days ago
- Trial End: Day 14 (2 days ago)
- Grace Period: 5 days (3 days remaining)
- Account will deactivate on Day 19 if no payment

---

### Step 4: Verify Grace Period UI

**🔴 CRITICAL UI CHECKS - Dashboard Page**

1. **Logout and Login Again** (to refresh state)
   - URL: `http://localhost:3000/login`
   - Email: `testv8@gmail.com`
   - Password: `TestPass123!`

2. **Dashboard (`/dashboard`) Should Show:**

   ✅ **Orange Alert Banner** at the top:
   ```
   ┌─────────────────────────────────────────────────────────┐
   │ ⚠️ Your trial has ended. Please add a payment method  │
   │    to continue service. Your account will be          │
   │    deactivated in 3 days if no payment information    │
   │    is added.                                           │
   │                                                         │
   │    3 days remaining     [Complete Billing Setup] →    │
   └─────────────────────────────────────────────────────────┘
   ```

   **Checklist:**
   - [ ] Orange alert banner is visible
   - [ ] Warning icon (⚠️) is present
   - [ ] Message says "Your trial has ended"
   - [ ] Shows "3 days remaining" (or 2-3 depending on exact timing)
   - [ ] "Complete Billing Setup" button is visible
   - [ ] Button is NOT disabled
   - [ ] Alert appears ABOVE the regular dashboard content
   - [ ] Demo mode alert (if present) appears BELOW billing alert

---

**🔴 CRITICAL UI CHECKS - Settings Page**

3. **Navigate to Settings (`/dashboard/settings`)**

   ✅ **Same Orange Alert Banner** at the top

   ✅ **Subscription Section Should Show:**
   ```
   ┌─────────────────────────────────┐
   │ Subscription & Billing           │
   ├─────────────────────────────────┤
   │ Starter Plan                    │
   │ Status: [Active]                │
   │                                  │
   │ ⚠️ Payment method required -    │
   │    3 days remaining             │
   │                                  │
   │ [Complete Billing Setup]        │
   │ [Upgrade Plan]                  │
   └─────────────────────────────────┘
   ```

   **Checklist:**
   - [ ] Orange alert banner at page top
   - [ ] Subscription section shows orange warning text
   - [ ] Warning text: "⚠️ Payment method required - X days remaining"
   - [ ] "Complete Billing Setup" button visible (orange/primary)
   - [ ] "Upgrade Plan" button visible
   - [ ] NO "Manage Billing" button (it's replaced with setup button)
   - [ ] NO renewal date shown (no active subscription yet)

---

### Step 5: Test "Complete Billing Setup" Button

**Option A: Test Real Stripe Checkout (Recommended)**

1. **Click "Complete Billing Setup"** on either Dashboard or Settings
2. **Observe Behavior:**
   - [ ] Button shows loading spinner
   - [ ] Redirects to Stripe Checkout page
   - [ ] Checkout page loads successfully
   - [ ] Shows "Starter Plan" - $49/month
   - [ ] Shows 14-day free trial included

3. **Complete Stripe Checkout:**
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
   - Click "Subscribe"

4. **After Successful Payment:**
   - [ ] Redirects back to dashboard
   - [ ] Webhook should fire: `checkout.session.completed`
   - [ ] Database should auto-update (check Step 6)

**Option B: Simulate Payment (For Testing Without Stripe)**

If you can't complete real Stripe checkout, simulate it with SQL:

```sql
UPDATE profiles
SET
  billing_status = 'active',
  stripe_customer_id = 'cus_test_simulation_v8',
  subscription_id = 'sub_test_simulation_v8',
  subscription_start = NOW(),
  subscription_end = NOW() + INTERVAL '30 days'
WHERE email = 'testv8@gmail.com'
RETURNING
  billing_status,
  stripe_customer_id,
  subscription_id,
  subscription_start,
  subscription_end;
```

---

### Step 6: Verify Active Subscription State

**After Payment Setup (Real or Simulated)**

**SQL Verification:**
```sql
SELECT
  email,
  billing_status,
  stripe_customer_id,
  subscription_id,
  subscription_start,
  subscription_end,
  (subscription_end - NOW()) as days_until_renewal
FROM profiles
WHERE email = 'testv8@gmail.com';
```

**Expected SQL Results:**
```
billing_status: 'active'
stripe_customer_id: 'cus_...' (populated)
subscription_id: 'sub_...' (populated)
subscription_start: [current date]
subscription_end: [30 days from now]
days_until_renewal: ~30 days
```

**🟢 CRITICAL UI CHECKS - Dashboard (After Payment)**

1. **Refresh Dashboard** or logout/login

   ✅ **Alert Banner Should Be GONE:**
   - [ ] NO orange alert banner visible
   - [ ] Dashboard shows normal content
   - [ ] No billing warnings anywhere

**🟢 CRITICAL UI CHECKS - Settings (After Payment)**

2. **Navigate to Settings (`/dashboard/settings`)**

   ✅ **Subscription Section Should Now Show:**
   ```
   ┌─────────────────────────────────┐
   │ Subscription & Billing           │
   ├─────────────────────────────────┤
   │ Starter Plan                    │
   │ Status: [Active] ✅             │
   │                                  │
   │ Renewal Date: [Date 30d away]   │
   │                                  │
   │ [Manage Billing]                │
   │ [Upgrade Plan]                  │
   └─────────────────────────────────┘
   ```

   **Checklist:**
   - [ ] NO orange alert at top
   - [ ] NO orange warning in subscription section
   - [ ] Status badge shows "Active" (green or default)
   - [ ] **Renewal Date** is displayed
   - [ ] "Manage Billing" button is NOW visible
   - [ ] "Complete Billing Setup" button is GONE
   - [ ] "Upgrade Plan" button still visible

---

### Step 7: Test "Manage Billing" Button

1. **Click "Manage Billing"**
2. **Expected Behavior:**
   - [ ] Button shows loading spinner
   - [ ] Redirects to Stripe Customer Portal
   - [ ] Portal shows subscription details
   - [ ] Can update payment method
   - [ ] Can view invoices
   - [ ] Can cancel subscription

**Note:** If using simulated payment, this will fail because Stripe has no record. That's expected for simulation mode.

---

### Step 8: Test Navigation

**Pricing Page Navigation:**

1. **From Settings, click "Upgrade Plan"**
2. **Should redirect to `/pricing`**
3. **Verify:**
   - [ ] "← Back to Settings" link visible at top
   - [ ] Link is only visible when logged in
   - [ ] Clicking link returns to `/dashboard/settings`
   - [ ] Current plan (Starter) is highlighted
   - [ ] Can see Growth and Pro options

---

## 📊 QA Verification Summary Table

| State | Expected Behavior | Result | Notes |
|-------|------------------|--------|-------|
| **1. Trialing (Day 1-14)** | No alert, normal dashboard | ☐ PASS / ☐ FAIL | Trial active |
| **2. Grace Period (Day 15-19)** | Orange banner, "Complete Setup" button, days countdown | ☐ PASS / ☐ FAIL | 3 days remaining |
| **3. Complete Billing Setup** | Redirects to Stripe, checkout loads correctly | ☐ PASS / ☐ FAIL | Real or simulated |
| **4. Active Subscription** | No alert, "Manage Billing" button, renewal date shown | ☐ PASS / ☐ FAIL | After payment |
| **5. Manage Billing** | Opens Stripe portal successfully | ☐ PASS / ☐ FAIL | Only with real Stripe |
| **6. Navigation** | Back button on pricing page works | ☐ PASS / ☐ FAIL | Returns to settings |

---

## 🔄 Testing Scenarios Matrix

### Scenario A: Trial Active (Days 1-14)

**Setup:**
```sql
-- Fresh account, trial active
created_at: NOW()
billing_status: 'trialing'
stripe_customer_id: NULL
```

**Expected UI:**
- ❌ No billing alert
- ✅ Normal dashboard
- ✅ Settings shows "X days left in trial"

---

### Scenario B: Grace Period (Days 15-19)

**Setup:**
```sql
-- Trial ended 2 days ago
created_at: NOW() - INTERVAL '16 days'
billing_status: 'active'
stripe_customer_id: NULL
```

**Expected UI:**
- ✅ Orange alert banner
- ✅ "3 days remaining" countdown
- ✅ "Complete Billing Setup" button
- ❌ No "Manage Billing" button

---

### Scenario C: Grace Period Expired (Day 19+)

**Setup:**
```sql
-- Trial ended 6+ days ago
created_at: NOW() - INTERVAL '20 days'
billing_status: 'active'
stripe_customer_id: NULL
```

**Expected UI:**
- ✅ Orange alert banner (urgent)
- ✅ "0 days remaining" or expired message
- ✅ "Complete Billing Setup" button
- ⚠️ Account should be deactivated (future feature)

---

### Scenario D: Active Subscription

**Setup:**
```sql
-- Paid subscription
created_at: [any]
billing_status: 'active'
stripe_customer_id: 'cus_...'
subscription_id: 'sub_...'
subscription_end: NOW() + INTERVAL '30 days'
```

**Expected UI:**
- ❌ No alert banner
- ✅ Settings shows renewal date
- ✅ "Manage Billing" button visible
- ❌ No "Complete Billing Setup" button

---

## 🐛 Edge Cases to Test

### Edge Case 1: Multiple Tabs Open
**Test:** Open dashboard and settings in separate tabs, complete billing in one
**Expected:** Both tabs show correct state after refresh

### Edge Case 2: Slow Network
**Test:** Throttle network, click "Complete Billing Setup"
**Expected:** Loading spinner, no duplicate API calls, graceful error handling

### Edge Case 3: Stripe Checkout Abandoned
**Test:** Start checkout, close tab before completing
**Expected:** Still in grace period, can retry, no partial state

### Edge Case 4: Webhook Delay
**Test:** Complete Stripe checkout, webhook takes 5+ seconds
**Expected:** User sees loading or old state until webhook processes

---

## 🔍 Database Verification Queries

### Check Current State
```sql
SELECT
  email,
  company_name,
  plan_tier,
  billing_status,
  stripe_customer_id IS NOT NULL as has_stripe,
  created_at,
  EXTRACT(DAY FROM (NOW() - created_at)) as days_since_created,
  CASE
    WHEN stripe_customer_id IS NOT NULL THEN 'Active Paid'
    WHEN EXTRACT(DAY FROM (NOW() - created_at)) < 14 THEN 'Trial Active'
    WHEN EXTRACT(DAY FROM (NOW() - created_at)) BETWEEN 14 AND 18 THEN 'Grace Period'
    ELSE 'Expired'
  END as account_state
FROM profiles
WHERE email = 'testv8@gmail.com';
```

### Check All Test Accounts
```sql
SELECT
  email,
  company_name,
  billing_status,
  stripe_customer_id IS NOT NULL as paid,
  created_at,
  EXTRACT(DAY FROM (NOW() - created_at)) as age_days
FROM profiles
WHERE email LIKE 'testv%@gmail.com'
ORDER BY created_at DESC;
```

---

## 🧹 Cleanup After Testing

### Delete Test Account
```sql
-- Delete from profiles (cascade will handle related data)
DELETE FROM profiles WHERE email = 'testv8@gmail.com';

-- If you have access to auth.users (Supabase dashboard)
DELETE FROM auth.users WHERE email = 'testv8@gmail.com';
```

### Reset for Retest
```sql
-- Reset to trialing state
UPDATE profiles
SET
  billing_status = 'trialing',
  stripe_customer_id = NULL,
  subscription_id = NULL,
  subscription_start = NULL,
  subscription_end = NULL,
  created_at = NOW()
WHERE email = 'testv8@gmail.com';
```

---

## 📋 Final QA Checklist

### Functionality
- [ ] Alert banner shows when trial ends without payment
- [ ] Countdown timer shows correct days remaining
- [ ] "Complete Billing Setup" button redirects to Stripe
- [ ] Stripe checkout loads with correct plan
- [ ] Webhook updates database after payment
- [ ] Alert disappears after successful payment
- [ ] "Manage Billing" button appears after payment
- [ ] Renewal date displays correctly
- [ ] Navigation links work properly

### UI/UX
- [ ] Alert banner is visually prominent (orange)
- [ ] Warning icon is visible
- [ ] Text is clear and actionable
- [ ] Buttons are not disabled unless loading
- [ ] Loading states show spinners
- [ ] No layout shifts when alert appears/disappears
- [ ] Responsive design works on mobile
- [ ] Dark mode (if enabled) looks correct

### Error Handling
- [ ] Network errors show toast messages
- [ ] Failed checkout allows retry
- [ ] Missing Stripe config shows appropriate error
- [ ] Invalid states don't crash the app

### Security
- [ ] User ID validated on server
- [ ] No Stripe secrets exposed to client
- [ ] Webhook signatures verified
- [ ] Database updates restricted to user's own data

---

## 🎯 Success Criteria

**Test passes if ALL of the following are true:**

1. ✅ Alert banner appears when trial ends without payment
2. ✅ Countdown shows correct days in grace period
3. ✅ "Complete Billing Setup" button opens Stripe checkout
4. ✅ After payment, database updates with customer/subscription IDs
5. ✅ Alert banner disappears after successful payment
6. ✅ "Manage Billing" button works for paid users
7. ✅ Navigation links function correctly
8. ✅ No JavaScript errors in console
9. ✅ No broken layouts or visual glitches
10. ✅ Build completes with 0 errors

---

## 📝 Test Report Template

```markdown
# Post-Trial Billing Flow - Test Report

**Tester:** [Your Name]
**Date:** [Date]
**Build Version:** [Version/Commit]
**Environment:** Local Development / Staging / Production

## Test Results

### Trial State (Day 1-14)
- Account Created: ☐ Pass ☐ Fail
- No Alert Shown: ☐ Pass ☐ Fail
- Notes: _____

### Grace Period (Day 15-19)
- Alert Banner Appears: ☐ Pass ☐ Fail
- Countdown Accurate: ☐ Pass ☐ Fail
- Setup Button Works: ☐ Pass ☐ Fail
- Notes: _____

### Payment Setup
- Stripe Redirect: ☐ Pass ☐ Fail
- Checkout Completes: ☐ Pass ☐ Fail
- Webhook Updates DB: ☐ Pass ☐ Fail
- Notes: _____

### Active Subscription
- Alert Hidden: ☐ Pass ☐ Fail
- Manage Billing Works: ☐ Pass ☐ Fail
- Renewal Date Shows: ☐ Pass ☐ Fail
- Notes: _____

## Issues Found
1. [Issue description]
2. [Issue description]

## Overall Status
☐ All Tests Passed - Ready for Production
☐ Minor Issues - Acceptable with Notes
☐ Major Issues - Requires Fixes

**Recommendation:** _____
```

---

## 🎉 You're All Set!

Follow this guide step-by-step to verify the complete post-trial billing flow. The test should take approximately 15-20 minutes to complete.

**Questions or Issues?**
- Check console for JavaScript errors
- Verify .env variables are loaded
- Ensure Stripe test mode is enabled
- Check Supabase database connectivity

**Good luck with testing! 🚀**
