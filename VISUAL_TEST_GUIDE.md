# Visual Testing Guide - Post-Trial Billing Flow

## 🎨 What You Should See (Screenshots Guide)

---

## State 1: Fresh Trial (Days 1-14)

### Dashboard View
```
┌─────────────────────────────────────────────────────┐
│  SmartHVAC Analytics              [Profile Menu ▼] │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Overview                             [7d ▼]       │
│  Your HVAC business performance at a glance         │
│                                                      │
│  [Total Revenue]  [Jobs Done]  [Avg Hours]  [...]  │
│                                                      │
└─────────────────────────────────────────────────────┘
```
**✅ Expected:**
- Clean layout
- NO orange alert banner
- Normal KPI cards displayed
- Full functionality available

**❌ Should NOT See:**
- Orange warning banner
- "Complete Billing Setup" button
- Grace period countdown

---

## State 2: Grace Period Active (Days 15-19)

### Dashboard View - WITH ALERT
```
┌─────────────────────────────────────────────────────┐
│  SmartHVAC Analytics              [Profile Menu ▼] │
├─────────────────────────────────────────────────────┤
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ ⚠️  Your trial has ended. Please add a payment ┃ │
│ ┃     method to continue service. Your account   ┃ │
│ ┃     will be deactivated in 3 days if no        ┃ │
│ ┃     payment information is added.              ┃ │
│ ┃                                                 ┃ │
│ ┃  3 days remaining  [Complete Billing Setup →] ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                                      │
│  Overview                             [7d ▼]       │
│  Your HVAC business performance at a glance         │
│                                                      │
│  [Total Revenue]  [Jobs Done]  [Avg Hours]  [...]  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**✅ Expected:**
- **PROMINENT orange banner** at top
- Warning triangle icon (⚠️)
- Clear message about trial ending
- **Countdown timer** (e.g., "3 days remaining")
- **Orange "Complete Billing Setup" button**
- Button is NOT disabled
- Regular dashboard content below

**❌ Should NOT See:**
- Green success banner
- "Manage Billing" button
- "Trial active" message

---

### Settings Page - WITH ALERT

```
┌─────────────────────────────────────────────────────┐
│  Settings                         [Profile Menu ▼] │
│  Manage your account and preferences                │
├─────────────────────────────────────────────────────┤
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ ⚠️  Your trial has ended. Please add payment.. ┃ │
│ ┃  3 days remaining  [Complete Billing Setup →] ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                                      │
│  ┌───────────────────────────────────────────────┐ │
│  │ Profile Information                           │ │
│  │ [Company Name: testv8]                        │ │
│  └───────────────────────────────────────────────┘ │
│                                                      │
│  ┌───────────────────────────────────────────────┐ │
│  │ Subscription & Billing                        │ │
│  │                                               │ │
│  │ Starter Plan                                  │ │
│  │ Status: [Active]                              │ │
│  │                                               │ │
│  │ ⚠️ Payment method required - 3 days remaining│ │
│  │                                               │ │
│  │ [Complete Billing Setup]  [Upgrade Plan]     │ │
│  └───────────────────────────────────────────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**✅ Expected:**
- Orange alert banner at PAGE TOP
- Same alert in subscription section
- Orange warning text in subscription card
- **"Complete Billing Setup" button** (primary/orange)
- "Upgrade Plan" button still visible
- NO "Manage Billing" button
- NO renewal date shown

**❌ Should NOT See:**
- "Manage Billing" button
- Renewal date
- Green "Active" with checkmark
- "Trial active" status

---

## State 3: Clicking "Complete Billing Setup"

### Button Loading State
```
┌──────────────────────────────────────────┐
│ [⌛ Loading... ]                         │
└──────────────────────────────────────────┘
```
**✅ Expected:**
- Button shows spinner
- Button text: "Loading..."
- Button is disabled
- No page navigation yet

### Stripe Checkout Redirect
```
┌─────────────────────────────────────────────────────┐
│  🔒 Stripe Checkout                     [Close ✕]  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Subscribe to SmartHVAC Analytics                   │
│  Starter Plan                                       │
│                                                      │
│  $49.00 / month                                     │
│  Includes 14-day free trial                         │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ Email: testv8@gmail.com                    │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ Card information                           │    │
│  │ 4242 4242 4242 4242                       │    │
│  │ 12 / 25    123    12345                   │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  [Subscribe]                                        │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**✅ Expected:**
- Redirects to Stripe Checkout page
- Shows correct plan (Starter)
- Shows correct price ($49/month)
- Shows 14-day trial included
- Can enter test card: 4242 4242 4242 4242
- Checkout is in test mode

**❌ Should NOT See:**
- Production Stripe URL
- Real payment processing
- Error messages
- Your original app UI

---

## State 4: Active Subscription (After Payment)

### Dashboard View - NO ALERT
```
┌─────────────────────────────────────────────────────┐
│  SmartHVAC Analytics              [Profile Menu ▼] │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Overview                             [7d ▼]       │
│  Your HVAC business performance at a glance         │
│                                                      │
│  [Total Revenue]  [Jobs Done]  [Avg Hours]  [...]  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**✅ Expected:**
- Clean layout (like State 1)
- **NO orange alert banner**
- Normal KPI cards
- Full functionality

