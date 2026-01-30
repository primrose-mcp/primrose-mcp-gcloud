/**
 * Cloud SQL Tools
 *
 * MCP tools for Google Cloud SQL operations including:
 * - Instances
 * - Databases
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { GCloudClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all Cloud SQL tools
 */
export function registerSqlTools(server: McpServer, client: GCloudClient): void {
  // ===========================================================================
  // Instances
  // ===========================================================================

  server.tool(
    'gcloud_list_sql_instances',
    `List Cloud SQL instances in a project.

Args:
  - projectId: GCP project ID

Returns:
  List of SQL instances with their configuration and status.`,
    {
      projectId: z.string().describe('GCP project ID'),
    },
    async ({ projectId }) => {
      try {
        const result = await client.listSqlInstances(projectId);
        return formatResponse(result.items || [], 'json', 'instances');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_get_sql_instance',
    `Get details of a specific Cloud SQL instance.

Args:
  - projectId: GCP project ID
  - instanceName: Name of the instance

Returns:
  Detailed instance information including IP addresses and settings.`,
    {
      projectId: z.string().describe('GCP project ID'),
      instanceName: z.string().describe('Name of the instance'),
    },
    async ({ projectId, instanceName }) => {
      try {
        const instance = await client.getSqlInstance(projectId, instanceName);
        return formatResponse(instance, 'json', 'instance');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_delete_sql_instance',
    `Delete a Cloud SQL instance.

Args:
  - projectId: GCP project ID
  - instanceName: Name of the instance to delete

Returns:
  Operation details for the delete request.`,
    {
      projectId: z.string().describe('GCP project ID'),
      instanceName: z.string().describe('Name of the instance to delete'),
    },
    async ({ projectId, instanceName }) => {
      try {
        const operation = await client.deleteSqlInstance(projectId, instanceName);
        return formatResponse(
          { success: true, message: `Instance ${instanceName} deletion initiated`, operation },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_restart_sql_instance',
    `Restart a Cloud SQL instance.

Args:
  - projectId: GCP project ID
  - instanceName: Name of the instance to restart

Returns:
  Operation details for the restart request.`,
    {
      projectId: z.string().describe('GCP project ID'),
      instanceName: z.string().describe('Name of the instance to restart'),
    },
    async ({ projectId, instanceName }) => {
      try {
        const operation = await client.restartSqlInstance(projectId, instanceName);
        return formatResponse(
          { success: true, message: `Instance ${instanceName} restart initiated`, operation },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Databases
  // ===========================================================================

  server.tool(
    'gcloud_list_databases',
    `List databases in a Cloud SQL instance.

Args:
  - projectId: GCP project ID
  - instanceName: Name of the SQL instance

Returns:
  List of databases in the instance.`,
    {
      projectId: z.string().describe('GCP project ID'),
      instanceName: z.string().describe('Name of the SQL instance'),
    },
    async ({ projectId, instanceName }) => {
      try {
        const result = await client.listDatabases(projectId, instanceName);
        return formatResponse(result.items || [], 'json', 'databases');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_get_database',
    `Get details of a specific database in a Cloud SQL instance.

Args:
  - projectId: GCP project ID
  - instanceName: Name of the SQL instance
  - databaseName: Name of the database

Returns:
  Database details including charset and collation.`,
    {
      projectId: z.string().describe('GCP project ID'),
      instanceName: z.string().describe('Name of the SQL instance'),
      databaseName: z.string().describe('Name of the database'),
    },
    async ({ projectId, instanceName, databaseName }) => {
      try {
        const database = await client.getDatabase(projectId, instanceName, databaseName);
        return formatResponse(database, 'json', 'database');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_create_database',
    `Create a new database in a Cloud SQL instance.

Args:
  - projectId: GCP project ID
  - instanceName: Name of the SQL instance
  - databaseName: Name for the new database

Returns:
  Operation details for the create request.`,
    {
      projectId: z.string().describe('GCP project ID'),
      instanceName: z.string().describe('Name of the SQL instance'),
      databaseName: z.string().describe('Name for the new database'),
    },
    async ({ projectId, instanceName, databaseName }) => {
      try {
        const operation = await client.createDatabase(projectId, instanceName, databaseName);
        return formatResponse(
          { success: true, message: `Database ${databaseName} creation initiated`, operation },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_delete_database',
    `Delete a database from a Cloud SQL instance.

Args:
  - projectId: GCP project ID
  - instanceName: Name of the SQL instance
  - databaseName: Name of the database to delete

Returns:
  Operation details for the delete request.`,
    {
      projectId: z.string().describe('GCP project ID'),
      instanceName: z.string().describe('Name of the SQL instance'),
      databaseName: z.string().describe('Name of the database to delete'),
    },
    async ({ projectId, instanceName, databaseName }) => {
      try {
        const operation = await client.deleteDatabase(projectId, instanceName, databaseName);
        return formatResponse(
          { success: true, message: `Database ${databaseName} deletion initiated`, operation },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
