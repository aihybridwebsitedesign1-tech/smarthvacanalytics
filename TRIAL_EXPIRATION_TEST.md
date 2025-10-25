# Trial Expiration Testing - Complete Guide

## 🎯 Test Account Information

**Test Account Details:**
- **Email**: testv7@gmail.com
- **Company**: testv7
- **Plan Tier**: Starter ($49/month)
- **User ID**: `949c8fcc-4bd2-4ea1-88a8-dfec05224582`

## ✅ Database Update Complete

### Before Update:
```json
{
  "billing_status": "trialing",
  "subscription_id": null,
  "stripe_customer_id": null,
  "subscription_start": null,
  "subscription_end": null
}
```

### After Update (Trial Ended):
```json
{
  "billing_status": "active",
  "subscription_id": "sub_test_simulation_949c8fcc-4bd2-4ea1-88a8-dfec05224582",
  "stripe_customer_id": "cus_test_simulation_949c8fcc-4bd2-4ea1-88a8-dfec05224582",
  "subscription_start": "2025-10-24 00:37:45.172083+00",
  "subscription_end": "2025-11-23 00:37:45.172083+00"
}
```

**Subscription Status**: Active - 29 days remaining until next billing

---

## 📋 Manual UI Testing Checklist

### Test 1: Login and Dashboard View

