/**
 * Compute Engine Tools
 *
 * MCP tools for Google Compute Engine operations including:
 * - Instances (VMs)
 * - Disks
 * - Networks
 * - Firewalls
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { GCloudClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all Compute Engine tools
 */
export function registerComputeTools(server: McpServer, client: GCloudClient): void {
  // ===========================================================================
  // Instances
  // ===========================================================================

  server.tool(
    'gcloud_list_instances',
    `List Compute Engine VM instances in a zone.

Args:
  - projectId: GCP project ID
  - zone: Compute zone (e.g., us-central1-a)

Returns:
  List of VM instances with their status, machine type, and network info.`,
    {
      projectId: z.string().describe('GCP project ID'),
      zone: z.string().describe('Compute zone (e.g., us-central1-a)'),
    },
    async ({ projectId, zone }) => {
      try {
        const result = await client.listInstances(projectId, zone);
        return formatResponse(result.items || [], 'json', 'instances');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_get_instance',
    `Get details of a specific Compute Engine VM instance.

Args:
  - projectId: GCP project ID
  - zone: Compute zone
  - instanceName: Name of the instance

Returns:
  Detailed instance information including status, machine type, disks, and network.`,
    {
      projectId: z.string().describe('GCP project ID'),
      zone: z.string().describe('Compute zone'),
      instanceName: z.string().describe('Name of the instance'),
    },
    async ({ projectId, zone, instanceName }) => {
      try {
        const instance = await client.getInstance(projectId, zone, instanceName);
        return formatResponse(instance, 'json', 'instance');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_start_instance',
    `Start a stopped Compute Engine VM instance.

Args:
  - projectId: GCP project ID
  - zone: Compute zone
  - instanceName: Name of the instance to start

Returns:
  Operation details for the start request.`,
    {
      projectId: z.string().describe('GCP project ID'),
      zone: z.string().describe('Compute zone'),
      instanceName: z.string().describe('Name of the instance to start'),
    },
    async ({ projectId, zone, instanceName }) => {
      try {
        const operation = await client.startInstance(projectId, zone, instanceName);
        return formatResponse(
          { success: true, message: `Instance ${instanceName} start initiated`, operation },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_stop_instance',
    `Stop a running Compute Engine VM instance.

Args:
  - projectId: GCP project ID
  - zone: Compute zone
  - instanceName: Name of the instance to stop

Returns:
  Operation details for the stop request.`,
    {
      projectId: z.string().describe('GCP project ID'),
      zone: z.string().describe('Compute zone'),
      instanceName: z.string().describe('Name of the instance to stop'),
    },
    async ({ projectId, zone, instanceName }) => {
      try {
        const operation = await client.stopInstance(projectId, zone, instanceName);
        return formatResponse(
          { success: true, message: `Instance ${instanceName} stop initiated`, operation },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_reset_instance',
    `Reset (reboot) a Compute Engine VM instance.

Args:
  - projectId: GCP project ID
  - zone: Compute zone
  - instanceName: Name of the instance to reset

Returns:
  Operation details for the reset request.`,
    {
      projectId: z.string().describe('GCP project ID'),
      zone: z.string().describe('Compute zone'),
      instanceName: z.string().describe('Name of the instance to reset'),
    },
    async ({ projectId, zone, instanceName }) => {
      try {
        const operation = await client.resetInstance(projectId, zone, instanceName);
        return formatResponse(
          { success: true, message: `Instance ${instanceName} reset initiated`, operation },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_delete_instance',
    `Delete a Compute Engine VM instance.

Args:
  - projectId: GCP project ID
  - zone: Compute zone
  - instanceName: Name of the instance to delete

Returns:
  Operation details for the delete request.`,
    {
      projectId: z.string().describe('GCP project ID'),
      zone: z.string().describe('Compute zone'),
      instanceName: z.string().describe('Name of the instance to delete'),
    },
    async ({ projectId, zone, instanceName }) => {
      try {
        const operation = await client.deleteInstance(projectId, zone, instanceName);
        return formatResponse(
          { success: true, message: `Instance ${instanceName} deletion initiated`, operation },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Disks
  // ===========================================================================

  server.tool(
    'gcloud_list_disks',
    `List Compute Engine persistent disks in a zone.

Args:
  - projectId: GCP project ID
  - zone: Compute zone

Returns:
  List of disks with their size, type, and status.`,
    {
      projectId: z.string().describe('GCP project ID'),
      zone: z.string().describe('Compute zone'),
    },
    async ({ projectId, zone }) => {
      try {
        const result = await client.listDisks(projectId, zone);
        return formatResponse(result.items || [], 'json', 'disks');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_get_disk',
    `Get details of a specific Compute Engine disk.

Args:
  - projectId: GCP project ID
  - zone: Compute zone
  - diskName: Name of the disk

Returns:
  Detailed disk information.`,
    {
      projectId: z.string().describe('GCP project ID'),
      zone: z.string().describe('Compute zone'),
      diskName: z.string().describe('Name of the disk'),
    },
    async ({ projectId, zone, diskName }) => {
      try {
        const disk = await client.getDisk(projectId, zone, diskName);
        return formatResponse(disk, 'json', 'disk');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_create_disk',
    `Create a new Compute Engine persistent disk.

Args:
  - projectId: GCP project ID
  - zone: Compute zone
  - name: Name for the new disk
  - sizeGb: Size in GB
  - type: Disk type (e.g., pd-standard, pd-ssd)
  - sourceImage: Source image for the disk (optional)

Returns:
  Operation details for the create request.`,
    {
      projectId: z.string().describe('GCP project ID'),
      zone: z.string().describe('Compute zone'),
      name: z.string().describe('Name for the new disk'),
      sizeGb: z.string().describe('Size in GB'),
      type: z.string().optional().describe('Disk type (pd-standard, pd-ssd)'),
      sourceImage: z.string().optional().describe('Source image for the disk'),
    },
    async ({ projectId, zone, name, sizeGb, type, sourceImage }) => {
      try {
        const operation = await client.createDisk(projectId, zone, {
          name,
          sizeGb,
          type,
          sourceImage,
        });
        return formatResponse(
          { success: true, message: `Disk ${name} creation initiated`, operation },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_delete_disk',
    `Delete a Compute Engine persistent disk.

Args:
  - projectId: GCP project ID
  - zone: Compute zone
  - diskName: Name of the disk to delete

Returns:
  Operation details for the delete request.`,
    {
      projectId: z.string().describe('GCP project ID'),
      zone: z.string().describe('Compute zone'),
      diskName: z.string().describe('Name of the disk to delete'),
    },
    async ({ projectId, zone, diskName }) => {
      try {
        const operation = await client.deleteDisk(projectId, zone, diskName);
        return formatResponse(
          { success: true, message: `Disk ${diskName} deletion initiated`, operation },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_resize_disk',
    `Resize a Compute Engine persistent disk (can only increase size).

Args:
  - projectId: GCP project ID
  - zone: Compute zone
  - diskName: Name of the disk
  - sizeGb: New size in GB (must be larger than current)

Returns:
  Operation details for the resize request.`,
    {
      projectId: z.string().describe('GCP project ID'),
      zone: z.string().describe('Compute zone'),
      diskName: z.string().describe('Name of the disk'),
      sizeGb: z.string().describe('New size in GB'),
    },
    async ({ projectId, zone, diskName, sizeGb }) => {
      try {
        const operation = await client.resizeDisk(projectId, zone, diskName, sizeGb);
        return formatResponse(
          { success: true, message: `Disk ${diskName} resize initiated`, operation },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Networks
  // ===========================================================================

  server.tool(
    'gcloud_list_networks',
    `List VPC networks in a project.

Args:
  - projectId: GCP project ID

Returns:
  List of networks with their configuration.`,
    {
      projectId: z.string().describe('GCP project ID'),
    },
    async ({ projectId }) => {
      try {
        const result = await client.listNetworks(projectId);
        return formatResponse(result.items || [], 'json', 'networks');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_get_network',
    `Get details of a specific VPC network.

Args:
  - projectId: GCP project ID
  - networkName: Name of the network

Returns:
  Detailed network information.`,
    {
      projectId: z.string().describe('GCP project ID'),
      networkName: z.string().describe('Name of the network'),
    },
    async ({ projectId, networkName }) => {
      try {
        const network = await client.getNetwork(projectId, networkName);
        return formatResponse(network, 'json', 'network');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_create_network',
    `Create a new VPC network.

Args:
  - projectId: GCP project ID
  - name: Name for the new network
  - autoCreateSubnetworks: Whether to auto-create subnets (default: true)

Returns:
  Operation details for the create request.`,
    {
      projectId: z.string().describe('GCP project ID'),
      name: z.string().describe('Name for the new network'),
      autoCreateSubnetworks: z.boolean().default(true).describe('Auto-create subnets'),
    },
    async ({ projectId, name, autoCreateSubnetworks }) => {
      try {
        const operation = await client.createNetwork(projectId, {
          name,
          autoCreateSubnetworks,
        });
        return formatResponse(
          { success: true, message: `Network ${name} creation initiated`, operation },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_delete_network',
    `Delete a VPC network.

Args:
  - projectId: GCP project ID
  - networkName: Name of the network to delete

Returns:
  Operation details for the delete request.`,
    {
      projectId: z.string().describe('GCP project ID'),
      networkName: z.string().describe('Name of the network to delete'),
    },
    async ({ projectId, networkName }) => {
      try {
        const operation = await client.deleteNetwork(projectId, networkName);
        return formatResponse(
          { success: true, message: `Network ${networkName} deletion initiated`, operation },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Firewalls
  // ===========================================================================

  server.tool(
    'gcloud_list_firewalls',
    `List firewall rules in a project.

Args:
  - projectId: GCP project ID

Returns:
  List of firewall rules with their configuration.`,
    {
      projectId: z.string().describe('GCP project ID'),
    },
    async ({ projectId }) => {
      try {
        const result = await client.listFirewalls(projectId);
        return formatResponse(result.items || [], 'json', 'firewalls');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_get_firewall',
    `Get details of a specific firewall rule.

Args:
  - projectId: GCP project ID
  - firewallName: Name of the firewall rule

Returns:
  Detailed firewall rule information.`,
    {
      projectId: z.string().describe('GCP project ID'),
      firewallName: z.string().describe('Name of the firewall rule'),
    },
    async ({ projectId, firewallName }) => {
      try {
        const firewall = await client.getFirewall(projectId, firewallName);
        return formatResponse(firewall, 'json', 'firewall');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_delete_firewall',
    `Delete a firewall rule.

Args:
  - projectId: GCP project ID
  - firewallName: Name of the firewall rule to delete

Returns:
  Operation details for the delete request.`,
    {
      projectId: z.string().describe('GCP project ID'),
      firewallName: z.string().describe('Name of the firewall rule to delete'),
    },
    async ({ projectId, firewallName }) => {
      try {
        const operation = await client.deleteFirewall(projectId, firewallName);
        return formatResponse(
          { success: true, message: `Firewall ${firewallName} deletion initiated`, operation },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
