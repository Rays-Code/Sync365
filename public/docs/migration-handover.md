# Sync365 � Web Migration Handover Document

**Date:** February 2026  
**From:** Lovable Cloud (Current Host)  
**To:** AWS (App Runner / Lambda)  
**Purpose:** Developer handover � do NOT re-build what's already coded. Port & deploy only.

---

## 1. FRONTEND � React SPA (Complete, Ready to Deploy)

**Stack:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui

### All Routes (20 total)

| Route | Page Component | Description |
|---|---|---|
| `/` | Index | Landing page (Hero, Features, Pricing, Testimonials, FAQ, CTA) |
| `/auth` | Auth | User signup/login (Supabase Auth � needs replacement) |
| `/dashboard` | Dashboard | User dashboard with 5 tabs (see Section 4) |
| `/admin/login` | AdminLogin | Admin authentication |
| `/admin` | AdminDashboard | Admin panel with 9 tabs (see Section 5) |
| `/admin/emails` | EmailPreview | Preview branded email templates |
| `/billing/auth` | BillingAuth | Billing portal auth (direct Rork DB) |
| `/subscription` | SubscriptionPage | Stripe subscription management |
| `/account/subscription` | AccountSubscription | Post-purchase subscription view |
| `/pricing` | PricingPage | Public pricing page |
| `/about` | AboutPage | About page |
| `/corporate` | CorporatePartnership | Corporate partnership info |
| `/waitlist` | WaitlistPage | Waitlist signup with referral codes |
| `/contact` | ContactPage | Contact form |
| `/refund-policy` | RefundPolicyPage | Refund policy |
| `/samples` | SamplePages | Sample/demo pages |
| `/page/:slug` | ContentPage | Dynamic CMS pages |
| `*` | NotFound | 404 page |

### Frontend Migration Notes
- All components are in `src/components/` � no changes needed
- Design system uses CSS custom properties in `src/index.css` + `tailwind.config.ts`
- Fonts: Cormorant Garamond (display) + DM Sans (body) via `@fontsource`
- Only change needed: replace `@/integrations/supabase/client` imports with new auth/API client

---

## 2. BACKEND � Edge Functions ? Port to Node.js/Lambda

**Current:** 16 Deno edge functions on Supabase  
**Target:** Node.js on AWS Lambda (or App Runner)

### Function Inventory

| # | Function | Method | Purpose | Complexity |
|---|---|---|---|---|
| 1 | `stripe-checkout` | POST | Create Stripe Checkout Session with plan conflict validation | HIGH |
| 2 | `stripe-billing-webhook` | POST | Handle Stripe webhook events ? update Supabase (subscriptions, orders, transactions) | HIGH |
| 3 | `stripe-cancel-subscription` | POST | Cancel subscription (annual=prorated refund, monthly=cancel at period end) | MEDIUM |
| 4 | `stripe-refund-subscription` | POST | Process refund via Stripe API | MEDIUM |
| 5 | `stripe-refund` | POST | Generic Stripe refund handler | MEDIUM |
| 6 | `stripe-create-coupon` | POST | Create Stripe coupon codes | LOW |
| 7 | `stripe-list-coupons` | GET | List active Stripe coupons | LOW |
| 8 | `stripe-customer-portal` | POST | Generate Stripe Customer Portal URL | LOW |
| 9 | `redeem-code` | POST | Redeem subscription code with 8-rule conflict matrix | HIGH |
| 10 | `send-notification-email` | POST | Send branded emails via AWS SES (5 templates) | MEDIUM |
| 11 | `send-waitlist-email` | POST | Waitlist confirmation email via AWS SES | LOW |
| 12 | `external-db-query` | POST | Admin read from Supabase tables | LOW |
| 13 | `external-db-mutate` | POST | Admin write to Supabase tables | LOW |
| 14 | `external-db-stats` | POST | Aggregate stats from Supabase | LOW |
| 15 | `lookup-unique-id` | POST | Look up user's 7-digit anonymous ID | LOW |
| 16 | `track-visit` | POST | Record page visit analytics | LOW |
| 17 | `track-security-event` | POST | Log security events | LOW |
| 18 | `billing-account` | POST | Billing portal account operations | MEDIUM |

### Porting Notes
- All functions use `Deno.env.get()` ? change to `process.env`
- All use `serve()` from Deno std ? change to Express/Fastify handler or Lambda handler
- Stripe SDK: `https://esm.sh/stripe@14.21.0` ? `npm install stripe`
- Supabase client: `https://esm.sh/@supabase/supabase-js@2.45.0` ? `npm install @supabase/supabase-js`
- CORS headers are manually set in each function � can be centralized in API Gateway or middleware

