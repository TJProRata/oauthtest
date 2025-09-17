'use client'

import { useState, useEffect } from 'react'
import { Sparkles, LayoutDashboard, Link2, Settings, BarChart3, FileText, Bell, User, LogOut, Plus, CheckCircle2, Clock, AlertCircle, Zap } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PlatformCard } from '@/components/platform/PlatformCard'
import { OAuthPlatform } from '@creator-ai-hub/shared'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

const PLATFORMS: {
  id: OAuthPlatform;
  name: string;
  icon: string;
  color: string;
  description: string;
  capabilities: string[];
  isConnected?: boolean;
  lastSynced?: Date;
}[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'IG',
    color: 'from-purple-600 to-pink-600',
    description: 'Connect your Instagram Business or Creator account',
    capabilities: [
      'Posts, Reels & Stories',
      'Comments & Direct Messages',
      'Analytics & Insights',
      'Audience Demographics'
    ]
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'YT',
    color: 'from-red-600 to-red-700',
    description: 'Access your YouTube channel and videos',
    capabilities: [
      'Videos & Transcripts',
      'Channel Statistics',
      'Comments & Community',
      'Playlists & Analytics'
    ]
  },
  {
    id: 'twitter',
    name: 'X / Twitter',
    icon: 'X',
    color: 'from-black to-gray-800',
    description: 'Connect your X (Twitter) account',
    capabilities: [
      'Tweets & Threads',
      'Profile & Followers',
      'Engagement Metrics',
      'Trending Topics'
    ]
  },
  {
    id: 'shopify',
    name: 'Shopify',
    icon: 'SH',
    color: 'from-green-600 to-green-700',
    description: 'Integrate your Shopify store',
    capabilities: [
      'Product Catalog',
      'Real-time Inventory',
      'Order History',
      'Customer Reviews'
    ]
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    icon: 'GC',
    color: 'from-blue-600 to-blue-700',
    description: 'Sync your Google Calendar events',
    capabilities: [
      'Events & Schedule',
      'Free/Busy Status',
      'Event Details',
      'Multiple Calendars'
    ]
  },
  {
    id: 'calendly',
    name: 'Calendly',
    icon: 'CL',
    color: 'from-blue-500 to-indigo-600',
    description: 'Connect your Calendly scheduling',
    capabilities: [
      'Booking Links',
      'Available Slots',
      'Appointment Details',
      'Event Types'
    ]
  }
]

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: true },
  { icon: Link2, label: 'Connections', href: '/dashboard/connections' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: FileText, label: 'API Docs', href: '/dashboard/api' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [connections, setConnections] = useState<Record<OAuthPlatform, any>>({
    instagram: null,
    youtube: null,
    twitter: null,
    shopify: null,
    google_calendar: null,
    calendly: null
  })
  const [loading, setLoading] = useState(true)

  // Get authenticated user on mount and load connections
  useEffect(() => {
    const supabase = createClient()

    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Load connections for this user
      loadConnections(user.id)
    })

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      } else if (session?.user) {
        setUser(session.user)
        loadConnections(session.user.id)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  // Load connections from API
  const loadConnections = async (userId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/connections?user_id=${userId}`)
      const result = await response.json()

      if (result.success && result.data) {
        // Create a map of platform to connection data
        const connectionsMap: Record<string, any> = {}
        result.data.forEach((conn: any) => {
          connectionsMap[conn.platform] = conn
        })

        // Update connections state with real data
        setConnections({
          instagram: connectionsMap.instagram || null,
          youtube: connectionsMap.youtube || null,
          twitter: connectionsMap.twitter || null,
          shopify: connectionsMap.shopify || null,
          google_calendar: connectionsMap.google_calendar || null,
          calendly: connectionsMap.calendly || null
        })
      }
    } catch (error) {
      console.error('Failed to load connections:', error)
    } finally {
      setLoading(false)
    }
  }

  // Check for OAuth callback parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const connected = params.get('connected')
    const error = params.get('error')

    if (connected) {
      // Show success message and reload connections
      console.log(`Successfully connected ${connected}`)
      if (user) {
        loadConnections(user.id)
      }
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard')
    } else if (error) {
      // Show error message
      console.error(`OAuth error: ${error}`)
      alert(`Failed to connect: ${error}`)
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [user])

  const handleConnect = async (platform: OAuthPlatform) => {
    if (!user) {
      alert('Please log in first')
      return
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

    // Special handling for Shopify - needs shop parameter
    if (platform === 'shopify') {
      const shop = prompt('Enter your Shopify shop domain (e.g., my-store):')
      if (!shop) return
      window.location.href = `${apiUrl}/oauth/${platform}/authorize?user_id=${user.id}&shop=${shop}`
    } else {
      window.location.href = `${apiUrl}/oauth/${platform}/authorize?user_id=${user.id}`
    }
  }

  const handleDisconnect = async (platform: OAuthPlatform) => {
    if (!user) {
      alert('Please log in first')
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/connections/${platform}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: user.id })
      })

      const result = await response.json()
      if (result.success) {
        // Update local state to remove the connection
        setConnections(prev => ({ ...prev, [platform]: null }))
        console.log(`Successfully disconnected ${platform}`)
      } else {
        alert(`Failed to disconnect ${platform}: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to disconnect:', error)
      alert(`Failed to disconnect ${platform}`)
    }
  }

  const connectedCount = Object.values(connections).filter(Boolean).length
  const totalPlatforms = Object.keys(connections).length

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r bg-muted/30">
          <div className="flex h-16 items-center px-6 border-b">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Creator AI Hub</span>
            </div>
          </div>

          <div className="space-y-1 p-4">
            {SIDEBAR_ITEMS.map((item) => (
              <Button
                key={item.label}
                variant={item.active ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <a href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </a>
              </Button>
            ))}
          </div>

          <Separator className="mx-4" />

          <div className="p-4">
            <div className="rounded-lg bg-primary/10 p-4">
              <h4 className="font-medium text-sm mb-2">Quick Connect</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Add a new platform integration
              </p>
              <Button size="sm" className="w-full">
                <Plus className="mr-2 h-3 w-3" />
                Add Platform
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="h-16 border-b bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-6">
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Manage your platform connections and AI assistant
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Connected Platforms</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{connectedCount}</div>
                  <p className="text-xs text-muted-foreground">
                    out of {totalPlatforms} available
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">
                    active data feeds
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Interactions</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">
                    this month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Token Health</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Badge variant="secondary" className="text-green-600">Healthy</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    all tokens valid
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Platform Connections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Platform Connections</h2>
                  <p className="text-sm text-muted-foreground">
                    Connect and manage your social media and business platforms
                  </p>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Platform
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {PLATFORMS.map(platform => {
                  const connection = connections[platform.id]
                  const isConnected = !!connection
                  const lastSynced = connection?.last_refresh_at ? new Date(connection.last_refresh_at) : undefined

                  return (
                    <PlatformCard
                      key={platform.id}
                      platform={platform}
                      isConnected={isConnected}
                      onConnect={() => handleConnect(platform.id)}
                      onDisconnect={() => handleDisconnect(platform.id)}
                      lastSynced={lastSynced}
                    />
                  )
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates from your connected platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
                      <span className="text-white font-bold text-xs">IG</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Instagram data synced</p>
                      <p className="text-xs text-muted-foreground">30 minutes ago</p>
                    </div>
                    <Badge variant="secondary">Success</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                      <span className="text-white font-bold text-xs">GC</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Calendar events updated</p>
                      <p className="text-xs text-muted-foreground">15 minutes ago</p>
                    </div>
                    <Badge variant="secondary">Success</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
                      <span className="text-white font-bold text-xs">X</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Twitter data refreshed</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                    <Badge variant="secondary">Success</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}