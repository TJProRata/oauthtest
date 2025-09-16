# Creator AI Hub - Multi-Platform OAuth Integration

A comprehensive OAuth integration hub for creators to connect their social platforms (Instagram, YouTube, X/Twitter, Shopify, Google Calendar, and Calendly) with secure token management and data caching.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, TypeScript, Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + OAuth 2.0

### Project Structure
```
creator-ai-hub/
├── frontend/              # Next.js application
│   ├── app/              # App router pages
│   ├── components/       # React components
│   └── lib/              # Utilities and helpers
├── backend/              # Node.js backend services
│   ├── src/
│   │   ├── services/     # OAuth providers & token management
│   │   └── utils/        # Helper functions
│   └── supabase/         # Database migrations
└── shared/               # Shared TypeScript types
```

## 🔐 Security Features

### Token Management
- **Encryption**: All OAuth tokens encrypted using Supabase Vault
- **Automatic Refresh**: Platform-specific refresh strategies
  - Instagram: Refresh when < 24 hours remaining
  - YouTube/Google: Refresh when < 15 minutes remaining
  - Twitter: Refresh when < 2 hours remaining
  - Shopify: Permanent tokens (no refresh needed)
  - Calendly: Refresh when < 1 hour remaining

### Database Security
- Row Level Security (RLS) policies
- User isolation (users can only access their own data)
- Audit logging for all token operations
- Encrypted token storage

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- OAuth app credentials for each platform

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd creator-ai-hub
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create `.env.local` in the frontend directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Create `.env` in the backend directory:
```env
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-service-key
PORT=3001

# OAuth Credentials
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret

SHOPIFY_API_KEY=your-shopify-api-key
SHOPIFY_API_SECRET=your-shopify-api-secret

CALENDLY_CLIENT_ID=your-calendly-client-id
CALENDLY_CLIENT_SECRET=your-calendly-client-secret
```

4. Run database migrations:
```bash
# Apply the migrations to your Supabase project
npx supabase db push
```

5. Start the development servers:
```bash
npm run dev
```

This will start:
- Frontend at http://localhost:3000
- Backend at http://localhost:3001

## 📊 Platform Integrations

### Instagram
- **Scopes**: instagram_basic, instagram_content_publish, instagram_manage_comments, instagram_manage_insights
- **Data Access**: Posts, Reels, Stories, Comments, Insights
- **Token Type**: Long-lived (60 days)

### YouTube
- **Scopes**: youtube.readonly, youtube.force-ssl
- **Data Access**: Videos, Channel info, Playlists, Comments
- **Token Type**: Short-lived (1 hour) with refresh token

### X/Twitter
- **Scopes**: tweet.read, users.read, follows.read
- **Data Access**: Tweets, Profile, Followers, Engagement
- **Token Type**: OAuth 2.0 with PKCE

### Shopify
- **Scopes**: read_products, read_orders, read_customers, read_inventory
- **Data Access**: Products, Inventory, Orders, Reviews
- **Token Type**: Permanent access token

### Google Calendar
- **Scopes**: calendar.readonly, calendar.events.readonly
- **Data Access**: Events, Free/Busy, Calendar list
- **Token Type**: Short-lived (1 hour) with refresh token

### Calendly
- **Scopes**: No specific scopes (permission-based)
- **Data Access**: Event types, Bookings, Availability
- **Token Type**: Standard OAuth 2.0

## 🛠️ Development

### Building for Production

```bash
# Build all packages
npm run build

# Build specific package
npm run build:frontend
npm run build:backend
```

### Database Management

The project uses Supabase for database management with:
- Automatic token refresh via pg_cron
- Content caching with TTL
- Rate limiting per platform
- Comprehensive audit logging

### Adding New Platforms

1. Add platform type to `shared/src/types/index.ts`
2. Create provider class in `backend/src/services/oauth/providers/`
3. Add platform configuration to frontend
4. Update database schema if needed

## 📝 API Endpoints

### OAuth Endpoints
- `GET /oauth/:platform/authorize` - Initialize OAuth flow
- `GET /oauth/:platform/callback` - Handle OAuth callback
- `POST /oauth/:platform/refresh` - Manually refresh tokens
- `DELETE /oauth/:platform/revoke` - Disconnect platform

### Data Endpoints
- `GET /api/platforms` - List connected platforms
- `GET /api/platforms/:platform/data` - Fetch platform data
- `POST /api/platforms/:platform/sync` - Trigger data sync

## 🔍 Monitoring

The system includes:
- Token refresh status tracking
- Rate limit monitoring
- Error logging and alerting
- Connection health checks

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.# oauthtest
