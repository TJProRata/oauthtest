import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import https from 'https'
import http from 'http'
import fs from 'fs'

// Load environment variables FIRST - handle both root and backend directory execution
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// Now import modules that need environment variables
import { supabase } from './lib/supabase'
import { InstagramProvider } from './services/oauth/providers/instagram-provider'
import { GoogleProvider } from './services/oauth/providers/google-provider'
import { TwitterProvider } from './services/oauth/providers/twitter-provider'
import { ShopifyProvider } from './services/oauth/providers/shopify-provider'
import { CalendlyProvider } from './services/oauth/providers/calendly-provider'
import { PLATFORM_CONFIGS } from '@creator-ai-hub/shared'

const app = express()
const HTTP_PORT = process.env.HTTP_PORT || 3001
const HTTPS_PORT = process.env.HTTPS_PORT || 3443
const USE_DUAL_PROTOCOL = process.env.DUAL_PROTOCOL === 'true' || true // Enable by default
const USE_HTTPS = process.env.USE_HTTPS === 'true'

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Creator AI Hub Backend is running!' })
})

// Initialize OAuth providers
const getOAuthProvider = (platform: string, shop?: string) => {
  const config = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS]
  if (!config) {
    throw new Error(`Unsupported platform: ${platform}`)
  }

  // Handle Google services (YouTube and Google Calendar use same credentials)
  let envPrefix: string
  if (platform === 'youtube' || platform === 'google_calendar') {
    envPrefix = 'GOOGLE'
  } else if (platform === 'shopify') {
    envPrefix = 'SHOPIFY_API'
  } else {
    envPrefix = platform.toUpperCase()
  }

  const clientId = process.env[`${envPrefix}${platform === 'shopify' ? '_KEY' : '_CLIENT_ID'}`]
  const clientSecret = process.env[`${envPrefix}${platform === 'shopify' ? '_SECRET' : '_CLIENT_SECRET'}`]

  if (!clientId || !clientSecret) {
    throw new Error(`Missing OAuth credentials for ${platform}. Please set ${envPrefix}_CLIENT_ID and ${envPrefix}_CLIENT_SECRET environment variables.`)
  }

  // Determine protocol and port based on platform requirements
  const getRedirectUri = (platform: string) => {
    if (process.env.BACKEND_URL) {
      return `${process.env.BACKEND_URL}/oauth/${platform}/callback`
    }

    // Instagram requires HTTPS, others can use HTTP
    if (platform === 'instagram') {
      return `https://localhost:${HTTPS_PORT}/oauth/${platform}/callback`
    } else {
      return `http://localhost:${HTTP_PORT}/oauth/${platform}/callback`
    }
  }

  const oauthConfig = {
    ...config,
    clientId,
    clientSecret,
    redirectUri: getRedirectUri(platform),
    scopes: config.scopes || []
  }

  // Add Google-specific OAuth parameters
  if (platform === 'youtube' || platform === 'google_calendar') {
    oauthConfig.additionalParams = {
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true'
    }
  }

  switch (platform) {
    case 'instagram':
      return new InstagramProvider(oauthConfig)
    case 'youtube':
    case 'google_calendar':
      return new GoogleProvider(platform as 'youtube' | 'google_calendar', oauthConfig)
    case 'twitter':
      return new TwitterProvider(oauthConfig)
    case 'shopify':
      if (!shop) {
        throw new Error('Shop parameter is required for Shopify OAuth')
      }
      return new ShopifyProvider(shop, oauthConfig)
    case 'calendly':
      return new CalendlyProvider(oauthConfig)
    default:
      throw new Error(`OAuth provider not implemented for ${platform}`)
  }
}

// OAuth Authorization Route
app.get('/oauth/:platform/authorize', async (req, res) => {
  try {
    const { platform } = req.params
    const { user_id, shop } = req.query

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Shopify requires shop parameter
    if (platform === 'shopify' && !shop) {
      return res.status(400).json({ error: 'Shop parameter is required for Shopify OAuth' })
    }

    const provider = getOAuthProvider(platform, shop as string | undefined)
    const authUrl = provider.getAuthorizationUrl(user_id as string)

    res.redirect(authUrl)
  } catch (error: any) {
    console.error('OAuth authorization error:', error)
    res.status(500).json({ error: error.message })
  }
})

// OAuth Callback Route
app.get('/oauth/:platform/callback', async (req, res) => {
  try {
    const { platform } = req.params
    const { code, state, error: oauthError } = req.query

    if (oauthError) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=${oauthError}`)
    }

    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=missing_code_or_state`)
    }

    // For Shopify, extract shop from query params
    const { shop } = req.query
    const provider = getOAuthProvider(platform, shop as string | undefined)
    const tokenSet = await provider.exchangeCodeForToken(code as string)
    const userProfile = await provider.getUserProfile(tokenSet.accessToken)

    // Save connection to Supabase
    const { data, error } = await supabase
      .from('platform_connections')
      .upsert({
        user_id: state as string,
        platform: platform as any,
        platform_user_id: userProfile.id,
        platform_username: userProfile.username,
        platform_email: userProfile.email,
        access_token: tokenSet.accessToken,
        refresh_token: tokenSet.refreshToken,
        token_expires_at: tokenSet.expiresIn ?
          new Date(Date.now() + tokenSet.expiresIn * 1000).toISOString() : null,
        token_status: 'active',
        scopes: provider.config.scopes,
        metadata: userProfile,
        connected_at: new Date().toISOString(),
        last_refresh_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=database_error`)
    }

    res.redirect(`${process.env.FRONTEND_URL}/dashboard?connected=${platform}`)
  } catch (error: any) {
    console.error('OAuth callback error:', error)
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=oauth_failed`)
  }
})

