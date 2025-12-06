# BookFactory AI - Deployment Guide

## ✅ Build Status: SUCCESS

The application has been built and is ready for deployment.

## Quick Deploy to Vercel

### 1. Prerequisites
You need accounts and API keys from:
- **Clerk** (https://dashboard.clerk.com) - Authentication
- **Stripe** (https://dashboard.stripe.com) - Payments
- **Anthropic** (https://console.anthropic.com) - AI
- **PostgreSQL Database** - Use Vercel Postgres, Neon, Supabase, or Railway

### 2. Environment Variables Required

Set these in your Vercel project settings (Settings → Environment Variables):

```
# Database
DATABASE_URL=postgresql://user:pass@host:5432/bookfactory

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_CREATOR_PRICE_ID=price_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxx

# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-xxx

# Application
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Optional: Email (Resend)
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@yourdomain.com
```

### 3. Deploy Steps

**Option A: Deploy from GitHub**
1. Push this repo to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Add environment variables
5. Deploy

**Option B: Deploy with Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel --prod
```

### 4. Post-Deployment

1. **Run Database Migrations**
   ```bash
   npx prisma migrate deploy
   ```

2. **Configure Stripe Webhook**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

3. **Create Stripe Products/Prices**
   - Create 3 subscription products in Stripe
   - Copy price IDs to environment variables

4. **Configure Clerk**
   - Add your domain to Clerk allowed origins
   - Set redirect URLs in Clerk dashboard

## Features Included

### Pages (17 total)
- Dashboard with stats and quick actions
- Books management (list, create, edit)
- Writing editor with AI assistant
- Series management with characters/timeline
- Cover design wizard
- Publishing wizard
- Marketing campaigns
- Analytics dashboard
- Collaboration tools
- Financial tracking
- Settings page
- Help center
- Onboarding flow

### API Routes (21 total)
- Books CRUD
- Chapters CRUD
- AI generation & analysis
- Export (EPUB, DOCX, HTML, Markdown, PDF)
- File uploads (covers, manuscripts)
- Billing (checkout, portal)
- Stripe webhooks
- Series management
- Collaborators
- Analytics
- Marketing campaigns

### Integrations
- Clerk Authentication
- Stripe Payments (subscriptions)
- Anthropic Claude AI
- File uploads (local/S3)
- Email notifications (Resend)

## Support

For issues or questions, create an issue on GitHub.
