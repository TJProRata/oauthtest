import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Creator AI Hub Backend is running!' })
})

// OAuth routes placeholder
app.get('/oauth/:platform/authorize', (req, res) => {
  const { platform } = req.params
  res.json({
    message: `OAuth authorization for ${platform} - Implementation coming soon!`,
    platform,
    redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`
  })
})

app.get('/oauth/:platform/callback', (req, res) => {
  const { platform } = req.params
  const { code, state } = req.query

  res.json({
    message: `OAuth callback for ${platform}`,
    platform,
    code,
    state,
    status: 'success'
  })
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Creator AI Hub Backend running on http://localhost:${PORT}`)
  console.log(`📚 API docs available at http://localhost:${PORT}/api/platforms`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
})