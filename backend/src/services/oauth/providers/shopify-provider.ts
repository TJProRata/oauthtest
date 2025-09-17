import { BaseOAuthProvider, TokenSet } from '../base-provider';
import { ShopifyProduct, OAuthConfig } from '@creator-ai-hub/shared';
import axios from 'axios';
import crypto from 'crypto';

export class ShopifyProvider extends BaseOAuthProvider {
  private shop: string;
  private apiVersion = '2024-01';

  constructor(shop: string, config: OAuthConfig) {
    // Shopify uses dynamic URLs based on shop
    const shopifyConfig = {
      ...config,
      authorizationUrl: `https://${shop}.myshopify.com/admin/oauth/authorize`,
      tokenUrl: `https://${shop}.myshopify.com/admin/oauth/access_token`
    };

    super('shopify', shopifyConfig);
    this.shop = shop;
  }

  /**
   * Override to add Shopify-specific parameters
   */
  public getAuthorizationUrl(userId: string): string {
    const params = {
      client_id: this.config.clientId,
      scope: this.config.scopes.join(','), // Shopify uses comma-separated scopes
      redirect_uri: this.config.redirectUri,
      state: userId,
      grant_options: '' // Optional: for requesting online access tokens
    };

    const url = new URL(this.config.authorizationUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });

    return url.toString();
  }

  /**
   * Override token exchange for Shopify's format
   */
  public async exchangeCodeForToken(code: string): Promise<TokenSet> {
    try {
      const response = await axios.post(this.config.tokenUrl, {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        accessToken: response.data.access_token,
        tokenType: 'Bearer',
        scope: response.data.scope
      };
    } catch (error: any) {
      throw new Error(
        `Failed to exchange Shopify code for token: ${error.response?.data?.error_description || error.message}`
      );
    }
  }

  /**
   * Get Shopify shop information
   */
  public async getUserProfile(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://${this.shop}.myshopify.com/admin/api/${this.apiVersion}/shop.json`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken
          }
        }
      );

      const shop = response.data.shop;
      return {
        id: shop.id,
        shopName: shop.name,
        email: shop.email,
        domain: shop.domain,
        currency: shop.currency,
        timezone: shop.timezone,
        country: shop.country_name,
        phone: shop.phone,
        planName: shop.plan_name,
        primaryLocationId: shop.primary_location_id
      };
    } catch (error: any) {
      throw new Error(
        `Failed to fetch Shopify shop info: ${error.response?.data?.errors || error.message}`
      );
    }
  }

  /**
   * Fetch Shopify content
   */
  public async fetchUserContent(accessToken: string, contentType: string): Promise<any> {
    switch (contentType) {
      case 'products':
        return this.fetchProducts(accessToken);
      case 'orders':
        return this.fetchOrders(accessToken);
      case 'customers':
        return this.fetchCustomers(accessToken);
      case 'inventory':
        return this.fetchInventory(accessToken);
      default:
        throw new Error(`Unsupported content type: ${contentType}`);
    }
  }

  /**
   * Fetch Shopify products
   */
  private async fetchProducts(accessToken: string): Promise<ShopifyProduct[]> {
    try {
      const response = await axios.get(
        `https://${this.shop}.myshopify.com/admin/api/${this.apiVersion}/products.json`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken
          },
          params: {
            limit: 50,
            fields: 'id,title,body_html,vendor,product_type,created_at,handle,updated_at,published_at,template_suffix,status,published_scope,tags,admin_graphql_api_id,variants,options,images'
          }
        }
      );

      return response.data.products.map((product: any) => ({
        id: product.id.toString(),
        title: product.title,
        description: product.body_html,
        price: product.variants[0]?.price || '0',
        imageUrl: product.images[0]?.src,
        inventoryQuantity: product.variants.reduce((total: number, variant: any) =>
          total + (variant.inventory_quantity || 0), 0),
        variants: product.variants.map((variant: any) => ({
          id: variant.id.toString(),
          title: variant.title,
          price: variant.price,
          inventoryQuantity: variant.inventory_quantity
        })),
        vendor: product.vendor,
        productType: product.product_type,
        tags: product.tags,
        status: product.status,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }));
    } catch (error: any) {
      throw new Error(
        `Failed to fetch Shopify products: ${error.response?.data?.errors || error.message}`
      );
    }
  }

  /**
   * Fetch recent orders
   */
  private async fetchOrders(accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `https://${this.shop}.myshopify.com/admin/api/${this.apiVersion}/orders.json`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken
          },
          params: {
            status: 'any',
            limit: 50
          }
        }
      );

      return response.data.orders.map((order: any) => ({
        id: order.id.toString(),
        orderNumber: order.order_number,
        email: order.email,
        totalPrice: order.total_price,
        currency: order.currency,
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status,
        customerName: `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim(),
        lineItems: order.line_items?.length || 0,
        createdAt: order.created_at,
        processedAt: order.processed_at
      }));
    } catch (error: any) {
      throw new Error(
        `Failed to fetch Shopify orders: ${error.response?.data?.errors || error.message}`
      );
    }
  }

  /**
   * Fetch customers
   */
  private async fetchCustomers(accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `https://${this.shop}.myshopify.com/admin/api/${this.apiVersion}/customers.json`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken
          },
          params: {
            limit: 50
          }
        }
      );

      return response.data.customers.map((customer: any) => ({
        id: customer.id.toString(),
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        ordersCount: customer.orders_count,
        totalSpent: customer.total_spent,
        currency: customer.currency,
        state: customer.state,
        verified: customer.verified_email,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at
      }));
    } catch (error: any) {
      throw new Error(
        `Failed to fetch Shopify customers: ${error.response?.data?.errors || error.message}`
      );
    }
  }

  /**
   * Fetch inventory levels
   */
  private async fetchInventory(accessToken: string): Promise<any[]> {
    try {
      // First get locations
      const locationsResponse = await axios.get(
        `https://${this.shop}.myshopify.com/admin/api/${this.apiVersion}/locations.json`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken
          }
        }
      );

      const locationIds = locationsResponse.data.locations.map((loc: any) => loc.id);

      // Then get inventory levels for the first location
      if (locationIds.length === 0) {
        return [];
      }

      const response = await axios.get(
        `https://${this.shop}.myshopify.com/admin/api/${this.apiVersion}/inventory_levels.json`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken
          },
          params: {
            location_ids: locationIds[0],
            limit: 50
          }
        }
      );

      return response.data.inventory_levels;
    } catch (error: any) {
      throw new Error(
        `Failed to fetch Shopify inventory: ${error.response?.data?.errors || error.message}`
      );
    }
  }

  /**
   * Verify Shopify webhook
   */
  public static verifyWebhookSignature(
    rawBody: string,
    signature: string,
    secret: string
  ): boolean {
    const hash = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('base64');

    return hash === signature;
  }
}