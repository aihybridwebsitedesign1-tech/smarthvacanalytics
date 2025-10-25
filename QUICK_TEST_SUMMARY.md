# Quick E2E Billing Test Summary

## 🚀 Fast Track Testing (5 Minutes)

### Step 1: Create Account (2 min)
1. Go to: http://localhost:3000/signup
2. Enter:
   - Email: `testv8@gmail.com`
   - Password: `TestPass123!`
   - Company: `testv8`
   - Plan: **Starter**
3. Click "Create Account"

### Step 2: Simulate Trial End (30 seconds)
Run this SQL in Supabase:
```sql
UPDATE profiles
SET
  created_at = NOW() - INTERVAL '16 days',
  billing_status = 'active'
WHERE email = 'testv8@gmail.com';
```

### Step 3: Verify Grace Period UI (1 min)
1. Logout and login again
2. ✅ Check: Orange alert banner appears
3. ✅ Check: Shows "3 days remaining"
4. ✅ Check: "Complete Billing Setup" button visible

### Step 4: Test Checkout Button (1 min)
1. Click "Complete Billing Setup"
2. ✅ Check: Redirects to Stripe Checkout
3. Optional: Complete checkout with test card `4242 4242 4242 4242`

### Step 5: Simulate Payment (30 seconds)
Run this SQL:
```sql
UPDATE profiles
SET
  stripe_customer_id = 'cus_test_v8',
  subscription_id = 'sub_test_v8',
  subscription_start = NOW(),
  subscription_end = NOW() + INTERVAL '30 days'
WHERE email = 'testv8@gmail.com';
```

### Step 6: Verify Active State (30 seconds)
1. Refresh dashboard
2. ✅ Check: NO orange alert
3. ✅ Check: Settings shows "Manage Billing" button
4. ✅ Check: Renewal date displayed

---

## 📊 Expected Results Table

| State | Dashboard | Settings | Pass/Fail |
|-------|-----------|----------|-----------|
| **Trialing (Initial)** | No alert | Trial countdown | ☐ |
| **Grace Period** | Orange alert, countdown | Setup button | ☐ |
| **Active (Paid)** | No alert | Manage Billing button | ☐ |

---

## 🎯 Success Criteria

**Test PASSES if:**
1. ✅ Orange banner appears in grace period
2. ✅ Banner shows days remaining
3. ✅ "Complete Billing Setup" button works
4. ✅ Banner disappears after payment
5. ✅ "Manage Billing" replaces setup button

**Test FAILS if:**
- ❌ No banner in grace period
- ❌ Banner persists after payment
- ❌ Button doesn't redirect
- ❌ Console errors appear

---

## 🧹 Cleanup

Delete test account:
```sql
DELETE FROM profiles WHERE email = 'testv8@gmail.com';
-- Also delete from auth.users in Supabase dashboard
```

---

## 📁 Full Documentation

- **Complete Guide**: `E2E_BILLING_TEST.md`
- **SQL Helpers**: `scripts/sql-test-helpers.sql`
- **Implementation Details**: `POST_TRIAL_BILLING_QA.md`
