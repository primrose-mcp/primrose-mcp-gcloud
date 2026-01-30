/**
 * Cloud Functions and Cloud Run Tools
 *
 * MCP tools for serverless compute operations including:
 * - Cloud Functions (v2)
 * - Cloud Run services
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { GCloudClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all Cloud Functions and Cloud Run tools
 */
export function registerFunctionsTools(server: McpServer, client: GCloudClient): void {
  // ===========================================================================
  // Cloud Functions
  // ===========================================================================

  server.tool(
    'gcloud_list_functions',
    `List Cloud Functions in a location.

Args:
  - projectId: GCP project ID
  - location: Location (e.g., us-central1)

Returns:
  List of functions with their state, runtime, and endpoint.`,
    {
      projectId: z.string().describe('GCP project ID'),
      location: z.string().describe('Location (e.g., us-central1)'),
    },
    async ({ projectId, location }) => {
      try {
        const result = await client.listFunctions(projectId, location);
        return formatResponse(result.functions || [], 'json', 'functions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_get_function',
    `Get details of a specific Cloud Function.

Args:
  - projectId: GCP project ID
  - location: Location
  - functionName: Name of the function

Returns:
  Detailed function information including runtime, trigger, and endpoint.`,
    {
      projectId: z.string().describe('GCP project ID'),
      location: z.string().describe('Location'),
      functionName: z.string().describe('Name of the function'),
    },
    async ({ projectId, location, functionName }) => {
      try {
        const func = await client.getFunction(projectId, location, functionName);
        return formatResponse(func, 'json', 'function');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_delete_function',
    `Delete a Cloud Function.

Args:
  - projectId: GCP project ID
  - location: Location
  - functionName: Name of the function to delete

Returns:
  Operation details for the delete request.`,
    {
      projectId: z.string().describe('GCP project ID'),
      location: z.string().describe('Location'),
      functionName: z.string().describe('Name of the function to delete'),
    },
    async ({ projectId, location, functionName }) => {
      try {
        const operation = await client.deleteFunction(projectId, location, functionName);
        return formatResponse(
          { success: true, message: `Function ${functionName} deletion initiated`, operation },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Cloud Run
  // ===========================================================================

  server.tool(
    'gcloud_list_cloud_run_services',
    `List Cloud Run services in a location.

Args:
  - projectId: GCP project ID
  - location: Location (e.g., us-central1)

Returns:
  List of services with their URL and status.`,
    {
      projectId: z.string().describe('GCP project ID'),
      location: z.string().describe('Location (e.g., us-central1)'),
    },
    async ({ projectId, location }) => {
      try {
        const result = await client.listCloudRunServices(projectId, location);
        return formatResponse(result.services || [], 'json', 'services');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_get_cloud_run_service',
    `Get details of a specific Cloud Run service.

Args:
  - projectId: GCP project ID
  - location: Location
  - serviceName: Name of the service

Returns:
  Detailed service information including URL, conditions, and labels.`,
    {
      projectId: z.string().describe('GCP project ID'),
      location: z.string().describe('Location'),
      serviceName: z.string().describe('Name of the service'),
    },
    async ({ projectId, location, serviceName }) => {
      try {
        const service = await client.getCloudRunService(projectId, location, serviceName);
        return formatResponse(service, 'json', 'service');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_delete_cloud_run_service',
    `Delete a Cloud Run service.

Args:
  - projectId: GCP project ID
  - location: Location
  - serviceName: Name of the service to delete

Returns:
  Operation details for the delete request.`,
    {
      projectId: z.string().describe('GCP project ID'),
      location: z.string().describe('Location'),
      serviceName: z.string().describe('Name of the service to delete'),
    },
    async ({ projectId, location, serviceName }) => {
      try {
        const operation = await client.deleteCloudRunService(projectId, location, serviceName);
        return formatResponse(
          { success: true, message: `Service ${serviceName} deletion initiated`, operation },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
