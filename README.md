# AD Finder

A comprehensive SaaS platform that helps new and emerging brands discover the best advertising opportunities across the web. Built with Next.js, Express.js, PostgreSQL, and Stripe.

## Features

- **Smart Discovery**: AI-powered search across 50+ ad platforms
- **Multi-Platform Support**: Facebook, Instagram, TikTok, Google, YouTube, LinkedIn, Podcasts, Newsletters, and more
- **Budget Optimization**: Get the most reach for your money with AI-powered recommendations
- **Campaign Management**: Create and manage campaigns across multiple platforms
- **Performance Analytics**: Track CTR, conversions, and ROI in real-time
- **Direct Booking**: Book ad placements directly through the platform (5% commission)
- **Subscription Plans**: Starter ($49/mo), Growth ($149/mo), Scale ($399/mo)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Express.js, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Auth | NextAuth.js |
| Payments | Stripe |
| Scraping | Puppeteer, Playwright, Cheerio |
| Job Queue | BullMQ + Redis |
| Deployment | Vercel (frontend) + Railway (API, DB) |

## Project Structure

```
ad-finder/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/                # App router pages
│   │   ├── components/         # React components
│   │   ├── lib/                # Utilities and API client
│   │   └── hooks/              # Custom React hooks
│   │
│   └── api/                    # Express.js backend
│       ├── src/
│       │   ├── routes/         # API routes
│       │   ├── services/       # Business logic
│       │   ├── middleware/     # Auth, error handling
│       │   ├── jobs/           # Background jobs
│       │   └── scrapers/       # Platform scrapers
│       └── prisma/             # Database schema
│
├── packages/
│   └── shared/                 # Shared types and utilities
│
├── docker-compose.yml          # Local development setup
└── turbo.json                  # Turborepo configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 16+
- Redis 7+
- Stripe account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ad-finder.git
cd ad-finder
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your values
```

4. Start the database:
```bash
docker-compose up -d postgres redis
```

5. Run database migrations:
```bash
cd apps/api
npx prisma db push
npx prisma generate
```

6. Seed the database with platforms:
```bash
npm run db:seed
```

7. Start the development servers:
```bash
npm run dev
```

The frontend will be available at http://localhost:3000 and the API at http://localhost:4000.

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-id
GITHUB_SECRET=your-github-secret
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/adfinder
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_GROWTH_PRICE_ID=price_...
STRIPE_SCALE_PRICE_ID=price_...
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Users & Brands
- `GET /api/users/me` - Get current user
- `PATCH /api/users/me` - Update user
- `GET /api/users/me/brand` - Get user's brand
- `POST /api/users/me/brand` - Create brand
- `PATCH /api/users/me/brand` - Update brand

### Subscriptions
- `GET /api/subscriptions/plans` - Get available plans
- `GET /api/subscriptions/current` - Get current subscription
- `POST /api/subscriptions/create-checkout` - Create Stripe checkout
- `POST /api/subscriptions/create-portal` - Create billing portal

### Opportunities
- `GET /api/opportunities` - List opportunities (with filters)
- `GET /api/opportunities/:id` - Get single opportunity
- `GET /api/opportunities/platforms/list` - Get all platforms
- `GET /api/opportunities/trending/list` - Get trending opportunities

### Searches
- `POST /api/searches` - Create new search
- `GET /api/searches` - List user's searches
- `GET /api/searches/:id` - Get search details
- `GET /api/searches/:id/results` - Get search results

### Campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns` - List campaigns
- `GET /api/campaigns/:id` - Get campaign
- `PATCH /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `GET /api/campaigns/:id/analytics` - Get campaign analytics

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List bookings
- `GET /api/bookings/:id` - Get booking
- `PATCH /api/bookings/:id/status` - Update booking status

### Analytics
- `GET /api/analytics/overview` - Get overview stats
- `GET /api/analytics/platforms` - Get platform breakdown
- `GET /api/analytics/daily` - Get daily metrics
- `GET /api/analytics/export` - Export analytics

## Supported Platforms

### Social Media
- Facebook Ads
- Instagram Ads
- TikTok Ads
- LinkedIn Ads
- Twitter/X Ads
- Pinterest Ads
- Snapchat Ads
- Reddit Ads

### Search & Display
- Google Ads
- YouTube Ads
- Taboola
- Outbrain

### Audio & Content
- Podcast Networks (Podcorn, AdvertiseCast)
- Newsletter Sponsorships (Swapstack, Paved)

### Influencer
- Creator Marketplaces
- Influencer Platforms

## Deployment

### Frontend (Vercel)
```bash
vercel --prod
```

### Backend (Railway)
```bash
railway up
```

## License

MIT License - see LICENSE for details.

## Support

For support, email support@adfinder.com or open an issue on GitHub.
