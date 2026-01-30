/**
 * Secret Manager Tools
 *
 * MCP tools for Google Cloud Secret Manager operations including:
 * - Secrets
 * - Secret Versions
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { GCloudClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all Secret Manager tools
 */
export function registerSecretManagerTools(server: McpServer, client: GCloudClient): void {
  // ===========================================================================
  // Secrets
  // ===========================================================================

  server.tool(
    'gcloud_list_secrets',
    `List secrets in a project.

Args:
  - projectId: GCP project ID

Returns:
  List of secrets (without their values).`,
    {
      projectId: z.string().describe('GCP project ID'),
    },
    async ({ projectId }) => {
      try {
        const result = await client.listSecrets(projectId);
        return formatResponse(result.secrets || [], 'json', 'secrets');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_get_secret',
    `Get metadata of a specific secret (not the value).

Args:
  - projectId: GCP project ID
  - secretName: Name of the secret

Returns:
  Secret metadata including replication config and labels.`,
    {
      projectId: z.string().describe('GCP project ID'),
      secretName: z.string().describe('Name of the secret'),
    },
    async ({ projectId, secretName }) => {
      try {
        const secret = await client.getSecret(projectId, secretName);
        return formatResponse(secret, 'json', 'secret');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_create_secret',
    `Create a new secret (without a value).

Args:
  - projectId: GCP project ID
  - secretId: ID for the new secret
  - automatic: Use automatic replication (default: true)

Returns:
  Created secret metadata.`,
    {
      projectId: z.string().describe('GCP project ID'),
      secretId: z.string().describe('ID for the new secret'),
      automatic: z.boolean().default(true).describe('Use automatic replication'),
    },
    async ({ projectId, secretId, automatic }) => {
      try {
        const replication = automatic ? { automatic: {} } : undefined;
        const secret = await client.createSecret(projectId, secretId, replication);
        return formatResponse(
          { success: true, message: `Secret ${secretId} created`, secret },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_delete_secret',
    `Delete a secret and all its versions.

Args:
  - projectId: GCP project ID
  - secretName: Name of the secret to delete

Returns:
  Confirmation of deletion.`,
    {
      projectId: z.string().describe('GCP project ID'),
      secretName: z.string().describe('Name of the secret to delete'),
    },
    async ({ projectId, secretName }) => {
      try {
        await client.deleteSecret(projectId, secretName);
        return formatResponse(
          { success: true, message: `Secret ${secretName} deleted` },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Secret Versions
  // ===========================================================================

  server.tool(
    'gcloud_list_secret_versions',
    `List versions of a secret.

Args:
  - projectId: GCP project ID
  - secretName: Name of the secret

Returns:
  List of secret versions with their state.`,
    {
      projectId: z.string().describe('GCP project ID'),
      secretName: z.string().describe('Name of the secret'),
    },
    async ({ projectId, secretName }) => {
      try {
        const result = await client.listSecretVersions(projectId, secretName);
        return formatResponse(result.versions || [], 'json', 'versions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_access_secret_version',
    `Access the value of a secret version.

Args:
  - projectId: GCP project ID
  - secretName: Name of the secret
  - version: Version to access (default: 'latest')

Returns:
  Secret value (decoded from base64).`,
    {
      projectId: z.string().describe('GCP project ID'),
      secretName: z.string().describe('Name of the secret'),
      version: z.string().default('latest').describe('Version to access'),
    },
    async ({ projectId, secretName, version }) => {
      try {
        const payload = await client.accessSecretVersion(projectId, secretName, version);
        // Decode base64 data
        const data = payload.data ? atob(payload.data) : '';
        return formatResponse(
          { secretName, version, data },
          'json',
          'secret_value'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_add_secret_version',
    `Add a new version to a secret.

Args:
  - projectId: GCP project ID
  - secretName: Name of the secret
  - payload: Secret value to store

Returns:
  Created version details.`,
    {
      projectId: z.string().describe('GCP project ID'),
      secretName: z.string().describe('Name of the secret'),
      payload: z.string().describe('Secret value to store'),
    },
    async ({ projectId, secretName, payload }) => {
      try {
        const version = await client.addSecretVersion(projectId, secretName, payload);
        return formatResponse(
          { success: true, message: 'Secret version added', version },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