**❌ Should NOT See:**
- Any orange warnings
- Grace period countdown
- "Complete Billing Setup" button

---

### Settings Page - ACTIVE STATE

```
┌─────────────────────────────────────────────────────┐
│  Settings                         [Profile Menu ▼] │
│  Manage your account and preferences                │
├─────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐ │
│  │ Subscription & Billing                        │ │
│  │                                               │ │
│  │ Starter Plan                                  │ │
│  │ Status: [Active] ✅                           │ │
│  │                                               │ │
│  │ Renewal Date: November 23, 2025              │ │
│  │                                               │ │
│  │ Plan Features:                                │ │
│  │  • Technicians: 3                             │ │
│  │  • Analytics: 7-30 days                       │ │
│  │  • Export Reports: No                         │ │
│  │                                               │ │
│  │ [Manage Billing]  [Upgrade Plan]             │ │
│  └───────────────────────────────────────────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**✅ Expected:**
- NO alert banner
- Status badge: "Active" (green or default)
- **Renewal Date displayed** (30 days from now)
- **"Manage Billing" button** visible
- "Upgrade Plan" button visible
- Plan features listed
- NO orange warnings

**❌ Should NOT See:**
- Orange alert banner
- "Complete Billing Setup" button
- Grace period warning
- "Payment method required" text

---

## State 5: Clicking "Manage Billing"

### Stripe Customer Portal
```
┌─────────────────────────────────────────────────────┐
│  🔒 Stripe Customer Portal          [← Back]       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Billing Management                                 │
│                                                      │
│  Current Subscription                               │
│  Starter Plan - $49.00/month                        │
│  Next payment: November 23, 2025                    │
│                                                      │
│  [Update Payment Method]                            │
│  [Cancel Subscription]                              │
│                                                      │
│  Invoices                                           │
│  ┌────────────────────────────────────────────┐    │
│  │ Nov 23, 2024  $49.00  [Download PDF]      │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**✅ Expected:**
- Redirects to Stripe Customer Portal
- Shows subscription details
- Can update payment method
- Can view invoices
- Can cancel subscription

**Note:** This only works with real Stripe subscriptions, not simulated ones.

---

## 🎯 Visual Checklist

### Color Coding
- 🟢 **Green/Default**: Active, good state
- 🟠 **Orange**: Warning, action needed soon
- 🔴 **Red**: Urgent, immediate action required
- ⚪ **Gray**: Neutral, informational

### Banner Colors
- **Orange banner** with warning icon: Grace period
- **No banner**: Either trial active OR subscription active

### Button Colors
- **Orange button** ("Complete Billing Setup"): Urgent action
- **Default button** ("Manage Billing"): Normal action
- **Secondary button** ("Upgrade Plan"): Optional action

---

## 🐛 Visual Bugs to Watch For

### Layout Issues
- [ ] Banner causes content shift/jump
- [ ] Banner overlaps navigation
- [ ] Text overflows on mobile
- [ ] Buttons cut off on small screens

### Color Issues
- [ ] Orange banner too subtle
- [ ] Text not readable on banner
- [ ] Status badge wrong color
- [ ] Dark mode issues

### Content Issues
- [ ] Days countdown shows negative
- [ ] Renewal date shows "Invalid Date"
- [ ] Message text cut off
- [ ] Icon missing or broken

### Interaction Issues
- [ ] Button doesn't respond to clicks
- [ ] Loading state doesn't show
- [ ] Redirect doesn't happen
- [ ] Console errors appear

---

## 📱 Mobile Responsive Testing

### Grace Period Banner on Mobile
```
┌─────────────────────────┐
│ ⚠️                      │
│ Your trial has ended.   │
│ Please add payment...   │
│                         │
│ 3 days remaining        │
│ [Complete Setup]        │
└─────────────────────────┘
```

**✅ Expected:**
- Text wraps properly
- Button full width or centered
- Icon still visible
- Readable font size
- No horizontal scroll

---

## 🎨 Browser Testing Matrix

| Browser | Grace Alert | Active State | Checkout | Portal |
|---------|------------|--------------|----------|--------|
| Chrome | ☐ | ☐ | ☐ | ☐ |
| Firefox | ☐ | ☐ | ☐ | ☐ |
| Safari | ☐ | ☐ | ☐ | ☐ |
| Edge | ☐ | ☐ | ☐ | ☐ |

---

## 📸 Screenshot Checklist

When testing, capture:
1. ✅ Dashboard with grace period banner
2. ✅ Settings with grace period warning
3. ✅ Complete Billing Setup button loading state
4. ✅ Stripe Checkout page
5. ✅ Dashboard after payment (no banner)
6. ✅ Settings after payment (Manage Billing visible)
7. ✅ Mobile view of banner
8. ✅ Console showing no errors

---

## 🎯 Quick Visual Test (30 seconds)

1. **Grace Period State**:
   - Look for orange banner ✅
   - Look for "X days remaining" ✅
   - Look for "Complete Billing Setup" button ✅

2. **Active State**:
   - Banner should be GONE ✅
   - "Manage Billing" should be visible ✅
   - Renewal date should be displayed ✅

**If all 6 checkmarks pass, visual test is SUCCESSFUL! 🎉**
