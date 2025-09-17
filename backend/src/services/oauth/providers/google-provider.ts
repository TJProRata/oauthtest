import { BaseOAuthProvider } from '../base-provider';
import { YouTubeVideo, CalendarEvent, OAuthConfig } from '@creator-ai-hub/shared';
import axios from 'axios';

export class GoogleProvider extends BaseOAuthProvider {
  private readonly youtubeApiUrl = 'https://www.googleapis.com/youtube/v3';
  private readonly calendarApiUrl = 'https://www.googleapis.com/calendar/v3';
  private readonly peopleApiUrl = 'https://people.googleapis.com/v1';

  constructor(platform: 'youtube' | 'google_calendar', config: OAuthConfig) {
    super(platform, config);
  }

  /**
   * Get Google user profile
   */
  public async getUserProfile(accessToken: string): Promise<any> {
    try {
      // Use OAuth2 userinfo endpoint instead of People API
      // This doesn't require enabling any additional APIs
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const profile = response.data;
      return {
        id: profile.sub || profile.id,
        email: profile.email,
        displayName: profile.name,
        profilePicture: profile.picture
      };
    } catch (error: any) {
      throw new Error(
        `Failed to fetch Google profile: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Fetch Google service content based on platform
   */
  public async fetchUserContent(accessToken: string, contentType: string): Promise<any> {
    if (this.platform === 'youtube') {
      return this.fetchYouTubeContent(accessToken, contentType);
    } else if (this.platform === 'google_calendar') {
      return this.fetchCalendarContent(accessToken, contentType);
    }
    throw new Error(`Unsupported platform: ${this.platform}`);
  }

  /**
   * Fetch YouTube content
   */
  private async fetchYouTubeContent(accessToken: string, contentType: string): Promise<any> {
    switch (contentType) {
      case 'videos':
        return this.fetchYouTubeVideos(accessToken);
      case 'channel':
        return this.fetchYouTubeChannel(accessToken);
      case 'playlists':
        return this.fetchYouTubePlaylists(accessToken);
      default:
        throw new Error(`Unsupported YouTube content type: ${contentType}`);
    }
  }

  /**
   * Fetch YouTube videos
   */
  private async fetchYouTubeVideos(accessToken: string): Promise<YouTubeVideo[]> {
    try {
      // First, get the channel ID
      const channelResponse = await axios.get(`${this.youtubeApiUrl}/channels`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          part: 'contentDetails',
          mine: true
        }
      });

      const uploadsPlaylistId = channelResponse.data.items[0]?.contentDetails?.relatedPlaylists?.uploads;

      if (!uploadsPlaylistId) {
        return [];
      }

      // Fetch videos from uploads playlist
      const videosResponse = await axios.get(`${this.youtubeApiUrl}/playlistItems`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          part: 'snippet,contentDetails',
          playlistId: uploadsPlaylistId,
          maxResults: 25
        }
      });

      // Get video statistics
      const videoIds = videosResponse.data.items.map((item: any) => item.contentDetails.videoId).join(',');
      const statsResponse = await axios.get(`${this.youtubeApiUrl}/videos`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          part: 'statistics,contentDetails',
          id: videoIds
        }
      });

      const statsMap = new Map(
        statsResponse.data.items.map((item: any) => [item.id, item])
      );

      return videosResponse.data.items.map((item: any) => {
        const stats = statsMap.get(item.contentDetails.videoId);
        return {
          id: item.contentDetails.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
          publishedAt: new Date(item.snippet.publishedAt),
          viewCount: parseInt(stats?.statistics?.viewCount || '0'),
          likeCount: parseInt(stats?.statistics?.likeCount || '0'),
          commentCount: parseInt(stats?.statistics?.commentCount || '0'),
          duration: stats?.contentDetails?.duration,
          tags: item.snippet.tags
        };
      });
    } catch (error: any) {
      throw new Error(
        `Failed to fetch YouTube videos: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Fetch YouTube channel info
   */
  private async fetchYouTubeChannel(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`${this.youtubeApiUrl}/channels`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          part: 'snippet,statistics',
          mine: true
        }
      });

      const channel = response.data.items[0];
      return {
        id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        customUrl: channel.snippet.customUrl,
        publishedAt: channel.snippet.publishedAt,
        thumbnailUrl: channel.snippet.thumbnails?.high?.url,
        viewCount: parseInt(channel.statistics.viewCount),
        subscriberCount: parseInt(channel.statistics.subscriberCount),
        videoCount: parseInt(channel.statistics.videoCount)
      };
    } catch (error: any) {
      throw new Error(
        `Failed to fetch YouTube channel: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Fetch YouTube playlists
   */
  private async fetchYouTubePlaylists(accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.youtubeApiUrl}/playlists`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          part: 'snippet,contentDetails',
          mine: true,
          maxResults: 25
        }
      });

      return response.data.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails?.high?.url,
        itemCount: item.contentDetails.itemCount,
        publishedAt: item.snippet.publishedAt
      }));
    } catch (error: any) {
      throw new Error(
        `Failed to fetch YouTube playlists: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Fetch Google Calendar content
   */
  private async fetchCalendarContent(accessToken: string, contentType: string): Promise<any> {
    switch (contentType) {
      case 'events':
        return this.fetchCalendarEvents(accessToken);
      case 'calendars':
        return this.fetchCalendarList(accessToken);
      default:
        throw new Error(`Unsupported Calendar content type: ${contentType}`);
    }
  }

  /**
   * Fetch calendar events
   */
  private async fetchCalendarEvents(accessToken: string): Promise<CalendarEvent[]> {
    try {
      const response = await axios.get(`${this.calendarApiUrl}/calendars/primary/events`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          timeMin: new Date().toISOString(),
          maxResults: 25,
          singleEvents: true,
          orderBy: 'startTime'
        }
      });

      return response.data.items.map((event: any) => ({
        id: event.id,
        title: event.summary,
        description: event.description,
        startTime: new Date(event.start.dateTime || event.start.date),
        endTime: new Date(event.end.dateTime || event.end.date),
        location: event.location,
        attendees: event.attendees?.map((a: any) => a.email),
        isRecurring: !!event.recurringEventId
      }));
    } catch (error: any) {
      throw new Error(
        `Failed to fetch calendar events: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Fetch list of calendars
   */
  private async fetchCalendarList(accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.calendarApiUrl}/users/me/calendarList`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      return response.data.items.map((cal: any) => ({
        id: cal.id,
        summary: cal.summary,
        description: cal.description,
        primary: cal.primary,
        accessRole: cal.accessRole
      }));
    } catch (error: any) {
      throw new Error(
        `Failed to fetch calendar list: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }
}