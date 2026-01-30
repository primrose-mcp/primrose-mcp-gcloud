/**
 * IAM Tools
 *
 * MCP tools for Google Cloud IAM operations including:
 * - Service Accounts
 * - IAM Policies
 * - Roles
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { GCloudClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all IAM tools
 */
export function registerIamTools(server: McpServer, client: GCloudClient): void {
  // ===========================================================================
  // Service Accounts
  // ===========================================================================

  server.tool(
    'gcloud_list_service_accounts',
    `List service accounts in a project.

Args:
  - projectId: GCP project ID

Returns:
  List of service accounts with their email and status.`,
    {
      projectId: z.string().describe('GCP project ID'),
    },
    async ({ projectId }) => {
      try {
        const result = await client.listServiceAccounts(projectId);
        return formatResponse(result.accounts || [], 'json', 'service_accounts');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_get_service_account',
    `Get details of a specific service account.

Args:
  - projectId: GCP project ID
  - email: Service account email

Returns:
  Service account details.`,
    {
      projectId: z.string().describe('GCP project ID'),
      email: z.string().describe('Service account email'),
    },
    async ({ projectId, email }) => {
      try {
        const account = await client.getServiceAccount(projectId, email);
        return formatResponse(account, 'json', 'service_account');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_create_service_account',
    `Create a new service account.

Args:
  - projectId: GCP project ID
  - accountId: ID for the service account (used in email)
  - displayName: Display name for the service account

Returns:
  Created service account details.`,
    {
      projectId: z.string().describe('GCP project ID'),
      accountId: z.string().describe('ID for the service account'),
      displayName: z.string().optional().describe('Display name'),
    },
    async ({ projectId, accountId, displayName }) => {
      try {
        const account = await client.createServiceAccount(projectId, accountId, displayName);
        return formatResponse(
          { success: true, message: `Service account ${accountId} created`, account },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_delete_service_account',
    `Delete a service account.

Args:
  - projectId: GCP project ID
  - email: Service account email to delete

Returns:
  Confirmation of deletion.`,
    {
      projectId: z.string().describe('GCP project ID'),
      email: z.string().describe('Service account email to delete'),
    },
    async ({ projectId, email }) => {
      try {
        await client.deleteServiceAccount(projectId, email);
        return formatResponse(
          { success: true, message: `Service account ${email} deleted` },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // IAM Policies
  // ===========================================================================

  server.tool(
    'gcloud_get_project_iam_policy',
    `Get the IAM policy for a project.

Args:
  - projectId: GCP project ID

Returns:
  IAM policy with bindings showing roles and members.`,
    {
      projectId: z.string().describe('GCP project ID'),
    },
    async ({ projectId }) => {
      try {
        const policy = await client.getProjectIamPolicy(projectId);
        return formatResponse(policy, 'json', 'iam_policy');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_set_project_iam_policy',
    `Set the IAM policy for a project. Warning: This replaces the entire policy.

Args:
  - projectId: GCP project ID
  - bindings: Array of role bindings (role and members)

Returns:
  Updated IAM policy.`,
    {
      projectId: z.string().describe('GCP project ID'),
      bindings: z
        .array(
          z.object({
            role: z.string().describe('IAM role (e.g., roles/viewer)'),
            members: z.array(z.string()).describe('List of members'),
          })
        )
        .describe('Role bindings'),
    },
    async ({ projectId, bindings }) => {
      try {
        // Get current policy first to preserve etag
        const currentPolicy = await client.getProjectIamPolicy(projectId);
        const policy = await client.setProjectIamPolicy(projectId, {
          version: currentPolicy.version,
          bindings,
          etag: currentPolicy.etag,
        });
        return formatResponse(
          { success: true, message: 'IAM policy updated', policy },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Roles
  // ===========================================================================

  server.tool(
    'gcloud_list_roles',
    `List IAM roles. Can list predefined roles or custom project roles.

Args:
  - projectId: GCP project ID (optional, omit for predefined roles)

Returns:
  List of roles with their permissions.`,
    {
      projectId: z.string().optional().describe('GCP project ID (optional)'),
    },
    async ({ projectId }) => {
      try {
        const result = await client.listRoles(projectId);
        return formatResponse(result.roles || [], 'json', 'roles');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
