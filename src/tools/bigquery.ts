/**
 * BigQuery Tools
 *
 * MCP tools for BigQuery operations including:
 * - Datasets
 * - Tables
 * - Queries
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { GCloudClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all BigQuery tools
 */
export function registerBigQueryTools(server: McpServer, client: GCloudClient): void {
  // ===========================================================================
  // Datasets
  // ===========================================================================

  server.tool(
    'gcloud_list_datasets',
    `List BigQuery datasets in a project.

Args:
  - projectId: GCP project ID

Returns:
  List of datasets with their location and metadata.`,
    {
      projectId: z.string().describe('GCP project ID'),
    },
    async ({ projectId }) => {
      try {
        const result = await client.listDatasets(projectId);
        return formatResponse(result.datasets || [], 'json', 'datasets');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_get_dataset',
    `Get details of a specific BigQuery dataset.

Args:
  - projectId: GCP project ID
  - datasetId: Dataset ID

Returns:
  Detailed dataset information.`,
    {
      projectId: z.string().describe('GCP project ID'),
      datasetId: z.string().describe('Dataset ID'),
    },
    async ({ projectId, datasetId }) => {
      try {
        const dataset = await client.getDataset(projectId, datasetId);
        return formatResponse(dataset, 'json', 'dataset');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_create_dataset',
    `Create a new BigQuery dataset.

Args:
  - projectId: GCP project ID
  - datasetId: ID for the new dataset
  - location: Location for the dataset (e.g., US, EU)

Returns:
  Created dataset details.`,
    {
      projectId: z.string().describe('GCP project ID'),
      datasetId: z.string().describe('ID for the new dataset'),
      location: z.string().optional().describe('Dataset location (e.g., US, EU)'),
    },
    async ({ projectId, datasetId, location }) => {
      try {
        const dataset = await client.createDataset(projectId, {
          datasetReference: { datasetId, projectId },
          location,
        });
        return formatResponse(
          { success: true, message: `Dataset ${datasetId} created`, dataset },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_delete_dataset',
    `Delete a BigQuery dataset.

Args:
  - projectId: GCP project ID
  - datasetId: Dataset ID to delete
  - deleteContents: Whether to delete all tables in the dataset (default: false)

Returns:
  Confirmation of deletion.`,
    {
      projectId: z.string().describe('GCP project ID'),
      datasetId: z.string().describe('Dataset ID to delete'),
      deleteContents: z.boolean().default(false).describe('Delete all tables in dataset'),
    },
    async ({ projectId, datasetId, deleteContents }) => {
      try {
        await client.deleteDataset(projectId, datasetId, deleteContents);
        return formatResponse(
          { success: true, message: `Dataset ${datasetId} deleted` },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Tables
  // ===========================================================================

  server.tool(
    'gcloud_list_tables',
    `List tables in a BigQuery dataset.

Args:
  - projectId: GCP project ID
  - datasetId: Dataset ID

Returns:
  List of tables with their type and row count.`,
    {
      projectId: z.string().describe('GCP project ID'),
      datasetId: z.string().describe('Dataset ID'),
    },
    async ({ projectId, datasetId }) => {
      try {
        const result = await client.listTables(projectId, datasetId);
        return formatResponse(result.tables || [], 'json', 'tables');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_get_table',
    `Get details of a specific BigQuery table.

Args:
  - projectId: GCP project ID
  - datasetId: Dataset ID
  - tableId: Table ID

Returns:
  Detailed table information including schema and row count.`,
    {
      projectId: z.string().describe('GCP project ID'),
      datasetId: z.string().describe('Dataset ID'),
      tableId: z.string().describe('Table ID'),
    },
    async ({ projectId, datasetId, tableId }) => {
      try {
        const table = await client.getTable(projectId, datasetId, tableId);
        return formatResponse(table, 'json', 'table');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Queries
  // ===========================================================================

  server.tool(
    'gcloud_bigquery_query',
    `Run a SQL query in BigQuery.

Args:
  - projectId: GCP project ID
  - query: SQL query to execute
  - useLegacySql: Use legacy SQL syntax (default: false)

Returns:
  Query results with schema and rows.`,
    {
      projectId: z.string().describe('GCP project ID'),
      query: z.string().describe('SQL query to execute'),
      useLegacySql: z.boolean().default(false).describe('Use legacy SQL syntax'),
    },
    async ({ projectId, query, useLegacySql }) => {
      try {
        const result = await client.runQuery(projectId, query, useLegacySql);
        return formatResponse(result, 'json', 'query_result');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
