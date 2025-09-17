import { OAuthConfig, OAuthPlatform, TokenRefreshResponse } from '@creator-ai-hub/shared';
import axios from 'axios';
import crypto from 'crypto';

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  scope?: string;
  idToken?: string;
}

export interface AuthorizationParams {
  state: string;
  codeVerifier?: string;
  codeChallenge?: string;
  nonce?: string;
}

export abstract class BaseOAuthProvider {
  protected config: OAuthConfig;
  protected platform: OAuthPlatform;

  constructor(platform: OAuthPlatform, config: OAuthConfig) {
    this.platform = platform;
    this.config = config;
  }

  /**
   * Generate authorization URL for OAuth flow
   */
  public generateAuthorizationUrl(params: AuthorizationParams): string {
    const url = new URL(this.config.authorizationUrl);

    const baseParams = {
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scopes.join(' '),
      state: params.state
    };

    // Add PKCE parameters if supported
    if (this.config.usePKCE && params.codeChallenge) {
      Object.assign(baseParams, {
        code_challenge: params.codeChallenge,
        code_challenge_method: 'S256'
      });
    }

    // Add additional platform-specific params
    if (this.config.additionalParams) {
      Object.assign(baseParams, this.config.additionalParams);
    }

    Object.entries(baseParams).forEach(([key, value]) => {
      url.searchParams.append(key, value as string);
    });

    return url.toString();
  }

  /**
   * Exchange authorization code for tokens
   */
  public async exchangeCodeForToken(
    code: string,
    codeVerifier?: string
  ): Promise<TokenSet> {
    const params: Record<string, string> = {
      grant_type: 'authorization_code',
      code,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri
    };

    if (this.config.usePKCE && codeVerifier) {
      params.code_verifier = codeVerifier;
    }

    try {
      const response = await axios.post(this.config.tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return this.parseTokenResponse(response.data);
    } catch (error: any) {
      throw new Error(
        `Failed to exchange code for token: ${error.response?.data?.error_description || error.message}`
      );
    }
  }

  /**
   * Refresh access token using refresh token
   */
  public async refreshAccessToken(refreshToken: string): Promise<TokenRefreshResponse> {
    const params = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret
    };

    try {
      const response = await axios.post(this.config.tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return this.parseTokenResponse(response.data);
    } catch (error: any) {
      throw new Error(
        `Failed to refresh token: ${error.response?.data?.error_description || error.message}`
      );
    }
  }

  /**
   * Revoke a token
   */
  public async revokeToken(token: string, tokenType: 'access_token' | 'refresh_token' = 'access_token'): Promise<void> {
    // Default implementation - platforms may override
    throw new Error(`Token revocation not implemented for ${this.platform}`);
  }

  /**
   * Parse token response from OAuth provider
   */
  protected parseTokenResponse(data: any): TokenSet {
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type || 'Bearer',
      scope: data.scope,
      idToken: data.id_token
    };
  }

  /**
   * Generate PKCE code verifier
   */
  public static generateCodeVerifier(): string {
    return crypto
      .randomBytes(32)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 128);
  }

  /**
   * Generate PKCE code challenge from verifier
   */
  public static generateCodeChallenge(codeVerifier: string): string {
    return crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  /**
   * Generate random state parameter
   */
  public static generateState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Get authorization URL for OAuth flow (wrapper for backend compatibility)
   */
  public getAuthorizationUrl(userId: string): string {
    const params: AuthorizationParams = {
      state: userId, // Use userId as state for simplicity
      codeVerifier: this.config.usePKCE ? BaseOAuthProvider.generateCodeVerifier() : undefined,
      codeChallenge: undefined as string | undefined
    };

    if (params.codeVerifier) {
      params.codeChallenge = BaseOAuthProvider.generateCodeChallenge(params.codeVerifier);
      // Store codeVerifier for later use in token exchange
      // In production, this should be stored in a session or cache with the userId
    }

    return this.generateAuthorizationUrl(params);
  }

  /**
   * Get user profile from OAuth provider
   */
  public abstract getUserProfile(accessToken: string): Promise<any>;

  /**
   * Platform-specific data fetching methods
   */
  public abstract fetchUserContent(accessToken: string, contentType: string): Promise<any>;
}