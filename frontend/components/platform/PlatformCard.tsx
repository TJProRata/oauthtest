'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Check, Link2, LinkOff, RefreshCw } from 'lucide-react'
import { OAuthPlatform } from '@creator-ai-hub/shared'

interface PlatformCardProps {
  platform: {
    id: OAuthPlatform
    name: string
    icon: string
    color: string
    description: string
    capabilities: string[]
  }
  isConnected: boolean
  onConnect: () => void
  onDisconnect: () => void
  lastSynced?: Date
}

export function PlatformCard({
  platform,
  isConnected,
  onConnect,
  onDisconnect,
  lastSynced
}: PlatformCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async () => {
    setIsLoading(true)
    try {
      if (isConnected) {
        await onDisconnect()
      } else {
        await onConnect()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all ${
      isConnected ? 'ring-2 ring-green-500' : ''
    }`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${platform.color} rounded-lg flex items-center justify-center`}>
              <span className="text-white font-bold">{platform.icon}</span>
            </div>
            <div>
              <h3 className="font-semibold text-xl">{platform.name}</h3>
              {isConnected && (
                <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                  <Check className="h-4 w-4" />
                  <span>Connected</span>
                </div>
              )}
            </div>
          </div>
          {isConnected && (
            <button
              onClick={() => console.log('Refresh', platform.id)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4 text-gray-600" />
            </button>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4">{platform.description}</p>

        {/* Last Synced */}
        {isConnected && lastSynced && (
          <p className="text-sm text-gray-500 mb-4">
            Last synced: {new Date(lastSynced).toLocaleString()}
          </p>
        )}

        {/* Capabilities Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 w-full"
        >
          <span className="text-sm">What we can access</span>
          {showDetails ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {/* Capabilities List */}
        {showDetails && (
          <ul className="space-y-2 mb-4 animate-slide-up">
            {platform.capabilities.map((capability, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>{capability}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Action Button */}
        <button
          onClick={handleAction}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
            isConnected
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : isConnected ? (
            <>
              <LinkOff className="h-5 w-5" />
              <span>Disconnect</span>
            </>
          ) : (
            <>
              <Link2 className="h-5 w-5" />
              <span>Connect</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}