'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Sparkles, ArrowRight, Instagram, Youtube, Twitter, ShoppingBag, Calendar, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const OAUTH_PLATFORMS = [
  {
    name: 'Instagram',
    icon: 'IG',
    color: 'from-purple-600 to-pink-600',
    bgColor: 'bg-gradient-to-br from-purple-600 to-pink-600'
  },
  {
    name: 'YouTube',
    icon: Youtube,
    bgColor: 'bg-red-600'
  },
  {
    name: 'X / Twitter',
    icon: Twitter,
    bgColor: 'bg-black'
  },
  {
    name: 'Shopify',
    icon: ShoppingBag,
    bgColor: 'bg-green-600'
  },
  {
    name: 'Google Calendar',
    icon: Calendar,
    bgColor: 'bg-blue-600'
  },
  {
    name: 'Calendly',
    icon: 'CL',
    bgColor: 'bg-blue-500'
  }
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login - redirect to dashboard
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 1000)
  }

  const handleOAuthConnect = (platform: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    window.location.href = `${apiUrl}/oauth/${platform.toLowerCase()}/authorize`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">Creator AI Hub</span>
          </Link>
        </div>
      </nav>

      <div className="container relative min-h-[calc(100vh-4rem)] flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        {/* Left Side - Login Form */}
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to access your dashboard
              </p>
            </div>

            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Sign in to your account</CardTitle>
                <CardDescription>
                  Connect your platforms and start building your AI assistant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with demo
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full"
                >
                  Continue as Demo User
                </Button>
              </CardContent>
            </Card>

            <p className="px-8 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="underline underline-offset-4 hover:text-primary"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Platform Preview */}
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Sparkles className="mr-2 h-6 w-6" />
            Creator AI Hub
          </div>
          <div className="relative z-20 mt-auto">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Connect Your Digital World</h2>
                <p className="text-lg text-white/90 mb-6">
                  Once you sign in, you&apos;ll be able to connect these platforms:
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {OAUTH_PLATFORMS.map((platform, index) => (
                  <div
                    key={platform.name}
                    className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
                  >
                    <div className={`h-12 w-12 rounded-lg ${platform.bgColor} flex items-center justify-center`}>
                      {typeof platform.icon === 'string' ? (
                        <span className="text-white font-bold text-sm">{platform.icon}</span>
                      ) : (
                        <platform.icon className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-center">{platform.name}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-sm">Secure OAuth 2.0 authentication</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-blue-400" />
                  <span className="text-sm">Automatic token refresh</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-purple-400" />
                  <span className="text-sm">Real-time data synchronization</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}