---

## 3. BUSINESS LOGIC � Already Implemented (DO NOT Re-develop)

### 3a. Subscription Conflict Matrix (8 Rules)

Implemented in `redeem-code` and `stripe-checkout`:

| # | Current State | Action | Result |
|---|---|---|---|
| 1 | No subscription / Expired | Redeem or Purchase | Activate immediately |
| 2 | Active Monthly | Redeem/Buy Monthly | ? REJECT � "Already on this plan" |
| 3 | Active Annual | Redeem/Buy Annual | ? REJECT � "Already on this plan" |
| 4 | Active Annual | Redeem/Buy Monthly | ? REJECT � "Higher-tier plan active" |
| 5 | Active Monthly | Redeem/Buy Annual | ? Queue � starts after monthly ends |
| 6 | Queued plan exists | Any redemption | ? REJECT � "Plan already queued" |
| 7 | Same-tier purchase | Stripe checkout | ? REJECT before Stripe session |
| 8 | Cancelled (period not ended) | Redeem | ? Queue � starts after period ends |

### 3b. Cancellation Logic (Split Model)

- **Annual plans:** Prorated refund via Stripe, immediate cancellation
- **Monthly plans:** Cancel at period end (Netflix-style), access maintained until billing cycle concludes
- Implemented in `stripe-cancel-subscription` and `stripe-refund-subscription`

### 3c. Email Templates (5 Branded HTML Templates)

All in `send-notification-email`, sent via AWS SES:

1. **Welcome** � New user registration
2. **Redemption** � Code successfully redeemed
3. **Subscription** � Plan activated/changed
4. **Refund** � Refund processed
5. **Suspension** � Account suspended

---

## 4. USER DASHBOARD (`/dashboard`) � 5 Tabs

| Tab | Component | Data Source | Features |
|---|---|---|---|
| Subscription | `MySubscription` | Rork `subscriptions` | View active plan, purchase Monthly/Annual via Stripe Checkout |
| Orders | `MyOrders` | Rork `orders` | Order history list |
| Refund | `RequestRefund` | Rork `refund_requests` | Submit refund request form |
| Redeem | `RedeemCode` | Rork `codes` + `subscriptions` | Enter redemption code, conflict validation |
| Settings | `AccountSettings` | Rork `users` | View 7-digit unique ID, masked email, member since date, sign out |

---

## 5. ADMIN DASHBOARD (`/admin`) � 9 Tabs

| Tab | Component | Data Source | Features |
|---|---|---|---|
| Analytics | `AnalyticsOverview` | Rork `site_visits` | Visit charts, device/browser/geo breakdown |
| Users | `UsersTab` | Rork `users` | User list, search, edit |
| Subscriptions | `SubscriptionsTab` | Rork `subscriptions` | Manage all subscriptions |
| Orders | `OrdersTab` | Rork `orders` | View/manage orders |
| Transactions | `TransactionsTab` | Rork `transactions` | Payment history |
| Codes | `CodesTab` | Rork `codes` | Generate/manage redemption codes |
| Refunds | `RefundsTab` | Rork `refund_requests` | Approve/reject refund requests |
| App Data | `AppDataTab` | Rork (various) | Raw data management |
| Settings | `SettingsTab` | Rork | App configuration |

---

## 6. DATABASE � What Lives Where

### 6a. Billing tables (this Supabase project)

**Connection:** `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` via `getBillingDb()`

- `subscriptions` (user_id, user_email, plan, status, stripe_subscription_id, start_date, end_date, queued_plan, queued_start_date)
- `orders` (user_id, type, amount, status, stripe_payment_id)
- `transactions` (user_id, type, amount, status, stripe_id)
- `refund_requests` (user_id, reason, status, stripe_subscription_id, stripe_refund_id)

### 6b. Website tables (same Supabase project)

| Table | Purpose |
|---|---|
| `profiles` | User profiles (mirrors auth) |
| `user_roles` | Admin role assignments |
| `waitlist` | Waitlist signups |
| `content_pages` | CMS content |
| `site_visits` | Analytics |
| `security_events` | Security logs |
| `pricing_plans`, `country_pricing`, `country_access`, `country_feature_flags` | Regional pricing & gating |

---

## 7. AUTHENTICATION � Needs Replacement

### Current Setup
- **User Auth (website):** Supabase Auth (Lovable Cloud) � email/password
- **Billing Auth:** Direct Rork DB lookup (no Supabase Auth dependency)
- **Admin Auth:** Supabase Auth + `user_roles` table check via `is_admin()` function

