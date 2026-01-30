/**
 * Environment Bindings
 *
 * Type definitions for Cloudflare Worker environment variables and bindings.
 *
 * MULTI-TENANT ARCHITECTURE:
 * This server supports multiple tenants. Tenant-specific credentials (OAuth tokens)
 * are passed via request headers, NOT stored in wrangler secrets. This allows a
 * single server instance to serve multiple customers.
 *
 * Request Headers:
 * - X-GCloud-Access-Token: OAuth 2.0 access token for GCP authentication
 * - X-GCloud-Project-ID: (Optional) Default project ID for API calls
 */

// =============================================================================
// Tenant Credentials (parsed from request headers)
// =============================================================================

export interface TenantCredentials {
  /** OAuth 2.0 access token for GCP authentication (from X-GCloud-Access-Token header) */
  accessToken: string;

  /** Default project ID for API calls (from X-GCloud-Project-ID header) */
  projectId?: string;
}

/**
 * Parse tenant credentials from request headers
 */
export function parseTenantCredentials(request: Request): TenantCredentials {
  const headers = request.headers;

  return {
    accessToken: headers.get('X-GCloud-Access-Token') || '',
    projectId: headers.get('X-GCloud-Project-ID') || undefined,
  };
}

/**
 * Validate that required credentials are present
 */
export function validateCredentials(credentials: TenantCredentials): void {
  if (!credentials.accessToken) {
    throw new Error(
      'Missing credentials. Provide X-GCloud-Access-Token header with a valid OAuth 2.0 access token.'
    );
  }
}

// =============================================================================
// Environment Configuration (from wrangler.jsonc vars and bindings)
// =============================================================================

export interface Env {
  // ===========================================================================
  // Environment Variables (from wrangler.jsonc vars)
  // ===========================================================================

  /** Maximum character limit for responses */
  CHARACTER_LIMIT: string;

  /** Default page size for list operations */
  DEFAULT_PAGE_SIZE: string;

  /** Maximum page size allowed */
  MAX_PAGE_SIZE: string;

  // ===========================================================================
  // Bindings
  // ===========================================================================

  /** KV namespace for OAuth token storage */
  OAUTH_KV?: KVNamespace;

  /** Cloudflare AI binding (optional) */
  AI?: Ai;
}

// ===========================================================================
// Helper Functions
// ===========================================================================

/**
 * Get a numeric environment value with a default
 */
export function getEnvNumber(env: Env, key: keyof Env, defaultValue: number): number {
  const value = env[key];
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

/**
 * Get the character limit from environment
 */
export function getCharacterLimit(env: Env): number {
  return getEnvNumber(env, 'CHARACTER_LIMIT', 50000);
}

/**
 * Get the default page size from environment
 */
export function getDefaultPageSize(env: Env): number {
  return getEnvNumber(env, 'DEFAULT_PAGE_SIZE', 20);
}

/**
 * Get the maximum page size from environment
 */
export function getMaxPageSize(env: Env): number {
  return getEnvNumber(env, 'MAX_PAGE_SIZE', 100);
}
