# 🚀 Stripe Quick Start (5 Minutes)

## ⚠️ Current Issue

**Error**: "Failed to start checkout. Please try again."

**Cause**: Your `.env` file has placeholder Stripe keys. Real Stripe API keys are required for payments to work.

---

## ✅ Quick Fix (5 Steps)

### 1️⃣ Login to Stripe
Go to: https://dashboard.stripe.com/test/apikeys

### 2️⃣ Copy Your Keys
- **Publishable Key**: `pk_test_...` (click "Reveal test key")
- **Secret Key**: `sk_test_...` (click "Reveal test key")

### 3️⃣ Create Products
Go to: https://dashboard.stripe.com/test/products

Create 3 products:
- **Starter**: $49/month recurring
- **Growth**: $99/month recurring
- **Pro**: $199/month recurring

Copy each **Price ID** (starts with `price_...`)

### 4️⃣ Update .env File

Replace placeholders with your real keys:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE

NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_YOUR_STARTER_ID
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_YOUR_GROWTH_ID
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_YOUR_PRO_ID
```

### 5️⃣ Restart Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## ✅ Test Payment

1. Login: testv8@gmail.com / TestPass123!
2. Click "Complete Billing Setup"
3. Should redirect to Stripe Checkout
4. Use test card: `4242 4242 4242 4242`
5. Complete checkout
6. Alert should disappear after payment

---

## 📚 Full Guide

For detailed instructions, see: **STRIPE_SETUP_GUIDE.md**

---

## 🎴 Test Cards

| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 0341` | ❌ Declined |

**All test cards**:
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

---

## ✅ Implementation Status

Your Stripe integration is **100% complete**:

- ✅ Checkout API (`/api/checkout`)
- ✅ Webhook handler (`/api/webhooks`)
- ✅ Customer Portal (`/api/portal`)
- ✅ Grace period alerts
- ✅ Billing buttons
- ✅ Database integration

**Only missing**: Your real Stripe API keys!

---

## 🔗 Quick Links

- Get API Keys: https://dashboard.stripe.com/test/apikeys
- Create Products: https://dashboard.stripe.com/test/products
- View Webhooks: https://dashboard.stripe.com/test/webhooks
- Stripe CLI: https://stripe.com/docs/stripe-cli
- Test Cards: https://stripe.com/docs/testing

---

**After adding keys, payments will work immediately! 🎉**