// Get user's connections
app.get('/api/connections', async (req, res) => {
  try {
    const { user_id } = req.query

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const { data, error } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('user_id', user_id)

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }

    res.json({ success: true, data })
  } catch (error: any) {
    console.error('Get connections error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Delete a connection
app.delete('/api/connections/:platform', async (req, res) => {
  try {
    const { platform } = req.params
    const { user_id } = req.body

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const { error } = await supabase
      .from('platform_connections')
      .delete()
      .eq('user_id', user_id)
      .eq('platform', platform)

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }

    res.json({ success: true, message: `${platform} disconnected successfully` })
  } catch (error: any) {
    console.error('Delete connection error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Refresh token for a connection
app.post('/api/connections/:platform/refresh', async (req, res) => {
  try {
    const { platform } = req.params
    const { user_id } = req.body

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Get the connection from database
    const { data: connection, error: fetchError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('user_id', user_id)
      .eq('platform', platform)
      .single()

    if (fetchError || !connection) {
      return res.status(404).json({ error: 'Connection not found' })
    }

    if (!connection.refresh_token) {
      return res.status(400).json({ error: 'No refresh token available' })
    }

    // Get the provider and refresh the token
    const provider = getOAuthProvider(platform)
    const newTokens = await provider.refreshAccessToken(connection.refresh_token)

    // Update the connection in database
    const { error: updateError } = await supabase
      .from('platform_connections')
      .update({
        access_token: newTokens.accessToken,
        refresh_token: newTokens.refreshToken || connection.refresh_token,
        token_expires_at: newTokens.expiresIn ?
          new Date(Date.now() + newTokens.expiresIn * 1000).toISOString() : null,
        last_refresh_at: new Date().toISOString()
      })
      .eq('user_id', user_id)
      .eq('platform', platform)

    if (updateError) {
      console.error('Database update error:', updateError)
      return res.status(500).json({ error: updateError.message })
    }

    res.json({ success: true, message: 'Token refreshed successfully' })
  } catch (error: any) {
    console.error('Token refresh error:', error)
    res.status(500).json({ error: error.message })
  }
})

// API routes placeholder
app.get('/api/platforms', (req, res) => {
  res.json({
    success: true,
    data: {
      platforms: [
        {
          id: 'instagram',
          name: 'Instagram',
          status: 'available',
          connected: false
        },
        {
          id: 'youtube',
          name: 'YouTube',
          status: 'available',
          connected: false
        },
        {
          id: 'twitter',
          name: 'X / Twitter',
          status: 'available',
          connected: false
        },
        {
          id: 'shopify',
          name: 'Shopify',
          status: 'available',
          connected: false
        },
        {
          id: 'google_calendar',
          name: 'Google Calendar',
          status: 'available',
          connected: false
        },
        {
          id: 'calendly',
          name: 'Calendly',
          status: 'available',
          connected: false
        }
      ]
    }
  })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// Server startup logic
if (USE_DUAL_PROTOCOL) {
  // Start both HTTP and HTTPS servers for maximum compatibility

  // HTTP Server (for YouTube, Twitter, Shopify, Calendly, Google Calendar)
  app.listen(HTTP_PORT, () => {
    console.log(`🌐 HTTP Server running on http://localhost:${HTTP_PORT}`)
    console.log(`📚 API docs: http://localhost:${HTTP_PORT}/api/platforms`)
    console.log(`🔗 Health check: http://localhost:${HTTP_PORT}/health`)
  })

  // HTTPS Server (for Instagram OAuth)
  const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, '../ssl/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../ssl/cert.pem'))
  }

  https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
    console.log(`🔒 HTTPS Server running on https://localhost:${HTTPS_PORT}`)
    console.log(`📚 API docs: https://localhost:${HTTPS_PORT}/api/platforms`)
    console.log(`🔗 Health check: https://localhost:${HTTPS_PORT}/health`)
    console.log(`📱 Instagram OAuth: https://localhost:${HTTPS_PORT}/oauth/instagram/callback`)
  })

  console.log(`\n🎯 OAuth Configuration:`)
  console.log(`   • YouTube: http://localhost:${HTTP_PORT}/oauth/youtube/callback`)
  console.log(`   • Instagram: https://localhost:${HTTPS_PORT}/oauth/instagram/callback`)
  console.log(`   • Twitter: http://localhost:${HTTP_PORT}/oauth/twitter/callback`)
  console.log(`   • Shopify: http://localhost:${HTTP_PORT}/oauth/shopify/callback`)
  console.log(`   • Google Calendar: http://localhost:${HTTP_PORT}/oauth/google_calendar/callback`)
  console.log(`   • Calendly: http://localhost:${HTTP_PORT}/oauth/calendly/callback`)

} else if (USE_HTTPS) {
  // Legacy HTTPS-only mode
  const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, '../ssl/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../ssl/cert.pem'))
  }

  https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
    console.log(`🚀 Creator AI Hub Backend running on https://localhost:${HTTPS_PORT}`)
    console.log(`📚 API docs available at https://localhost:${HTTPS_PORT}/api/platforms`)
    console.log(`🔗 Health check: https://localhost:${HTTPS_PORT}/health`)
    console.log(`🔒 HTTPS enabled for Instagram OAuth compatibility`)
  })
} else {
  // HTTP-only mode
  app.listen(HTTP_PORT, () => {
    console.log(`🚀 Creator AI Hub Backend running on http://localhost:${HTTP_PORT}`)
    console.log(`📚 API docs available at http://localhost:${HTTP_PORT}/api/platforms`)
    console.log(`🔗 Health check: http://localhost:${HTTP_PORT}/health`)
    console.log(`💡 Set USE_HTTPS=true for Instagram OAuth testing`)
  })
}