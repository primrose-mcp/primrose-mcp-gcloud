/**
 * GKE (Google Kubernetes Engine) Tools
 *
 * MCP tools for GKE operations including:
 * - Clusters
 * - Node Pools
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { GCloudClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all GKE tools
 */
export function registerGkeTools(server: McpServer, client: GCloudClient): void {
  // ===========================================================================
  // Clusters
  // ===========================================================================

  server.tool(
    'gcloud_list_clusters',
    `List GKE clusters in a location.

Args:
  - projectId: GCP project ID
  - location: Location (e.g., us-central1 or us-central1-a, use '-' for all)

Returns:
  List of clusters with their status, version, and endpoint.`,
    {
      projectId: z.string().describe('GCP project ID'),
      location: z.string().describe('Location (region or zone, use "-" for all)'),
    },
    async ({ projectId, location }) => {
      try {
        const result = await client.listClusters(projectId, location);
        return formatResponse(result.clusters || [], 'json', 'clusters');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_get_cluster',
    `Get details of a specific GKE cluster.

Args:
  - projectId: GCP project ID
  - location: Location
  - clusterName: Name of the cluster

Returns:
  Detailed cluster information including version, endpoint, and node pools.`,
    {
      projectId: z.string().describe('GCP project ID'),
      location: z.string().describe('Location'),
      clusterName: z.string().describe('Name of the cluster'),
    },
    async ({ projectId, location, clusterName }) => {
      try {
        const cluster = await client.getCluster(projectId, location, clusterName);
        return formatResponse(cluster, 'json', 'cluster');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_delete_cluster',
    `Delete a GKE cluster.

Args:
  - projectId: GCP project ID
  - location: Location
  - clusterName: Name of the cluster to delete

Returns:
  Operation details for the delete request.`,
    {
      projectId: z.string().describe('GCP project ID'),
      location: z.string().describe('Location'),
      clusterName: z.string().describe('Name of the cluster to delete'),
    },
    async ({ projectId, location, clusterName }) => {
      try {
        const operation = await client.deleteCluster(projectId, location, clusterName);
        return formatResponse(
          { success: true, message: `Cluster ${clusterName} deletion initiated`, operation },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Node Pools
  // ===========================================================================

  server.tool(
    'gcloud_list_node_pools',
    `List node pools in a GKE cluster.

Args:
  - projectId: GCP project ID
  - location: Location
  - clusterName: Name of the cluster

Returns:
  List of node pools with their configuration and autoscaling settings.`,
    {
      projectId: z.string().describe('GCP project ID'),
      location: z.string().describe('Location'),
      clusterName: z.string().describe('Name of the cluster'),
    },
    async ({ projectId, location, clusterName }) => {
      try {
        const result = await client.listNodePools(projectId, location, clusterName);
        return formatResponse(result.nodePools || [], 'json', 'node_pools');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_get_node_pool',
    `Get details of a specific node pool in a GKE cluster.

Args:
  - projectId: GCP project ID
  - location: Location
  - clusterName: Name of the cluster
  - nodePoolName: Name of the node pool

Returns:
  Node pool details including configuration and autoscaling.`,
    {
      projectId: z.string().describe('GCP project ID'),
      location: z.string().describe('Location'),
      clusterName: z.string().describe('Name of the cluster'),
      nodePoolName: z.string().describe('Name of the node pool'),
    },
    async ({ projectId, location, clusterName, nodePoolName }) => {
      try {
        const nodePool = await client.getNodePool(projectId, location, clusterName, nodePoolName);
        return formatResponse(nodePool, 'json', 'node_pool');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
