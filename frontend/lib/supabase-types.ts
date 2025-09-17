// Database types
export type Database = {
  public: {
    Tables: {
      platform_connections: {
        Row: {
          id: string
          user_id: string
          platform: 'instagram' | 'youtube' | 'twitter' | 'shopify' | 'google_calendar' | 'calendly'
          platform_user_id: string | null
          platform_username: string | null
          platform_email: string | null
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          token_status: 'active' | 'expired' | 'revoked' | 'error'
          scopes: string[] | null
          metadata: any
          connected_at: string
          last_synced_at: string | null
          last_refresh_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: 'instagram' | 'youtube' | 'twitter' | 'shopify' | 'google_calendar' | 'calendly'
          platform_user_id?: string | null
          platform_username?: string | null
          platform_email?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          token_status?: 'active' | 'expired' | 'revoked' | 'error'
          scopes?: string[] | null
          metadata?: any
          connected_at?: string
          last_synced_at?: string | null
          last_refresh_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: 'instagram' | 'youtube' | 'twitter' | 'shopify' | 'google_calendar' | 'calendly'
          platform_user_id?: string | null
          platform_username?: string | null
          platform_email?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          token_status?: 'active' | 'expired' | 'revoked' | 'error'
          scopes?: string[] | null
          metadata?: any
          connected_at?: string
          last_synced_at?: string | null
          last_refresh_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}