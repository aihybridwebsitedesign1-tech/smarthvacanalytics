# Stripe Integration Guide - SmartHVACAnalytics

## Live Price IDs Configured

The following live Stripe price IDs are now configured:

- **Starter Plan**: `price_1SLYRNLkAXPwB0Q3AhDTHym0` ($49/month)
- **Growth Plan**: `price_1SLYRrLkAXPwB0Q3QwM6mHWF` ($99/month)
- **Pro Plan**: `price_1SLYSOLkAXPwB0Q3W3SoW0Cm` ($199/month)

## Environment Variables Required

Update your `.env` file with your live Stripe keys:

```bash
# Stripe Configuration (Live Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_1SLYRNLkAXPwB0Q3AhDTHym0
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_1SLYRrLkAXPwB0Q3QwM6mHWF
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_1SLYSOLkAXPwB0Q3W3SoW0Cm
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

## Webhook Configuration

### 1. Create Webhook Endpoint in Stripe Dashboard

1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your endpoint URL: `https://your-domain.com/api/webhooks`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the webhook signing secret and add it to your `.env` file

### 2. Test Webhook Locally (Development)

Using Stripe CLI:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks

# Copy the webhook signing secret to .env
# whsec_...
```

## Testing Checkout Flow

### Test Mode (Recommended for Development)

1. Use test mode keys: `pk_test_...` and `sk_test_...`
2. Use test card: `4242 4242 4242 4242`
3. Any future expiry date and any 3-digit CVC

### Live Mode Testing

1. Use live mode keys in `.env`
2. Test with real payment methods
3. **Important**: Cancel test subscriptions immediately to avoid charges

## Integration Points

### 1. Pricing Page (`/pricing`)
- Displays all three plans with live pricing
- "Start Free Trial" button redirects to Stripe Checkout
- 14-day trial included automatically

### 2. Upgrade Modal (Dashboard)
- Accessible from restricted features
- Shows plan comparison
- Direct checkout links

### 3. Settings Page (`/dashboard/settings`)
- Shows current subscription status
- Displays billing status (trialing, active, past_due)
- "Manage Billing" button opens Stripe Customer Portal
- Shows renewal date and trial countdown

### 4. Access Controls
- Enforced based on `plan_tier` in database
- Technician limits checked
- Analytics timeframe restrictions
- Export feature restrictions

## Database Fields Updated by Webhooks

When a subscription event occurs, these fields are updated:

```typescript
{
  billing_status: 'trialing' | 'active' | 'past_due' | 'canceled',
  subscription_id: 'sub_...',
  stripe_customer_id: 'cus_...',
  plan_tier: 'starter' | 'growth' | 'pro',
  subscription_start: '2025-01-01T00:00:00Z',
  subscription_end: '2025-02-01T00:00:00Z'
}
```

## Subscription Lifecycle

### 1. New Subscription
**Event**: `checkout.session.completed`
- Creates Stripe customer
- Starts 14-day trial
- Updates database with subscription details
- Sets `billing_status` to 'trialing'

### 2. Trial Ends / Subscription Activates
**Event**: `customer.subscription.updated`
- Changes `billing_status` to 'active'
- First payment processed
- Subscription continues

### 3. Subscription Updated (Plan Change)
**Event**: `customer.subscription.updated`
- Updates `plan_tier` in database
- Proration applied automatically by Stripe
- Access controls updated immediately

### 4. Payment Failure
**Event**: `invoice.payment_failed`
- Sets `billing_status` to 'past_due'
- User notified (can add email notification)
- Access may be restricted based on grace period

### 5. Subscription Canceled
**Event**: `customer.subscription.deleted`
- Sets `billing_status` to 'canceled'
- Reverts `plan_tier` to 'starter'
- User keeps access until period end

## API Routes

### POST `/api/checkout`
Creates a Stripe Checkout session for a new subscription.

**Request:**
```json
{
  "priceId": "price_1SLYRrLkAXPwB0Q3QwM6mHWF",
  "userId": "user-uuid",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "sessionId": "cs_...",
  "url": "https://checkout.stripe.com/..."
}
```

### POST `/api/portal`
Creates a Stripe Customer Portal session.

**Request:**
```json
{
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

### POST `/api/webhooks`
Handles Stripe webhook events.

**Headers Required:**
- `stripe-signature`: Webhook signature for verification

## Troubleshooting

### Webhook Not Receiving Events
1. Check webhook URL is correct and publicly accessible
2. Verify webhook secret in `.env` matches Stripe dashboard
3. Check server logs for webhook errors
4. Use Stripe CLI to test locally: `stripe listen --forward-to localhost:3000/api/webhooks`

### Subscription Not Updating Database
1. Check webhook logs in Stripe Dashboard
2. Verify price IDs in `.env` match Stripe products
3. Check database permissions (service role key needed)
4. Review server logs for error messages

### Checkout Session Not Creating
1. Verify publishable key is correct
2. Check price IDs are valid
3. Ensure user is authenticated
4. Check browser console for errors

### Plan Tier Not Matching
1. Verify price ID mapping in webhook handler
2. Check logs to see which price ID was received
3. Ensure environment variables are loaded correctly

## Security Checklist

- [ ] Never commit real Stripe keys to version control
- [ ] Use environment variables for all secrets
- [ ] Verify webhook signatures on all webhook endpoints
- [ ] Use HTTPS in production
- [ ] Set up proper CORS headers
- [ ] Enable Stripe radar for fraud detection
- [ ] Monitor failed payments and webhooks
- [ ] Set up alerts for critical events

## Testing Checklist

### Starter Plan
- [ ] Checkout flow completes successfully
- [ ] Database updates with correct plan_tier
- [ ] Technician limit enforced (max 3)
- [ ] Analytics restricted to 7d/30d
- [ ] Export buttons disabled

### Growth Plan
- [ ] Checkout flow completes successfully
- [ ] Database updates with correct plan_tier
- [ ] Technician limit enforced (max 10)
- [ ] All analytics timeframes accessible
- [ ] Export buttons functional

### Pro Plan
- [ ] Checkout flow completes successfully
- [ ] Database updates with correct plan_tier
- [ ] Unlimited technicians allowed
- [ ] All analytics timeframes accessible
- [ ] Export buttons functional

### Webhook Events
- [ ] checkout.session.completed updates database
- [ ] customer.subscription.updated syncs changes
- [ ] customer.subscription.deleted reverts to starter
- [ ] invoice.payment_failed marks as past_due

### Billing Portal
- [ ] Opens correctly from Settings page
- [ ] Shows current subscription
- [ ] Allows plan changes
- [ ] Handles cancellation properly

## Support Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Webhook Testing](https://stripe.com/docs/webhooks/test)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
