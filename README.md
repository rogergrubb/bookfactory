# 📚 BookFactory AI

A complete AI-powered book creation platform for indie authors. Write, edit, collaborate, and publish—all in one place.

![BookFactory AI](https://via.placeholder.com/800x400/7c3aed/ffffff?text=BookFactory+AI)

## ✨ Features

- **🖊️ Distraction-Free Writing** - Focus mode, auto-save, beautiful editor
- **🤖 AI Writing Assistant** - Powered by Claude for continuations, dialogue, descriptions
- **📖 Multi-Format Export** - EPUB, PDF, DOCX, Markdown, HTML
- **👥 Collaboration** - Invite beta readers and editors, track feedback
- **📊 Sales Analytics** - Track sales across publishing platforms
- **🚀 Direct Publishing** - Publish to Amazon KDP, Apple Books, and more
- **🎨 Cover Design** - Built-in cover designer with AI generation
- **📚 Series Management** - Manage book series with shared characters and settings

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Payments**: Stripe
- **AI**: Anthropic Claude
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Email**: Resend
- **Storage**: AWS S3 / Cloudflare R2

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- Clerk account
- Stripe account
- Anthropic API key
- (Optional) AWS S3 or Cloudflare R2 for file storage

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/bookfactory-ai.git
cd bookfactory-ai
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Database (Neon, Supabase, or local PostgreSQL)
DATABASE_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Anthropic AI
ANTHROPIC_API_KEY="sk-ant-..."

# Stripe Payments
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed with demo data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Clerk Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Copy the API keys to `.env.local`
4. Configure redirect URLs in Clerk settings

### Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Copy API keys to `.env.local`
3. Create products/prices for each plan:
   - Creator ($19/month)
   - Professional ($49/month)
   - Enterprise ($199/month)
4. Add price IDs to `.env.local`
5. Set up webhook endpoint: `/api/webhooks/stripe`

### Database Setup

**Option 1: Neon (Recommended for Serverless)**
1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy connection string to `DATABASE_URL`

**Option 2: Supabase**
1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy connection string to `DATABASE_URL`

**Option 3: Local PostgreSQL**
```bash
# Create database
createdb bookfactory

# Update DATABASE_URL
DATABASE_URL="postgresql://postgres:password@localhost:5432/bookfactory"
```

## 📁 Project Structure

```
bookfactory-ai/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Demo data seeder
├── src/
│   ├── app/
│   │   ├── (auth)/        # Sign in/up pages
│   │   ├── (dashboard)/   # Main app pages
│   │   ├── api/           # API routes
│   │   └── page.tsx       # Landing page
│   ├── components/
│   │   ├── editor/        # Writing editor
│   │   ├── ui/            # UI components
│   │   └── ...
│   ├── hooks/             # React hooks
│   ├── lib/               # Utilities & services
│   │   ├── ai.ts          # AI service
│   │   ├── db.ts          # Database utilities
│   │   ├── email.ts       # Email service
│   │   ├── export.ts      # Export service
│   │   ├── stripe.ts      # Payment service
│   │   └── upload.ts      # File upload service
│   └── test/              # Test setup
├── .env.example           # Environment template
├── vercel.json            # Vercel config
└── vitest.config.ts       # Test config
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

Or use the CLI:

```bash
npm i -g vercel
vercel
```

### Environment Variables for Production

Add these in Vercel Dashboard > Settings > Environment Variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `ANTHROPIC_API_KEY` | Claude API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `NEXT_PUBLIC_APP_URL` | Your production URL |
| `CRON_SECRET` | Secret for cron jobs |

## 📊 API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/books` | GET, POST | List/create books |
| `/api/books/[id]` | GET, PATCH, DELETE | Single book operations |
| `/api/chapters` | GET, POST | List/create chapters |
| `/api/chapters/[id]` | GET, PATCH, DELETE | Single chapter operations |
| `/api/ai/generate` | POST | AI content generation |
| `/api/ai/analyze` | POST | AI content analysis |
| `/api/export` | POST, GET | Export book to format |
| `/api/upload` | GET, POST | File upload |
| `/api/billing/checkout` | POST | Create checkout session |
| `/api/webhooks/stripe` | POST | Stripe webhooks |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- [Anthropic](https://anthropic.com) for Claude AI
- [Clerk](https://clerk.com) for authentication
- [Stripe](https://stripe.com) for payments
- [Vercel](https://vercel.com) for hosting

---

Built with ❤️ for indie authors everywhere.
