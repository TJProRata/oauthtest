'use client'

import { useState } from 'react'
import { Sparkles, LayoutDashboard, Link2, Settings, BarChart3, FileText, Bell, User, LogOut, Plus, CheckCircle2, Clock, AlertCircle, Zap } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PlatformCard } from '@/components/platform/PlatformCard'
import { OAuthPlatform } from '@creator-ai-hub/shared'

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
    ],
    isConnected: true,
    lastSynced: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
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
    ],
    isConnected: false
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
    ],
    isConnected: true,
    lastSynced: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
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
    ],
    isConnected: false
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
    ],
    isConnected: true,
    lastSynced: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
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
    ],
    isConnected: false
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
  const [connections, setConnections] = useState<Record<OAuthPlatform, boolean>>({
    instagram: true,
    youtube: false,
    twitter: true,
    shopify: false,
    google_calendar: true,
    calendly: false
  })

  const handleConnect = async (platform: OAuthPlatform) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    window.location.href = `${apiUrl}/oauth/${platform}/authorize`
  }

  const handleDisconnect = async (platform: OAuthPlatform) => {
    console.log('Disconnecting', platform)
    setConnections(prev => ({ ...prev, [platform]: false }))
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
                {PLATFORMS.map(platform => (
                  <PlatformCard
                    key={platform.id}
                    platform={platform}
                    isConnected={platform.isConnected || false}
                    onConnect={() => handleConnect(platform.id)}
                    onDisconnect={() => handleDisconnect(platform.id)}
                    lastSynced={platform.lastSynced}
                  />
                ))}
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