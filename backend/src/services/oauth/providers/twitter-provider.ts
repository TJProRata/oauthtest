import { BaseOAuthProvider, TokenSet } from '../base-provider';
import { OAuthConfig } from '@creator-ai-hub/shared';
import axios from 'axios';

export class TwitterProvider extends BaseOAuthProvider {
  private readonly apiUrl = 'https://api.twitter.com/2';

  constructor(config: OAuthConfig) {
    // Twitter requires PKCE
    super('twitter', { ...config, usePKCE: true });
  }

  /**
   * Get Twitter user profile
   */
  public async getUserProfile(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          'user.fields': 'id,name,username,profile_image_url,description,public_metrics,created_at,verified'
        }
      });

      const userData = response.data.data;
      return {
        id: userData.id,
        username: userData.username,
        displayName: userData.name,
        profilePicture: userData.profile_image_url,
        bio: userData.description,
        followerCount: userData.public_metrics?.followers_count,
        followingCount: userData.public_metrics?.following_count,
        tweetCount: userData.public_metrics?.tweet_count,
        verified: userData.verified,
        createdAt: userData.created_at
      };
    } catch (error: any) {
      throw new Error(
        `Failed to fetch Twitter profile: ${error.response?.data?.detail || error.message}`
      );
    }
  }

  /**
   * Fetch Twitter user content
   */
  public async fetchUserContent(accessToken: string, contentType: string): Promise<any> {
    switch (contentType) {
      case 'tweets':
        return this.fetchTweets(accessToken);
      case 'mentions':
        return this.fetchMentions(accessToken);
      case 'followers':
        return this.fetchFollowers(accessToken);
      default:
        throw new Error(`Unsupported content type: ${contentType}`);
    }
  }

  /**
   * Fetch user's tweets
   */
  private async fetchTweets(accessToken: string): Promise<any[]> {
    try {
      // First get the user ID
      const userResponse = await axios.get(`${this.apiUrl}/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const userId = userResponse.data.data.id;

      // Then fetch their tweets
      const response = await axios.get(`${this.apiUrl}/users/${userId}/tweets`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          'tweet.fields': 'id,text,created_at,public_metrics,referenced_tweets,attachments',
          'max_results': 25,
          'exclude': 'retweets,replies'
        }
      });

      return response.data.data?.map((tweet: any) => ({
        id: tweet.id,
        text: tweet.text,
        createdAt: new Date(tweet.created_at),
        likeCount: tweet.public_metrics?.like_count,
        retweetCount: tweet.public_metrics?.retweet_count,
        replyCount: tweet.public_metrics?.reply_count,
        quoteCount: tweet.public_metrics?.quote_count,
        impressionCount: tweet.public_metrics?.impression_count
      })) || [];
    } catch (error: any) {
      throw new Error(
        `Failed to fetch tweets: ${error.response?.data?.detail || error.message}`
      );
    }
  }

  /**
   * Fetch mentions of the user
   */
  private async fetchMentions(accessToken: string): Promise<any[]> {
    try {
      // First get the user ID
      const userResponse = await axios.get(`${this.apiUrl}/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const userId = userResponse.data.data.id;

      // Fetch mentions
      const response = await axios.get(`${this.apiUrl}/users/${userId}/mentions`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          'tweet.fields': 'id,text,created_at,author_id,public_metrics',
          'max_results': 25
        }
      });

      return response.data.data || [];
    } catch (error: any) {
      throw new Error(
        `Failed to fetch mentions: ${error.response?.data?.detail || error.message}`
      );
    }
  }

  /**
   * Fetch user's followers
   */
  private async fetchFollowers(accessToken: string): Promise<any[]> {
    try {
      // First get the user ID
      const userResponse = await axios.get(`${this.apiUrl}/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const userId = userResponse.data.data.id;

      // Fetch followers
      const response = await axios.get(`${this.apiUrl}/users/${userId}/followers`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          'user.fields': 'id,name,username,profile_image_url,public_metrics',
          'max_results': 25
        }
      });

      return response.data.data?.map((user: any) => ({
        id: user.id,
        username: user.username,
        displayName: user.name,
        profilePicture: user.profile_image_url,
        followerCount: user.public_metrics?.followers_count,
        followingCount: user.public_metrics?.following_count
      })) || [];
    } catch (error: any) {
      throw new Error(
        `Failed to fetch followers: ${error.response?.data?.detail || error.message}`
      );
    }
  }

  /**
   * Revoke Twitter access token
   */
  public async revokeToken(token: string): Promise<void> {
    try {
      await axios.post('https://api.twitter.com/2/oauth2/revoke', {
        token,
        token_type_hint: 'access_token',
        client_id: this.config.clientId
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`
        }
      });
    } catch (error: any) {
      throw new Error(
        `Failed to revoke Twitter token: ${error.response?.data?.error_description || error.message}`
      );
    }
  }
}