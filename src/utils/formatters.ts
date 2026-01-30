/**
 * Response Formatting Utilities
 *
 * Functions for formatting API responses for MCP tool outputs.
 */

import type { GCloudApiError } from './errors.js';

/**
 * Format a successful response for MCP tools
 */
export function formatResponse(
  data: unknown,
  format: 'json' | 'markdown' = 'json',
  resourceType?: string
): { content: Array<{ type: 'text'; text: string }> } {
  if (format === 'markdown') {
    return {
      content: [{ type: 'text', text: formatAsMarkdown(data, resourceType) }],
    };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Format an error response for MCP tools
 */
export function formatError(error: unknown): {
  content: Array<{ type: 'text'; text: string }>;
  isError: true;
} {
  let message: string;

  if (error instanceof Error) {
    const apiError = error as GCloudApiError;
    message = JSON.stringify(
      {
        error: true,
        name: error.name,
        message: error.message,
        code: apiError.code,
        statusCode: apiError.statusCode,
      },
      null,
      2
    );
  } else {
    message = JSON.stringify({ error: true, message: String(error) }, null, 2);
  }

  return {
    content: [{ type: 'text', text: message }],
    isError: true,
  };
}

/**
 * Format data as markdown
 */
function formatAsMarkdown(data: unknown, resourceType?: string): string {
  if (Array.isArray(data)) {
    return formatArrayAsMarkdown(data, resourceType);
  }

  if (typeof data === 'object' && data !== null) {
    return formatObjectAsMarkdown(data as Record<string, unknown>, resourceType);
  }

  return String(data);
}

/**
 * Format an array as a markdown table
 */
function formatArrayAsMarkdown(items: unknown[], resourceType?: string): string {
  if (items.length === 0) {
    return `No ${resourceType || 'items'} found.`;
  }

  const firstItem = items[0];
  if (typeof firstItem !== 'object' || firstItem === null) {
    return items.map((item) => `- ${String(item)}`).join('\n');
  }

  // Get headers from the first item
  const keys = Object.keys(firstItem as Record<string, unknown>).slice(0, 6); // Limit columns
  const header = `| ${keys.join(' | ')} |`;
  const separator = `| ${keys.map(() => '---').join(' | ')} |`;

  const rows = items.map((item) => {
    const record = item as Record<string, unknown>;
    const values = keys.map((key) => {
      const value = record[key];
      if (value === null || value === undefined) return '-';
      if (typeof value === 'object') return '[object]';
      return String(value).substring(0, 50);
    });
    return `| ${values.join(' | ')} |`;
  });

  return [header, separator, ...rows].join('\n');
}

/**
 * Format an object as markdown key-value pairs
 */
function formatObjectAsMarkdown(obj: Record<string, unknown>, resourceType?: string): string {
  const title = resourceType ? `## ${resourceType}\n\n` : '';

  const lines = Object.entries(obj).map(([key, value]) => {
    if (value === null || value === undefined) {
      return `**${key}:** -`;
    }
    if (typeof value === 'object') {
      return `**${key}:**\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
    }
    return `**${key}:** ${String(value)}`;
  });

  return title + lines.join('\n\n');
}

/**
 * Truncate a string to a maximum length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength - 3)}...`;
}
