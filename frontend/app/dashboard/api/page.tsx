'use client'

import { useState } from 'react'
import { Sparkles, LayoutDashboard, Link2, Settings, BarChart3, FileText, Bell, User, LogOut, Plus, CheckCircle2, Clock, AlertCircle, Zap, Code, Database, Server, Activity, Copy, ExternalLink } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Link2, label: 'Connections', href: '/dashboard/connections' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: FileText, label: 'API Docs', href: '/dashboard/api', active: true },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

const API_ENDPOINTS = [
  {
    method: 'GET',
    endpoint: '/api/platforms',
    description: 'List all connected platforms',
    rateLimit: '100/hour',
    status: 'Healthy'
  },
  {
    method: 'GET',
    endpoint: '/api/platforms/{platform}/data',
    description: 'Fetch platform-specific data',
    rateLimit: '50/hour',
    status: 'Healthy'
  },
  {
    method: 'POST',
    endpoint: '/api/platforms/{platform}/sync',
    description: 'Trigger manual data synchronization',
    rateLimit: '10/hour',
    status: 'Healthy'
  },
  {
    method: 'DELETE',
    endpoint: '/api/platforms/{platform}/disconnect',
    description: 'Disconnect a platform',
    rateLimit: '5/hour',
    status: 'Healthy'
  }
]

const PLATFORM_DATA = [
  {
    platform: 'Instagram',
    icon: 'IG',
    color: 'from-purple-600 to-pink-600',
    status: 'Connected',
    lastSync: '30 minutes ago',
    dataTypes: ['Posts', 'Stories', 'Insights', 'Comments'],
    rateLimit: '200/hour remaining'
  },
  {
    platform: 'Google Calendar',
    icon: 'GC',
    color: 'from-blue-600 to-blue-700',
    status: 'Connected',
    lastSync: '15 minutes ago',
    dataTypes: ['Events', 'Calendars', 'Free/Busy'],
    rateLimit: '1000/hour remaining'
  },
  {
    platform: 'X / Twitter',
    icon: 'X',
    color: 'from-black to-gray-800',
    status: 'Connected',
    lastSync: '2 hours ago',
    dataTypes: ['Tweets', 'Profile', 'Followers'],
    rateLimit: '300/hour remaining'
  }
]

export default function APIDocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_ENDPOINTS[0])
  const [apiKey] = useState('sk_live_abc123...def789')

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

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
              <h4 className="font-medium text-sm mb-2">API Status</h4>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">All systems operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="h-16 border-b bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-6">
              <div>
                <h1 className="text-2xl font-bold">API Documentation</h1>
                <p className="text-sm text-muted-foreground">
                  Integrate with your platform data and manage connections
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

          {/* API Documentation Content */}
          <main className="p-6 space-y-6">
            {/* API Key Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  API Authentication
                </CardTitle>
                <CardDescription>
                  Use your API key to authenticate requests to the Creator AI Hub API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">API Key</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono">
                      {apiKey}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(apiKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="font-medium text-sm mb-2">Usage Example</h4>
                  <pre className="text-xs text-muted-foreground overflow-x-auto">
{`curl -X GET "https://api.creatoraihub.com/api/platforms" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* API Endpoints */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Available Endpoints
                  </CardTitle>
                  <CardDescription>
                    Explore the available API endpoints and their usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {API_ENDPOINTS.map((endpoint, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedEndpoint === endpoint
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedEndpoint(endpoint)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={endpoint.method === 'GET' ? 'secondary' :
                                     endpoint.method === 'POST' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm font-mono">{endpoint.endpoint}</code>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {endpoint.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Rate limit: {endpoint.rateLimit}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Platform Status
                  </CardTitle>
                  <CardDescription>
                    Real-time status of your connected platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {PLATFORM_DATA.map((platform, index) => (
                      <div key={index} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                              <span className="text-white font-bold text-xs">{platform.icon}</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{platform.platform}</h4>
                              <p className="text-xs text-muted-foreground">Last sync: {platform.lastSync}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-green-600">
                            {platform.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium mb-1">Available Data Types:</p>
                            <div className="flex flex-wrap gap-1">
                              {platform.dataTypes.map((type) => (
                                <Badge key={type} variant="outline" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Rate limit: {platform.rateLimit}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Endpoint Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Endpoint Details: {selectedEndpoint.endpoint}
                </CardTitle>
                <CardDescription>
                  Detailed information about the selected API endpoint
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Request</h4>
                    <div className="rounded-lg bg-muted p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={selectedEndpoint.method === 'GET' ? 'secondary' : 'default'}>
                          {selectedEndpoint.method}
                        </Badge>
                        <code className="text-sm font-mono">{selectedEndpoint.endpoint}</code>
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedEndpoint.description}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Response</h4>
                    <div className="rounded-lg bg-muted p-4">
                      <pre className="text-xs text-muted-foreground overflow-x-auto">
{`{
  "success": true,
  "data": {
    "platforms": [
      {
        "id": "instagram",
        "name": "Instagram",
        "status": "connected",
        "lastSync": "2024-01-15T10:30:00Z"
      }
    ]
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Rate Limiting</h4>
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                    <p className="text-sm text-amber-800">
                      This endpoint is rate limited to <strong>{selectedEndpoint.rateLimit}</strong>.
                      When you exceed the rate limit, you'll receive a 429 status code.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Resources</CardTitle>
                <CardDescription>
                  Helpful links and documentation for developers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">SDK & Libraries</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href="#" target="_blank">
                          <Code className="mr-2 h-4 w-4" />
                          JavaScript SDK
                          <ExternalLink className="ml-auto h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href="#" target="_blank">
                          <Code className="mr-2 h-4 w-4" />
                          Python SDK
                          <ExternalLink className="ml-auto h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Documentation</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href="#" target="_blank">
                          <FileText className="mr-2 h-4 w-4" />
                          API Reference
                          <ExternalLink className="ml-auto h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href="#" target="_blank">
                          <FileText className="mr-2 h-4 w-4" />
                          Platform Guides
                          <ExternalLink className="ml-auto h-4 w-4" />
                        </a>
                      </Button>
                    </div>
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