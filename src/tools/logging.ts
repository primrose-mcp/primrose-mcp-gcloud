/**
 * Cloud Logging Tools
 *
 * MCP tools for Google Cloud Logging operations including:
 * - Log Entries
 * - Logs
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { GCloudClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all Cloud Logging tools
 */
export function registerLoggingTools(server: McpServer, client: GCloudClient): void {
  // ===========================================================================
  // Log Entries
  // ===========================================================================

  server.tool(
    'gcloud_list_log_entries',
    `List log entries from Cloud Logging.

Args:
  - projectId: GCP project ID
  - filter: Optional filter expression (e.g., 'severity >= ERROR')
  - pageSize: Number of entries to return (default: 100)

Returns:
  List of log entries with their timestamp, severity, and payload.`,
    {
      projectId: z.string().describe('GCP project ID'),
      filter: z.string().optional().describe('Filter expression'),
      pageSize: z.number().int().min(1).max(1000).default(100).describe('Number of entries'),
    },
    async ({ projectId, filter, pageSize }) => {
      try {
        const result = await client.listLogEntries(projectId, filter, pageSize);
        return formatResponse(result.entries || [], 'json', 'log_entries');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_write_log_entry',
    `Write a log entry to Cloud Logging.

Args:
  - projectId: GCP project ID
  - logName: Name of the log
  - severity: Log severity (DEFAULT, DEBUG, INFO, NOTICE, WARNING, ERROR, CRITICAL, ALERT, EMERGENCY)
  - message: Log message (text payload)
  - labels: Optional labels for the entry

Returns:
  Confirmation of write.`,
    {
      projectId: z.string().describe('GCP project ID'),
      logName: z.string().describe('Name of the log'),
      severity: z
        .enum([
          'DEFAULT',
          'DEBUG',
          'INFO',
          'NOTICE',
          'WARNING',
          'ERROR',
          'CRITICAL',
          'ALERT',
          'EMERGENCY',
        ])
        .default('INFO')
        .describe('Log severity'),
      message: z.string().describe('Log message'),
      labels: z.record(z.string(), z.string()).optional().describe('Entry labels'),
    },
    async ({ projectId, logName, severity, message: textMessage, labels }) => {
      try {
        await client.writeLogEntries(projectId, logName, [
          {
            severity,
            textPayload: textMessage,
            labels: labels as Record<string, string> | undefined,
          },
        ]);
        return formatResponse(
          { success: true, message: 'Log entry written' },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_write_log_json',
    `Write a JSON log entry to Cloud Logging.

Args:
  - projectId: GCP project ID
  - logName: Name of the log
  - severity: Log severity
  - jsonPayload: JSON payload for the log entry
  - labels: Optional labels for the entry

Returns:
  Confirmation of write.`,
    {
      projectId: z.string().describe('GCP project ID'),
      logName: z.string().describe('Name of the log'),
      severity: z
        .enum([
          'DEFAULT',
          'DEBUG',
          'INFO',
          'NOTICE',
          'WARNING',
          'ERROR',
          'CRITICAL',
          'ALERT',
          'EMERGENCY',
        ])
        .default('INFO')
        .describe('Log severity'),
      jsonPayload: z.record(z.string(), z.unknown()).describe('JSON payload'),
      labels: z.record(z.string(), z.string()).optional().describe('Entry labels'),
    },
    async ({ projectId, logName, severity, jsonPayload, labels }) => {
      try {
        await client.writeLogEntries(projectId, logName, [
          {
            severity,
            jsonPayload: jsonPayload as object,
            labels: labels as Record<string, string> | undefined,
          },
        ]);
        return formatResponse(
          { success: true, message: 'JSON log entry written' },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Logs
  // ===========================================================================

  server.tool(
    'gcloud_list_logs',
    `List available logs in a project.

Args:
  - projectId: GCP project ID

Returns:
  List of log names.`,
    {
      projectId: z.string().describe('GCP project ID'),
    },
    async ({ projectId }) => {
      try {
        const result = await client.listLogs(projectId);
        return formatResponse(result.logNames || [], 'json', 'logs');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