### Migration Options
1. **AWS Cognito** � Drop-in replacement, supports email/password
2. **Custom JWT** � Roll your own with bcrypt + JWT (more work, full control)
3. **Rork Supabase Auth** � Use Rork project's built-in Supabase Auth (least migration effort)

### Auth-Related Code to Update
- `src/contexts/AuthContext.tsx` � Main auth provider
- `src/contexts/RorkAuthContext.tsx` � Billing portal auth (already independent)
- `src/hooks/useSyncRorkUser.ts` � Syncs Supabase user to Rork `users` table
- `src/hooks/useUniqueId.ts` � Fetches 7-digit anonymous ID
- All edge functions using `verifyUser()` pattern

---

## 8. ENVIRONMENT VARIABLES / SECRETS

| Variable | Used By | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | All stripe-* functions | Currently Test Mode |
| `SUPABASE_URL` | Edge functions + billing | Auto-provided on Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge functions + billing | Auto-provided on Supabase |
| `AWS_SES_ACCESS_KEY_ID` | send-notification-email, send-waitlist-email | AWS SES credentials |
| `AWS_SES_SECRET_ACCESS_KEY` | send-notification-email, send-waitlist-email | AWS SES credentials |
| `AWS_SES_REGION` | Email functions | e.g. `us-east-1` |
| `SUPABASE_URL` | Auto-provided by Lovable | Will be removed |
| `SUPABASE_ANON_KEY` | Auto-provided by Lovable | Will be removed |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-provided by Lovable | Will be removed |

---

## 9. STRIPE CONFIGURATION

| Item | Value |
|---|---|
| Monthly Price ID | `price_1SXuFd7fQuFoYSVZvgZSOTWJ` |
| Annual Price ID | `price_1SXtPK7fQuFoYSVZjaZ6RyV2` |
| Webhook Endpoint | `/functions/v1/stripe-billing-webhook` |
| Webhook Events | `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted` |
| Mode | **TEST** � switch to live keys before production |

---

## 10. WHAT THE DEVELOPER NEEDS TO DO

### Must Do (Port existing code)
1. ? Set up AWS App Runner for React SPA hosting (or S3 + CloudFront)
2. ? Port 16 Deno edge functions to Node.js Lambda functions
3. ? Set up API Gateway to route to Lambda functions
4. ? Replace Supabase Auth with chosen auth solution (Cognito recommended)
5. ? Migrate `user_roles` + `waitlist` + `content_pages` tables to Rork DB
6. ? Update frontend API client to call new Lambda endpoints instead of Supabase functions
7. ? Configure Stripe webhook to point to new endpoint
8. ? Set up environment variables in AWS

### Must NOT Do (Already built)
- ? Do NOT rebuild any React components or pages
- ? Do NOT rewrite subscription conflict logic (8 rules)
- ? Do NOT redesign email templates
- ? Do NOT rebuild admin dashboard
- ? Do NOT create new Stripe products/prices (already configured)
- ? Do NOT touch the Rork database schema

### Optional Improvements
- ? Add CloudWatch monitoring for Lambda functions
- ? Set up CI/CD pipeline (GitHub Actions ? AWS)
- ? Add rate limiting at API Gateway level
- ? Switch Stripe to live mode

---

## 11. FILE STRUCTURE REFERENCE

```
src/
+-- components/
�   +-- admin/          # 9 admin tab components
�   +-- dashboard/      # 5 user dashboard tab components
�   +-- ui/             # 50+ shadcn/ui components (DO NOT MODIFY)
�   +-- Header.tsx      # Site header/nav
�   +-- Footer.tsx      # Site footer
�   +-- Hero.tsx        # Landing hero section
�   +-- Features.tsx    # Features section
�   +-- Pricing.tsx     # Pricing cards
�   +-- Testimonials.tsx
�   +-- Faq.tsx
�   +-- Cta.tsx
+-- contexts/
�   +-- AuthContext.tsx      # NEEDS UPDATE for new auth
�   +-- RorkAuthContext.tsx  # Independent � no changes needed
+-- hooks/
�   +-- useExternalDb.ts     # Generic Rork DB hook
�   +-- useSyncRorkUser.ts   # Sync auth user to Rork
�   +-- useUniqueId.ts       # 7-digit ID lookup
�   +-- useVisitTracker.ts   # Analytics tracking
+-- pages/                   # 20 page components (all complete)
+-- integrations/
    +-- supabase/client.ts   # REPLACE with new API client
    +-- rork/client.ts       # Direct Rork connection (keep)

supabase/functions/          # 16+ edge functions ? PORT TO LAMBDA
```

---

*End of migration document. All code referenced is available in the project repository.*
