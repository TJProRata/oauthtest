import { BaseOAuthProvider, TokenSet } from '../base-provider';
import { InstagramPost, OAuthConfig } from '@creator-ai-hub/shared';
import axios from 'axios';

export class InstagramProvider extends BaseOAuthProvider {
  private readonly baseApiUrl = 'https://graph.instagram.com/v23.0';

  constructor(config: OAuthConfig) {
    super('instagram', config);
  }

  /**
   * Instagram uses a different token exchange endpoint
   */
  public async exchangeCodeForToken(code: string): Promise<TokenSet> {
    const params = {
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: this.config.redirectUri,
      code
    };

    try {
      // Get short-lived token
      const shortTokenResponse = await axios.post(
        'https://api.instagram.com/oauth/access_token',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      // Exchange for long-lived token
      const longTokenResponse = await axios.get(
        'https://graph.instagram.com/access_token',
        {
          params: {
            grant_type: 'ig_exchange_token',
            client_secret: this.config.clientSecret,
            access_token: shortTokenResponse.data.access_token
          }
        }
      );

      return {
        accessToken: longTokenResponse.data.access_token,
        tokenType: 'Bearer',
        expiresIn: longTokenResponse.data.expires_in // ~60 days
      };
    } catch (error: any) {
      throw new Error(
        `Instagram token exchange failed: ${error.response?.data?.error_message || error.message}`
      );
    }
  }

  /**
   * Refresh Instagram long-lived token
   */
  public async refreshAccessToken(accessToken: string): Promise<TokenSet> {
    try {
      const response = await axios.get(
        'https://graph.instagram.com/refresh_access_token',
        {
          params: {
            grant_type: 'ig_refresh_token',
            access_token: accessToken
          }
        }
      );

      return {
        accessToken: response.data.access_token,
        tokenType: 'Bearer',
        expiresIn: response.data.expires_in
      };
    } catch (error: any) {
      throw new Error(
        `Instagram token refresh failed: ${error.response?.data?.error_message || error.message}`
      );
    }
  }

  /**
   * Get Instagram user profile
   * Uses the Instagram Business API endpoint
   */
  public async getUserProfile(accessToken: string): Promise<any> {
    try {
      // Use the /me endpoint with user_id and username fields for Business accounts
      const response = await axios.get(`${this.baseApiUrl}/me`, {
        params: {
          fields: 'user_id,username,account_type,media_count',
          access_token: accessToken
        }
      });

      return {
        id: response.data.user_id || response.data.id,
        username: response.data.username,
        accountType: response.data.account_type || 'business',
        mediaCount: response.data.media_count
      };
    } catch (error: any) {
      // Handle new API error format
      const errorMessage = error.response?.data?.error?.message ||
                          error.response?.data?.error_message ||
                          error.message;
      throw new Error(
        `Failed to fetch Instagram profile: ${errorMessage}. Note: Only Instagram Business or Creator accounts are supported.`
      );
    }
  }

  /**
   * Fetch Instagram user content
   */
  public async fetchUserContent(accessToken: string, contentType: string): Promise<any> {
    switch (contentType) {
      case 'posts':
        return this.fetchPosts(accessToken);
      case 'stories':
        return this.fetchStories(accessToken);
      case 'insights':
        return this.fetchInsights(accessToken);
      default:
        throw new Error(`Unsupported content type: ${contentType}`);
    }
  }

  /**
   * Fetch Instagram posts
   */
  private async fetchPosts(accessToken: string): Promise<InstagramPost[]> {
    try {
      const response = await axios.get(`${this.baseApiUrl}/me/media`, {
        params: {
          fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
          access_token: accessToken,
          limit: 25
        }
      });

      return response.data.data.map((post: any) => ({
        id: post.id,
        caption: post.caption,
        mediaType: post.media_type,
        mediaUrl: post.media_url,
        thumbnailUrl: post.thumbnail_url,
        permalink: post.permalink,
        timestamp: new Date(post.timestamp),
        likeCount: post.like_count,
        commentCount: post.comments_count
      }));
    } catch (error: any) {
      throw new Error(
        `Failed to fetch Instagram posts: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Fetch Instagram stories
   */
  private async fetchStories(accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseApiUrl}/me/stories`, {
        params: {
          fields: 'id,media_type,media_url,permalink,timestamp',
          access_token: accessToken
        }
      });

      return response.data.data || [];
    } catch (error: any) {
      throw new Error(
        `Failed to fetch Instagram stories: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Fetch Instagram insights
   */
  private async fetchInsights(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseApiUrl}/me/insights`, {
        params: {
          metric: 'impressions,reach,profile_views',
          period: 'day',
          access_token: accessToken
        }
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to fetch Instagram insights: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }
}