import { BaseOAuthProvider, TokenSet } from '../base-provider';
import { CalendarEvent, OAuthConfig } from '@creator-ai-hub/shared';
import axios from 'axios';

export class CalendlyProvider extends BaseOAuthProvider {
  private readonly apiUrl = 'https://api.calendly.com';

  constructor(config: OAuthConfig) {
    super('calendly', config);
  }

  /**
   * Get Calendly user profile
   */
  public async getUserProfile(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const user = response.data.resource;
      return {
        id: user.uri,
        email: user.email,
        username: user.slug,
        displayName: user.name,
        profilePicture: user.avatar_url,
        timezone: user.timezone,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        currentOrganization: user.current_organization
      };
    } catch (error: any) {
      throw new Error(
        `Failed to fetch Calendly profile: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Fetch Calendly content
   */
  public async fetchUserContent(accessToken: string, contentType: string): Promise<any> {
    switch (contentType) {
      case 'event_types':
        return this.fetchEventTypes(accessToken);
      case 'scheduled_events':
        return this.fetchScheduledEvents(accessToken);
      case 'invitees':
        return this.fetchInvitees(accessToken);
      case 'availability':
        return this.fetchAvailability(accessToken);
      default:
        throw new Error(`Unsupported content type: ${contentType}`);
    }
  }

  /**
   * Fetch event types (booking templates)
   */
  private async fetchEventTypes(accessToken: string): Promise<any[]> {
    try {
      // First get the user to get organization URI
      const userResponse = await axios.get(`${this.apiUrl}/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const organizationUri = userResponse.data.resource.current_organization;

      // Fetch event types
      const response = await axios.get(`${this.apiUrl}/event_types`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          organization: organizationUri,
          active: true,
          count: 50
        }
      });

      return response.data.collection.map((eventType: any) => ({
        id: eventType.uri,
        name: eventType.name,
        description: eventType.description_plain,
        duration: eventType.duration,
        slug: eventType.slug,
        color: eventType.color,
        type: eventType.type,
        schedulingUrl: eventType.scheduling_url,
        active: eventType.active,
        kind: eventType.kind,
        poolingType: eventType.pooling_type,
        customQuestions: eventType.custom_questions
      }));
    } catch (error: any) {
      throw new Error(
        `Failed to fetch Calendly event types: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Fetch scheduled events
   */
  private async fetchScheduledEvents(accessToken: string): Promise<CalendarEvent[]> {
    try {
      // First get the user to get organization URI
      const userResponse = await axios.get(`${this.apiUrl}/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const organizationUri = userResponse.data.resource.current_organization;

      // Fetch scheduled events
      const response = await axios.get(`${this.apiUrl}/scheduled_events`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          organization: organizationUri,
          status: 'active',
          min_start_time: new Date().toISOString(),
          count: 50
        }
      });

      return response.data.collection.map((event: any) => ({
        id: event.uri,
        title: event.name,
        description: `Event with ${event.invitees_counter?.total || 0} invitee(s)`,
        startTime: new Date(event.start_time),
        endTime: new Date(event.end_time),
        location: event.location?.location || 'Online',
        attendees: [], // Will be populated from invitees endpoint if needed
        isRecurring: false,
        status: event.status,
        eventType: event.event_type,
        meetingUrl: event.location?.join_url
      }));
    } catch (error: any) {
      throw new Error(
        `Failed to fetch Calendly scheduled events: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Fetch invitees for events
   */
  private async fetchInvitees(accessToken: string): Promise<any[]> {
    try {
      // First get scheduled events
      const scheduledEvents = await this.fetchScheduledEvents(accessToken);

      if (scheduledEvents.length === 0) {
        return [];
      }

      // Get invitees for the first event as example
      const eventUri = scheduledEvents[0].id;

      const response = await axios.get(`${this.apiUrl}/scheduled_events/${this.extractIdFromUri(eventUri)}/invitees`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          count: 50
        }
      });

      return response.data.collection.map((invitee: any) => ({
        id: invitee.uri,
        email: invitee.email,
        name: invitee.name,
        status: invitee.status,
        timezone: invitee.timezone,
        createdAt: invitee.created_at,
        updatedAt: invitee.updated_at,
        rescheduled: invitee.rescheduled,
        canceled: invitee.canceled,
        cancellationReason: invitee.cancellation?.reason
      }));
    } catch (error: any) {
      throw new Error(
        `Failed to fetch Calendly invitees: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Fetch user availability schedules
   */
  private async fetchAvailability(accessToken: string): Promise<any[]> {
    try {
      // First get the user
      const userResponse = await axios.get(`${this.apiUrl}/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const userUri = userResponse.data.resource.uri;

      // Fetch availability schedules
      const response = await axios.get(`${this.apiUrl}/availability_schedules`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          user: userUri
        }
      });

      return response.data.collection.map((schedule: any) => ({
        id: schedule.uri,
        name: schedule.name,
        timezone: schedule.timezone,
        default: schedule.default,
        rules: schedule.rules?.map((rule: any) => ({
          type: rule.type,
          intervals: rule.intervals,
          date: rule.date,
          wday: rule.wday
        }))
      }));
    } catch (error: any) {
      throw new Error(
        `Failed to fetch Calendly availability: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Revoke Calendly access token
   */
  public async revokeToken(token: string): Promise<void> {
    try {
      await axios.post('https://auth.calendly.com/oauth/revoke', {
        token,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    } catch (error: any) {
      throw new Error(
        `Failed to revoke Calendly token: ${error.response?.data?.error_description || error.message}`
      );
    }
  }

  /**
   * Extract ID from Calendly URI
   */
  private extractIdFromUri(uri: string): string {
    // Calendly URIs are like: https://api.calendly.com/scheduled_events/abc123
    const parts = uri.split('/');
    return parts[parts.length - 1];
  }
}