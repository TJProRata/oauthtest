# OAuth Development Guide

## Overview

This guide covers OAuth configuration for Instagram, YouTube, Twitter, Shopify, Google Calendar, and Calendly integration.

## Development Environment Setup

### Current Configuration
- **Frontend**: http://localhost:3000 (Next.js)
- **Backend**: http://localhost:3001 (Express + TypeScript)
- **HTTPS Mode**: Available via `USE_HTTPS=true` environment variable

### HTTPS Configuration for Instagram OAuth

Instagram OAuth requires HTTPS redirect URIs, even for localhost development. This project supports both HTTP and HTTPS modes:

#### HTTP Mode (Default)
```bash
npm run dev
# Backend runs on http://localhost:3001
# Frontend runs on http://localhost:3000
```

#### HTTPS Mode (Required for Instagram OAuth)
```bash
USE_HTTPS=true npm run dev:backend
# Backend runs on https://localhost:3001
# SSL certificates located in backend/ssl/
```

## Instagram OAuth Configuration

### Prerequisites
1. Meta Developer Console account
2. Instagram Business or Creator account
3. HTTPS-enabled backend server

### Setup Steps

#### 1. Meta Developer Console Configuration
1. Go to [Meta Developer Console](https://developers.facebook.com/apps/)
2. Navigate to your app → Products → Instagram → Basic Display
3. Click "Instagram Login" in the left sidebar
4. Complete "API setup with Instagram business login" sections:

   **Section 1: Generate access tokens**
   - Click "Add account" to link Instagram Business account

   **Section 2: Configure webhooks** (Optional)
   - Leave blank for basic OAuth functionality

   **Section 3: Set up Instagram business login** ⚠️ **CRITICAL**
   - **Redirect URI**: `https://localhost:3001/oauth/instagram/callback`
   - Must use HTTPS for localhost development
   - Click "Business login settings" to configure

#### 2. Environment Variables
```env
# Instagram OAuth
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret

# Backend configuration for Instagram OAuth
USE_HTTPS=true
BACKEND_URL=https://localhost:3001
```

### Testing Instagram OAuth

1. **Start HTTPS backend**:
   ```bash
   cd backend
   USE_HTTPS=true npm run dev
   ```

2. **Navigate to OAuth URL**:
   ```
   https://localhost:3001/oauth/instagram/authorize?user_id=test_user_123
   ```

3. **Expected Flow**:
   - Redirects to Instagram authorization page
   - User grants permissions
   - Instagram redirects to: `https://localhost:3001/oauth/instagram/callback`
   - Backend exchanges code for access token
   - User redirected to frontend dashboard with success message

### Common Issues

#### "Invalid redirect_uri" Error
- **Cause**: Using HTTP instead of HTTPS for Instagram OAuth
- **Solution**: Ensure `USE_HTTPS=true` and configure `https://localhost:3001/oauth/instagram/callback` in Meta Console

#### "EADDRINUSE: port already in use"
- **Cause**: Multiple processes trying to use the same port
- **Solution**: 
  ```bash
  lsof -ti:3001 | xargs kill -9
  npm run dev
  ```

#### SSL Certificate Warnings
- **Cause**: Self-signed certificates for localhost
- **Solution**: Click "Advanced" → "Proceed to localhost" in browser

## Other Platform Configurations

### YouTube OAuth (Google)
- **Redirect URI**: `http://localhost:3001/oauth/youtube/callback` (HTTP OK)
- **Required Scopes**: userinfo.profile, userinfo.email, openid
- **Setup**: Google Cloud Console → APIs & Services → Credentials

### Twitter OAuth 2.0
- **Redirect URI**: `http://localhost:3001/oauth/twitter/callback` (HTTP OK)
- **PKCE**: Enabled by default
- **Setup**: Twitter Developer Portal

### Shopify OAuth
- **Redirect URI**: `http://localhost:3001/oauth/shopify/callback` (HTTP OK)
- **Shop Parameter**: Required in authorization URL
- **Setup**: Shopify Partners Dashboard

### Google Calendar OAuth
- **Redirect URI**: `http://localhost:3001/oauth/google_calendar/callback` (HTTP OK)
- **Uses**: Same Google credentials as YouTube
- **Setup**: Google Cloud Console

### Calendly OAuth
- **Redirect URI**: `http://localhost:3001/oauth/calendly/callback` (HTTP OK)
- **Setup**: Calendly Developer Portal

## Development Workflow

### Standard Development (HTTP)
```bash
npm run dev
# Both frontend and backend start
# All OAuth except Instagram works
```

### Instagram OAuth Testing (HTTPS)
```bash
# Terminal 1: Frontend
cd frontend && npm run dev

# Terminal 2: Backend (HTTPS mode)
cd backend && USE_HTTPS=true npm run dev
```

### Production Deployment
- Set `USE_HTTPS=true` in production environment
- Update redirect URIs to production HTTPS URLs
- Ensure SSL certificates are properly configured

## Security Considerations

1. **Environment Variables**: Never commit actual OAuth credentials
2. **HTTPS in Production**: Always use HTTPS for OAuth callbacks in production
3. **State Parameter**: Used for CSRF protection in OAuth flow
4. **Token Storage**: Access tokens stored securely in Supabase
5. **Refresh Tokens**: Implement proper token refresh logic

## Troubleshooting

### Debug OAuth Flow
1. Check browser network tab for redirect URLs
2. Verify environment variables are loaded
3. Check backend logs for OAuth provider errors
4. Confirm redirect URI matches exactly in provider console

### Reset OAuth Connection
```bash
# Delete connection from dashboard or API call
DELETE /api/connections/instagram
# Re-authorize through OAuth flow
```

## File Structure
```
backend/
├── ssl/                          # HTTPS certificates
│   ├── cert.pem                 # SSL certificate
│   └── key.pem                  # SSL private key
├── src/
│   ├── services/oauth/
│   │   ├── base-provider.ts     # OAuth base class
│   │   └── providers/           # Platform-specific providers
│   │       ├── instagram-provider.ts
│   │       ├── google-provider.ts
│   │       └── ...
│   └── index.ts                 # HTTP/HTTPS server logic
└── package.json

frontend/
├── app/
│   └── dashboard/               # OAuth connection management
└── components/
    └── platform/                # Platform connection cards
```