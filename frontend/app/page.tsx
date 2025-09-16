import Link from 'next/link'
import { ArrowRight, Sparkles, Shield, Zap, Globe, Calendar, ShoppingBag, Instagram, Youtube, Twitter, Database, Bot, ChevronRight, Star, Users, TrendingUp, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">Creator AI Hub</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container space-y-6 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2 text-center">
          <Badge variant="secondary" className="rounded-lg px-3 py-1 text-sm">
            <Sparkles className="mr-2 h-3 w-3" />
            Introducing Creator AI Hub
          </Badge>
          <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
            Build Your AI-Powered
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Digital Twin</span>
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
            Connect all your platforms in one place. Let your AI assistant access your content and help your audience 24/7.
          </p>
          <div className="flex w-full items-center justify-center space-x-4 py-4 md:pb-10">
            <Button size="lg" asChild>
              <Link href="/login">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#platforms">
                View Integrations
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-8 md:grid-cols-3 lg:gap-12">
          <div className="mx-auto flex w-full items-center justify-center space-x-2">
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Active Creators</p>
                <p className="text-2xl font-bold">10,000+</p>
              </div>
            </div>
          </div>
          <div className="mx-auto flex w-full items-center justify-center space-x-2">
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Database className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Platforms Connected</p>
                <p className="text-2xl font-bold">50,000+</p>
              </div>
            </div>
          </div>
          <div className="mx-auto flex w-full items-center justify-center space-x-2">
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">AI Interactions</p>
                <p className="text-2xl font-bold">1M+</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container space-y-6 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl">
            Why Creators Choose Us
          </h2>
          <p className="max-w-[600px] text-lg text-muted-foreground">
            Professional-grade tools designed for creators who want to scale their engagement
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Bank-level encryption for all your tokens and data. Your information stays secure and private.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Auto-Refresh</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Never worry about expired tokens again. Our system automatically refreshes your connections.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">All-in-One</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect all your platforms in one unified dashboard. Manage everything from one place.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Platforms Section */}
      <section id="platforms" className="container space-y-6 py-8 md:py-12 lg:py-24 bg-muted/30">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl">
            Connect Your Digital Presence
          </h2>
          <p className="max-w-[600px] text-lg text-muted-foreground">
            Each platform unlocks new capabilities for your AI assistant
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          {/* Instagram Card */}
          <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
                  <span className="text-white font-bold text-lg">IG</span>
                </div>
                <CardTitle className="text-xl">Instagram</CardTitle>
              </div>
              <CardDescription>
                Connect your Instagram Business or Creator account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Posts, Reels & Stories</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Comments & Engagement</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Analytics & Insights</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* YouTube Card */}
          <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-600">
                  <Youtube className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">YouTube</CardTitle>
              </div>
              <CardDescription>
                Access your YouTube channel and videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Videos & Transcripts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Channel Statistics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Comments & Playlists</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Twitter Card */}
          <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-black">
                  <Twitter className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">X / Twitter</CardTitle>
              </div>
              <CardDescription>
                Connect your X (Twitter) account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Tweets & Threads</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Profile & Followers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Engagement Metrics</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Shopify Card */}
          <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Shopify</CardTitle>
              </div>
              <CardDescription>
                Integrate your Shopify store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Product Catalog</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Real-time Inventory</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Order History</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Google Calendar Card */}
          <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Google Calendar</CardTitle>
              </div>
              <CardDescription>
                Sync your Google Calendar events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Events & Schedule</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Availability Check</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Event Details</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Calendly Card */}
          <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500">
                  <span className="text-white font-bold text-lg">CL</span>
                </div>
                <CardTitle className="text-xl">Calendly</CardTitle>
              </div>
              <CardDescription>
                Connect your Calendly scheduling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Booking Links</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Available Slots</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Appointment Details</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container space-y-6 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl">
            Ready to Build Your AI Assistant?
          </h2>
          <p className="max-w-[600px] text-lg text-muted-foreground">
            Join thousands of creators who are already using AI to engage with their audience
          </p>
          <Button size="lg" className="mt-4" asChild>
            <Link href="/login">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="font-bold">Creator AI Hub</span>
            </div>
          </div>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for creators who want to scale. © 2024 Creator AI Hub.
          </p>
        </div>
      </footer>
    </div>
  )
}