-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Create enums for platform types
CREATE TYPE oauth_platform AS ENUM (
  'instagram',
  'youtube',
  'twitter',
  'shopify',
  'google_calendar',
  'calendly'
);

CREATE TYPE token_status AS ENUM (
  'active',
  'expired',
  'revoked',
  'error'
);

-- Main platform connections table
CREATE TABLE platform_connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform oauth_platform NOT NULL,
  platform_user_id TEXT,
  platform_username TEXT,
  platform_email TEXT,
  access_token TEXT, -- Will be encrypted using Vault
  refresh_token TEXT, -- Will be encrypted using Vault
  token_expires_at TIMESTAMPTZ,
  token_status token_status DEFAULT 'active',
  scopes TEXT[],
  metadata JSONB DEFAULT '{}',
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ,
  last_refresh_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Platform content cache for storing fetched data
CREATE TABLE platform_content_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  connection_id UUID REFERENCES platform_connections(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT NOT NULL, -- 'posts', 'videos', 'products', 'events', etc.
  content_id TEXT NOT NULL,
  content_data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(connection_id, content_type, content_id)
);

-- OAuth token refresh logs for debugging and audit
CREATE TABLE oauth_token_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  connection_id UUID REFERENCES platform_connections(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL, -- 'created', 'refreshed', 'revoked', 'error'
  status TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate limiting tracking per platform
CREATE TABLE platform_rate_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  connection_id UUID REFERENCES platform_connections(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  requests_made INTEGER DEFAULT 0,
  limit_max INTEGER,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(connection_id, endpoint, window_start)
);

-- Create indexes for performance
CREATE INDEX idx_platform_connections_user ON platform_connections(user_id);
CREATE INDEX idx_platform_connections_platform ON platform_connections(platform);
CREATE INDEX idx_platform_connections_status ON platform_connections(token_status);
CREATE INDEX idx_platform_connections_refresh ON platform_connections(token_expires_at)
  WHERE token_status = 'active' AND token_expires_at IS NOT NULL;
CREATE INDEX idx_content_cache_connection ON platform_content_cache(connection_id);
CREATE INDEX idx_content_cache_expires ON platform_content_cache(expires_at);
CREATE INDEX idx_token_logs_connection ON oauth_token_logs(connection_id);
CREATE INDEX idx_rate_limits_connection ON platform_rate_limits(connection_id, window_end);

-- Enable Row Level Security
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_content_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_token_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own connections"
  ON platform_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections"
  ON platform_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections"
  ON platform_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections"
  ON platform_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Cache policies
CREATE POLICY "Users can view own cached content"
  ON platform_content_cache FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM platform_connections pc
      WHERE pc.id = platform_content_cache.connection_id
      AND pc.user_id = auth.uid()
    )
  );

-- Log policies (read-only for users)
CREATE POLICY "Users can view own token logs"
  ON oauth_token_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM platform_connections pc
      WHERE pc.id = oauth_token_logs.connection_id
      AND pc.user_id = auth.uid()
    )
  );

-- Rate limit policies
CREATE POLICY "Users can view own rate limits"
  ON platform_rate_limits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM platform_connections pc
      WHERE pc.id = platform_rate_limits.connection_id
      AND pc.user_id = auth.uid()
    )
  );

-- Helper functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger
CREATE TRIGGER update_platform_connections_updated_at
  BEFORE UPDATE ON platform_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to check if token needs refresh
CREATE OR REPLACE FUNCTION needs_token_refresh(connection_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  conn platform_connections%ROWTYPE;
  buffer_minutes INTEGER;
BEGIN
  SELECT * INTO conn FROM platform_connections WHERE id = connection_id;

  IF conn.token_status != 'active' THEN
    RETURN FALSE;
  END IF;

  IF conn.token_expires_at IS NULL THEN
    -- Permanent tokens (like Shopify)
    RETURN FALSE;
  END IF;

  -- Platform-specific buffer times
  CASE conn.platform
    WHEN 'instagram' THEN buffer_minutes := 1440; -- 24 hours
    WHEN 'youtube', 'google_calendar' THEN buffer_minutes := 15;
    WHEN 'twitter' THEN buffer_minutes := 120;
    WHEN 'calendly' THEN buffer_minutes := 60;
    ELSE buffer_minutes := 30;
  END CASE;

  RETURN conn.token_expires_at <= NOW() + (buffer_minutes || ' minutes')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log token actions
CREATE OR REPLACE FUNCTION log_token_action(
  p_connection_id UUID,
  p_action TEXT,
  p_status TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO oauth_token_logs (connection_id, action, status, error_message, metadata)
  VALUES (p_connection_id, p_action, p_status, p_error_message, p_metadata)
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;