**Steps:**
1. Navigate to `/login`
2. Login with credentials:
   - Email: `testv7@gmail.com`
   - Password: [user's password]
3. Observe the dashboard

**Expected Results:**
- ✅ No "14-day free trial" banner visible
- ✅ Dashboard loads normally
- ✅ KPI cards display data
- ✅ All features accessible (within Starter plan limits)

**Actual Results:**
- [ ] Trial banner removed: ____
- [ ] Dashboard functional: ____
- [ ] Data displays correctly: ____

---

### Test 2: Settings Page - Subscription Status

**Steps:**
1. Navigate to `/dashboard/settings`
2. Locate the "Subscription" section
3. Check billing status display

**Expected Results:**
- ✅ Status badge shows "Active" (green)
- ✅ Plan tier shows "Starter Plan"
- ✅ Renewal date shows: November 23, 2025
- ✅ No trial countdown timer visible
- ✅ "Manage Billing" button is present and functional

**Visual Example:**
```
┌─────────────────────────────────────┐
│  Current Subscription               │
├─────────────────────────────────────┤
│  Plan: Starter Plan                 │
│  Status: [Active] ✅                │
│  Renewal: November 23, 2025         │
│                                      │
│  [Manage Billing]  [Upgrade Plan]   │
└─────────────────────────────────────┘
```

**Actual Results:**
- [ ] Status shows "Active": ____
- [ ] Renewal date correct: ____
- [ ] Trial timer hidden: ____
- [ ] Manage Billing works: ____

---

### Test 3: Plan Restrictions (Starter Plan)

**Steps:**
1. Navigate to `/dashboard/technicians`
2. Try to add a 4th technician (Starter limit is 3)
3. Navigate to `/dashboard/analytics`
4. Try to select "6 months" timeframe
5. Try to export a report

**Expected Results:**
- ✅ Adding 4th technician shows upgrade modal
- ✅ Extended timeframes (3m, 6m, 1y) are locked
- ✅ Export buttons are disabled/show upgrade modal

**Actual Results:**
- [ ] Technician limit enforced: ____
- [ ] Analytics timeframe locked: ____
- [ ] Export disabled: ____

---

### Test 4: Upgrade Flow

**Steps:**
1. Click "Upgrade Plan" from Settings or upgrade modal
2. View pricing options
3. Observe current plan indicator

**Expected Results:**
- ✅ Pricing page shows all three tiers
- ✅ "Current Plan" badge on Starter
- ✅ Upgrade buttons for Growth and Pro
- ✅ Clicking upgrade redirects to Stripe Checkout

**Actual Results:**
- [ ] Current plan marked: ____
- [ ] Upgrade options visible: ____
- [ ] Checkout redirects work: ____

---

### Test 5: Database State Verification

**SQL Query to Run:**
```sql
SELECT
  email,
  company_name,
  plan_tier,
  billing_status,
  subscription_start,
  subscription_end,
  EXTRACT(DAY FROM (subscription_end - NOW())) as days_remaining
FROM profiles
WHERE email = 'testv7@gmail.com';
```

**Expected Results:**
```
email             | testv7@gmail.com
company_name      | testv7
plan_tier         | starter
billing_status    | active
subscription_start| 2025-10-24 00:37:45
subscription_end  | 2025-11-23 00:37:45
days_remaining    | 29
```

**Actual Results:**
- [x] Status is 'active': ✅
- [x] Subscription dates set: ✅
- [x] 30-day billing cycle: ✅

---

## 🔄 Simulating Real Stripe Webhook Flow

For testing with actual Stripe webhooks, use this approach:

### Option A: Local Webhook Testing with Stripe CLI

```bash
# 1. Install Stripe CLI
brew install stripe/stripe-cli/stripe

# 2. Login
stripe login

# 3. Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks

# 4. Create a test subscription with trial
stripe subscriptions create \
  --customer=cus_test_xxx \
  --items[0][price]=price_1SLYRNLkAXPwB0Q3AhDTHym0 \
  --trial_period_days=14

# 5. End the trial immediately
stripe subscriptions update sub_xxx --trial-end=now

# 6. Observe webhook events in console
```

### Option B: Direct Database Simulation (Current Method)

We've used this method since the user doesn't have a real Stripe subscription:

```sql
UPDATE profiles
SET
  billing_status = 'active',
  subscription_id = 'sub_test_simulation_' || id,
  stripe_customer_id = 'cus_test_simulation_' || id,
  subscription_start = NOW(),
  subscription_end = NOW() + INTERVAL '30 days'
WHERE email = 'testv7@gmail.com';
```

**Pros:**
- ✅ Instant results
- ✅ No Stripe API calls needed
- ✅ Perfect for UI testing
- ✅ No webhook dependencies

**Cons:**
- ⚠️ Doesn't test actual Stripe integration
- ⚠️ Doesn't verify webhook handling
- ⚠️ No real payment processing

---

## 📊 QA Verification Report

| Checkpoint | Expected | Result | Notes |
|-----------|----------|--------|-------|
| **Database Update** | billing_status = 'active' | ✅ PASS | Updated successfully |
| **Subscription ID Set** | sub_test_simulation_* | ✅ PASS | Simulated ID created |
| **Customer ID Set** | cus_test_simulation_* | ✅ PASS | Simulated ID created |
| **Subscription Start** | Current timestamp | ✅ PASS | Set to 2025-10-24 00:37:45 |
| **Subscription End** | 30 days from start | ✅ PASS | Set to 2025-11-23 00:37:45 |
| **Trial Banner Removed** | No trial messaging | 🔄 MANUAL | Requires UI testing |
| **Settings Shows Active** | Green "Active" badge | 🔄 MANUAL | Requires UI testing |
| **Renewal Date Displayed** | Shows Nov 23, 2025 | 🔄 MANUAL | Requires UI testing |
| **Plan Limits Enforced** | Starter restrictions apply | 🔄 MANUAL | Requires UI testing |
| **Upgrade Flow Works** | Can upgrade to Growth/Pro | 🔄 MANUAL | Requires UI testing |

**Legend:**
- ✅ PASS - Verified automatically
- 🔄 MANUAL - Requires manual UI testing
- ❌ FAIL - Did not meet expectations

---

## 🎯 Complete Real-World Stripe Testing

To test the full end-to-end flow with real Stripe webhooks:

### 1. Create a Real Test Subscription

```typescript
// Use /api/checkout endpoint
POST /api/checkout
{
  "priceId": "price_1SLYRNLkAXPwB0Q3AhDTHym0",
  "userId": "949c8fcc-4bd2-4ea1-88a8-dfec05224582",
  "email": "testv7@gmail.com"
}
```

### 2. Complete Stripe Checkout

- User will be redirected to Stripe Checkout
- Use test card: 4242 4242 4242 4242
- Complete the checkout flow
- Stripe creates subscription with 14-day trial

### 3. Verify Initial State

After checkout completion:
```
billing_status: "trialing"
subscription_id: "sub_1Abc..."
trial_end: [14 days from now]
```

### 4. End Trial via Stripe Dashboard or API

**Option A - Stripe Dashboard:**
1. Go to Stripe Dashboard > Subscriptions
2. Find the test subscription
3. Click "Actions" > "End trial"

**Option B - Stripe API:**
```bash
stripe subscriptions update sub_xxx --trial-end=now
```

### 5. Webhook Events to Monitor

When trial ends, Stripe fires these events:
1. `customer.subscription.updated` - Trial ended, now active
2. `invoice.created` - First invoice created
3. `invoice.finalized` - Invoice ready for payment
4. `invoice.payment_succeeded` - Payment processed
5. `charge.succeeded` - Charge completed

### 6. Expected Database Changes

After webhook processing:
```
billing_status: "trialing" → "active"
subscription_start: [original date]
subscription_end: [30 days from trial end]
```

---

## 🔍 Debugging Webhook Issues

If webhooks aren't processing:

### Check Webhook Logs

```bash
# View recent webhook events in Stripe Dashboard
# Dashboard > Developers > Webhooks > [Your endpoint] > Events

# Or use Stripe CLI
stripe events list --limit=10
```

### Verify Webhook Signature

```typescript
// In /api/webhooks/route.ts
console.log('[Stripe Webhook] Received event:', event.type);
console.log('[Stripe Webhook] Payload:', JSON.stringify(event.data.object, null, 2));
```

### Test Webhook Locally

```bash
# Trigger a test webhook
stripe trigger invoice.payment_succeeded

# Or send a specific event
stripe events resend evt_xxx
```

---

## ✅ Testing Complete - Summary

### Database Changes Applied ✅

The test account `testv7@gmail.com` has been updated to simulate a completed trial:

| Field | Old Value | New Value |
|-------|-----------|-----------|
| billing_status | trialing | **active** |
| subscription_id | null | sub_test_simulation_... |
| stripe_customer_id | null | cus_test_simulation_... |
| subscription_start | null | 2025-10-24 00:37:45 |
| subscription_end | null | 2025-11-23 00:37:45 |

### Next Steps for Complete Verification

1. **Login as testv7@gmail.com**
   - Verify no trial banner appears
   - Check dashboard loads correctly

2. **Visit Settings Page**
   - Confirm "Active" status badge (green)
   - Verify renewal date shows November 23, 2025
   - Test "Manage Billing" button

3. **Test Plan Restrictions**
   - Verify Starter plan limits are enforced
   - Check locked features show upgrade prompts

4. **Optional: Test Real Stripe Flow**
   - Create a new test account
   - Go through actual Stripe checkout
   - Use Stripe CLI to end trial
   - Verify webhook processing

---

## 📝 Rollback Instructions

To reset the test account back to trial status:

```sql
UPDATE profiles
SET
  billing_status = 'trialing',
  subscription_id = NULL,
  stripe_customer_id = NULL,
  subscription_start = NULL,
  subscription_end = NULL
WHERE email = 'testv7@gmail.com';
```

---

## 🎉 Conclusion

The trial expiration simulation is **COMPLETE** for testv7@gmail.com. The database now reflects an active subscription status, allowing you to verify the UI changes when a trial ends.

**Database State**: ✅ Updated
**Ready for UI Testing**: ✅ Yes
**Subscription Active**: ✅ 29 days remaining
**Plan Tier**: ✅ Starter

Login as testv7@gmail.com to verify the UI now displays "Active Subscription" instead of the trial banner.
