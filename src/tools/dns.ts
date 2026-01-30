/**
 * Cloud DNS Tools
 *
 * MCP tools for Google Cloud DNS operations including:
 * - Managed Zones
 * - Resource Record Sets
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { GCloudClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all Cloud DNS tools
 */
export function registerDnsTools(server: McpServer, client: GCloudClient): void {
  // ===========================================================================
  // Managed Zones
  // ===========================================================================

  server.tool(
    'gcloud_list_managed_zones',
    `List Cloud DNS managed zones in a project.

Args:
  - projectId: GCP project ID

Returns:
  List of managed zones with their DNS name and configuration.`,
    {
      projectId: z.string().describe('GCP project ID'),
    },
    async ({ projectId }) => {
      try {
        const result = await client.listManagedZones(projectId);
        return formatResponse(result.managedZones || [], 'json', 'managed_zones');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_get_managed_zone',
    `Get details of a specific Cloud DNS managed zone.

Args:
  - projectId: GCP project ID
  - zoneName: Name of the managed zone

Returns:
  Managed zone details including DNS name and visibility.`,
    {
      projectId: z.string().describe('GCP project ID'),
      zoneName: z.string().describe('Name of the managed zone'),
    },
    async ({ projectId, zoneName }) => {
      try {
        const zone = await client.getManagedZone(projectId, zoneName);
        return formatResponse(zone, 'json', 'managed_zone');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_create_managed_zone',
    `Create a new Cloud DNS managed zone.

Args:
  - projectId: GCP project ID
  - name: Name for the managed zone
  - dnsName: DNS name (e.g., example.com.)
  - description: Description of the zone
  - visibility: Zone visibility (public or private)

Returns:
  Created managed zone details.`,
    {
      projectId: z.string().describe('GCP project ID'),
      name: z.string().describe('Name for the managed zone'),
      dnsName: z.string().describe('DNS name (must end with a dot, e.g., example.com.)'),
      description: z.string().optional().describe('Zone description'),
      visibility: z.enum(['public', 'private']).default('public').describe('Zone visibility'),
    },
    async ({ projectId, name, dnsName, description, visibility }) => {
      try {
        const zone = await client.createManagedZone(projectId, {
          name,
          dnsName,
          description,
          visibility,
        });
        return formatResponse(
          { success: true, message: `Managed zone ${name} created`, zone },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_delete_managed_zone',
    `Delete a Cloud DNS managed zone. Zone must be empty (no records except NS and SOA).

Args:
  - projectId: GCP project ID
  - zoneName: Name of the managed zone to delete

Returns:
  Confirmation of deletion.`,
    {
      projectId: z.string().describe('GCP project ID'),
      zoneName: z.string().describe('Name of the managed zone to delete'),
    },
    async ({ projectId, zoneName }) => {
      try {
        await client.deleteManagedZone(projectId, zoneName);
        return formatResponse(
          { success: true, message: `Managed zone ${zoneName} deleted` },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Resource Record Sets
  // ===========================================================================

  server.tool(
    'gcloud_list_resource_record_sets',
    `List DNS resource record sets in a managed zone.

Args:
  - projectId: GCP project ID
  - zoneName: Name of the managed zone

Returns:
  List of DNS records with their type, TTL, and data.`,
    {
      projectId: z.string().describe('GCP project ID'),
      zoneName: z.string().describe('Name of the managed zone'),
    },
    async ({ projectId, zoneName }) => {
      try {
        const result = await client.listResourceRecordSets(projectId, zoneName);
        return formatResponse(result.rrsets || [], 'json', 'resource_record_sets');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_create_resource_record_set',
    `Create a DNS resource record set.

Args:
  - projectId: GCP project ID
  - zoneName: Name of the managed zone
  - name: Record name (e.g., www.example.com.)
  - type: Record type (A, AAAA, CNAME, MX, TXT, etc.)
  - ttl: Time to live in seconds
  - rrdatas: Array of record data values

Returns:
  Created resource record set.`,
    {
      projectId: z.string().describe('GCP project ID'),
      zoneName: z.string().describe('Name of the managed zone'),
      name: z.string().describe('Record name (must end with a dot)'),
      type: z.string().describe('Record type (A, AAAA, CNAME, MX, TXT, etc.)'),
      ttl: z.number().int().min(1).describe('TTL in seconds'),
      rrdatas: z.array(z.string()).describe('Record data values'),
    },
    async ({ projectId, zoneName, name, type, ttl, rrdatas }) => {
      try {
        const rrset = await client.createResourceRecordSet(projectId, zoneName, {
          name,
          type,
          ttl,
          rrdatas,
        });
        return formatResponse(
          { success: true, message: 'Resource record set created', rrset },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_delete_resource_record_set',
    `Delete a DNS resource record set.

Args:
  - projectId: GCP project ID
  - zoneName: Name of the managed zone
  - name: Record name to delete
  - type: Record type

Returns:
  Confirmation of deletion.`,
    {
      projectId: z.string().describe('GCP project ID'),
      zoneName: z.string().describe('Name of the managed zone'),
      name: z.string().describe('Record name to delete'),
      type: z.string().describe('Record type'),
    },
    async ({ projectId, zoneName, name, type }) => {
      try {
        await client.deleteResourceRecordSet(projectId, zoneName, name, type);
        return formatResponse(
          { success: true, message: `Record ${name} (${type}) deleted` },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
