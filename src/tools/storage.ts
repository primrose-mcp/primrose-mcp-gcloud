/**
 * Cloud Storage Tools
 *
 * MCP tools for Google Cloud Storage operations including:
 * - Buckets
 * - Objects
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { GCloudClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all Cloud Storage tools
 */
export function registerStorageTools(server: McpServer, client: GCloudClient): void {
  // ===========================================================================
  // Buckets
  // ===========================================================================

  server.tool(
    'gcloud_list_buckets',
    `List Cloud Storage buckets in a project.

Args:
  - projectId: GCP project ID

Returns:
  List of buckets with their location and storage class.`,
    {
      projectId: z.string().describe('GCP project ID'),
    },
    async ({ projectId }) => {
      try {
        const result = await client.listBuckets(projectId);
        return formatResponse(result.items || [], 'json', 'buckets');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_get_bucket',
    `Get details of a specific Cloud Storage bucket.

Args:
  - bucketName: Name of the bucket

Returns:
  Detailed bucket information including location and storage class.`,
    {
      bucketName: z.string().describe('Name of the bucket'),
    },
    async ({ bucketName }) => {
      try {
        const bucket = await client.getBucket(bucketName);
        return formatResponse(bucket, 'json', 'bucket');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_create_bucket',
    `Create a new Cloud Storage bucket.

Args:
  - projectId: GCP project ID
  - name: Name for the new bucket (must be globally unique)
  - location: Location for the bucket (e.g., US, EU, us-central1)
  - storageClass: Storage class (STANDARD, NEARLINE, COLDLINE, ARCHIVE)

Returns:
  Created bucket details.`,
    {
      projectId: z.string().describe('GCP project ID'),
      name: z.string().describe('Name for the new bucket (globally unique)'),
      location: z.string().optional().describe('Bucket location (e.g., US, us-central1)'),
      storageClass: z
        .enum(['STANDARD', 'NEARLINE', 'COLDLINE', 'ARCHIVE'])
        .optional()
        .describe('Storage class'),
    },
    async ({ projectId, name, location, storageClass }) => {
      try {
        const bucket = await client.createBucket(projectId, {
          name,
          location,
          storageClass,
        });
        return formatResponse(
          { success: true, message: `Bucket ${name} created`, bucket },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_delete_bucket',
    `Delete a Cloud Storage bucket. Bucket must be empty.

Args:
  - bucketName: Name of the bucket to delete

Returns:
  Confirmation of deletion.`,
    {
      bucketName: z.string().describe('Name of the bucket to delete'),
    },
    async ({ bucketName }) => {
      try {
        await client.deleteBucket(bucketName);
        return formatResponse(
          { success: true, message: `Bucket ${bucketName} deleted` },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Objects
  // ===========================================================================

  server.tool(
    'gcloud_list_objects',
    `List objects in a Cloud Storage bucket.

Args:
  - bucketName: Name of the bucket
  - prefix: Filter objects by prefix (optional)
  - maxResults: Maximum number of results (optional)

Returns:
  List of objects with their size and content type.`,
    {
      bucketName: z.string().describe('Name of the bucket'),
      prefix: z.string().optional().describe('Filter objects by prefix'),
      maxResults: z.number().int().min(1).max(1000).optional().describe('Maximum results'),
    },
    async ({ bucketName, prefix, maxResults }) => {
      try {
        const result = await client.listObjects(bucketName, prefix, maxResults);
        return formatResponse(result.items || [], 'json', 'objects');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_get_object',
    `Get metadata of a specific object in Cloud Storage.

Args:
  - bucketName: Name of the bucket
  - objectName: Name of the object (full path)

Returns:
  Object metadata including size, content type, and timestamps.`,
    {
      bucketName: z.string().describe('Name of the bucket'),
      objectName: z.string().describe('Name of the object (full path)'),
    },
    async ({ bucketName, objectName }) => {
      try {
        const object = await client.getObject(bucketName, objectName);
        return formatResponse(object, 'json', 'object');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_delete_object',
    `Delete an object from Cloud Storage.

Args:
  - bucketName: Name of the bucket
  - objectName: Name of the object to delete

Returns:
  Confirmation of deletion.`,
    {
      bucketName: z.string().describe('Name of the bucket'),
      objectName: z.string().describe('Name of the object to delete'),
    },
    async ({ bucketName, objectName }) => {
      try {
        await client.deleteObject(bucketName, objectName);
        return formatResponse(
          { success: true, message: `Object ${objectName} deleted from ${bucketName}` },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_copy_object',
    `Copy an object within or between Cloud Storage buckets.

Args:
  - sourceBucket: Source bucket name
  - sourceObject: Source object name
  - destBucket: Destination bucket name
  - destObject: Destination object name

Returns:
  Copied object metadata.`,
    {
      sourceBucket: z.string().describe('Source bucket name'),
      sourceObject: z.string().describe('Source object name'),
      destBucket: z.string().describe('Destination bucket name'),
      destObject: z.string().describe('Destination object name'),
    },
    async ({ sourceBucket, sourceObject, destBucket, destObject }) => {
      try {
        const object = await client.copyObject(sourceBucket, sourceObject, destBucket, destObject);
        return formatResponse(
          { success: true, message: 'Object copied successfully', object },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
