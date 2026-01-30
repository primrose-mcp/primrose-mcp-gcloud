/**
 * Google Cloud Platform MCP Server - Main Entry Point
 *
 * This file sets up the MCP server using Cloudflare's Agents SDK.
 * It supports stateless mode for multi-tenant deployments.
 *
 * MULTI-TENANT ARCHITECTURE:
 * Tenant credentials (OAuth access tokens) are parsed from request headers,
 * allowing a single server deployment to serve multiple customers.
 *
 * Required Headers:
 * - X-GCloud-Access-Token: OAuth 2.0 access token for GCP authentication
 *
 * Optional Headers:
 * - X-GCloud-Project-ID: Default project ID for API calls
 *
 * Authentication:
 * Use a service account or user OAuth token with appropriate GCP permissions.
 * Generate tokens using: gcloud auth print-access-token
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpAgent } from 'agents/mcp';
import { createGCloudClient } from './client.js';
import {
  registerBigQueryTools,
  registerComputeTools,
  registerDnsTools,
  registerFunctionsTools,
  registerGkeTools,
  registerIamTools,
  registerLoggingTools,
  registerPubSubTools,
  registerSecretManagerTools,
  registerSqlTools,
  registerStorageTools,
} from './tools/index.js';
import {
  type Env,
  type TenantCredentials,
  parseTenantCredentials,
  validateCredentials,
} from './types/env.js';

// =============================================================================
// MCP Server Configuration
// =============================================================================

const SERVER_NAME = 'primrose-mcp-gcloud';
const SERVER_VERSION = '1.0.0';

// =============================================================================
// MCP Agent (Stateful - uses Durable Objects)
// =============================================================================

/**
 * McpAgent provides stateful MCP sessions backed by Durable Objects.
 *
 * NOTE: For multi-tenant deployments, use the stateless mode (Option 2) instead.
 * The stateful McpAgent is better suited for single-tenant deployments where
 * credentials can be stored as wrangler secrets.
 *
 * @deprecated For multi-tenant support, use stateless mode with per-request credentials
 */
export class GCloudMcpAgent extends McpAgent<Env> {
  server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  async init() {
    throw new Error(
      'Stateful mode (McpAgent) is not supported for multi-tenant deployments. ' +
        'Use the stateless /mcp endpoint with X-GCloud-Access-Token header instead.'
    );
  }
}

// =============================================================================
// Stateless MCP Server (Recommended - no Durable Objects needed)
// =============================================================================

/**
 * Creates a stateless MCP server instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides credentials via headers, allowing
 * a single server deployment to serve multiple tenants.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
function createStatelessServer(credentials: TenantCredentials): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Create client with tenant-specific credentials
  const client = createGCloudClient(credentials);

  // Register all GCP service tools
  registerComputeTools(server, client);
  registerStorageTools(server, client);
  registerFunctionsTools(server, client);
  registerBigQueryTools(server, client);
  registerPubSubTools(server, client);
  registerSqlTools(server, client);
  registerIamTools(server, client);
  registerSecretManagerTools(server, client);
  registerDnsTools(server, client);
  registerGkeTools(server, client);
  registerLoggingTools(server, client);

  // Test connection tool
  server.tool(
    'gcloud_test_connection',
    'Test the connection to Google Cloud APIs',
    {},
    async () => {
      try {
        const result = await client.testConnection();
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  return server;
}

// =============================================================================
// Worker Export
// =============================================================================

export default {
  /**
   * Main fetch handler for the Worker
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', server: SERVER_NAME }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ==========================================================================
    // Stateless MCP with Streamable HTTP (Recommended for multi-tenant)
    // ==========================================================================
    if (url.pathname === '/mcp' && request.method === 'POST') {
      // Parse tenant credentials from request headers
      const credentials = parseTenantCredentials(request);

      // Validate credentials are present
      try {
        validateCredentials(credentials);
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: error instanceof Error ? error.message : 'Invalid credentials',
            required_headers: ['X-GCloud-Access-Token'],
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Create server with tenant-specific credentials
      const server = createStatelessServer(credentials);

      // Import and use createMcpHandler for streamable HTTP
      const { createMcpHandler } = await import('agents/mcp');
      const handler = createMcpHandler(server);
      return handler(request, env, ctx);
    }

    // SSE endpoint for legacy clients
    if (url.pathname === '/sse') {
      return new Response('SSE endpoint requires Durable Objects. Enable in wrangler.jsonc.', {
        status: 501,
      });
    }

    // Default response
    return new Response(
      JSON.stringify({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        description: 'Google Cloud Platform MCP Server - Multi-tenant',
        endpoints: {
          mcp: '/mcp (POST) - Streamable HTTP MCP endpoint',
          health: '/health - Health check',
        },
        authentication: {
          description: 'Pass tenant credentials via request headers',
          required_headers: {
            'X-GCloud-Access-Token':
              'OAuth 2.0 access token (generate with: gcloud auth print-access-token)',
          },
          optional_headers: {
            'X-GCloud-Project-ID': 'Default project ID for API calls',
          },
        },
        services: [
          'Compute Engine (instances, disks, networks, firewalls)',
          'Cloud Storage (buckets, objects)',
          'Cloud Functions',
          'Cloud Run',
          'BigQuery (datasets, tables, queries)',
          'Pub/Sub (topics, subscriptions, messages)',
          'Cloud SQL (instances, databases)',
          'IAM (service accounts, policies, roles)',
          'Secret Manager (secrets, versions)',
          'Cloud DNS (managed zones, records)',
          'GKE (clusters, node pools)',
          'Cloud Logging (entries, logs)',
        ],
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
