// Platform types
export type OAuthPlatform =
  | 'instagram'
  | 'youtube'
  | 'twitter'
  | 'shopify'
  | 'google_calendar'
  | 'calendly';

export type TokenStatus = 'active' | 'expired' | 'revoked' | 'error';

// Platform connection interface
export interface PlatformConnection {
  id: string;
  userId: string;
  platform: OAuthPlatform;
  platformUserId?: string;
  platformUsername?: string;
  platformEmail?: string;
  accessToken?: string; // Encrypted
  refreshToken?: string; // Encrypted
  tokenExpiresAt?: Date;
  tokenStatus: TokenStatus;
  scopes: string[];
  metadata: Record<string, any>;
  connectedAt: Date;
  lastSyncedAt?: Date;
  lastRefreshAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// OAuth configuration for each platform
export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationUrl: string;
  tokenUrl: string;
  scopes: string[];
  usePKCE?: boolean;
  additionalParams?: Record<string, string>;
}

// Platform configurations
export const PLATFORM_CONFIGS: Record<OAuthPlatform, Partial<OAuthConfig>> = {
  instagram: {
    authorizationUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    scopes: [
      'instagram_business_basic',
      'instagram_business_content_publish',
      'instagram_business_manage_comments',
      'instagram_business_manage_messages'
    ]
  },
  youtube: {
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'openid'
    ]
  },
  twitter: {
    authorizationUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scopes: ['tweet.read', 'users.read', 'follows.read'],
    usePKCE: true
  },
  shopify: {
    authorizationUrl: '', // Dynamic based on shop
    tokenUrl: '', // Dynamic based on shop
    scopes: ['read_products', 'read_orders', 'read_customers', 'read_inventory']
  },
  google_calendar: {
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events.readonly'
    ]
  },
  calendly: {
    authorizationUrl: 'https://auth.calendly.com/oauth/authorize',
    tokenUrl: 'https://auth.calendly.com/oauth/token',
    scopes: [] // Calendly doesn't use specific scopes
  }
};

// Platform data types
export interface PlatformProfile {
  id: string;
  username?: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  followerCount?: number;
  followingCount?: number;
  metadata?: Record<string, any>;
}

// Instagram specific types
export interface InstagramPost {
  id: string;
  caption?: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  mediaUrl: string;
  thumbnailUrl?: string;
  permalink: string;
  timestamp: Date;
  likeCount?: number;
  commentCount?: number;
}

// YouTube specific types
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: Date;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  duration?: string;
  tags?: string[];
}

// Shopify specific types
export interface ShopifyProduct {
  id: string;
  title: string;
  description?: string;
  price: string;
  imageUrl?: string;
  inventoryQuantity?: number;
  variants?: Array<{
    id: string;
    title: string;
    price: string;
    inventoryQuantity?: number;
  }>;
}

// Calendar event types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  isRecurring?: boolean;
}

// Cache types
export interface CachedContent {
  id: string;
  connectionId: string;
  contentType: string;
  contentId: string;
  contentData: any;
  metadata?: Record<string, any>;
  expiresAt: Date;
  createdAt: Date;
  cachedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Token refresh response
export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  scope?: string;
}