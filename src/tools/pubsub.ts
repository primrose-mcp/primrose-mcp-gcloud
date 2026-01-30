/**
 * Pub/Sub Tools
 *
 * MCP tools for Google Cloud Pub/Sub operations including:
 * - Topics
 * - Subscriptions
 * - Messages
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { GCloudClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all Pub/Sub tools
 */
export function registerPubSubTools(server: McpServer, client: GCloudClient): void {
  // ===========================================================================
  // Topics
  // ===========================================================================

  server.tool(
    'gcloud_list_topics',
    `List Pub/Sub topics in a project.

Args:
  - projectId: GCP project ID

Returns:
  List of topics.`,
    {
      projectId: z.string().describe('GCP project ID'),
    },
    async ({ projectId }) => {
      try {
        const result = await client.listTopics(projectId);
        return formatResponse(result.topics || [], 'json', 'topics');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_get_topic',
    `Get details of a specific Pub/Sub topic.

Args:
  - projectId: GCP project ID
  - topicName: Name of the topic

Returns:
  Topic details.`,
    {
      projectId: z.string().describe('GCP project ID'),
      topicName: z.string().describe('Name of the topic'),
    },
    async ({ projectId, topicName }) => {
      try {
        const topic = await client.getTopic(projectId, topicName);
        return formatResponse(topic, 'json', 'topic');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_create_topic',
    `Create a new Pub/Sub topic.

Args:
  - projectId: GCP project ID
  - topicName: Name for the new topic

Returns:
  Created topic details.`,
    {
      projectId: z.string().describe('GCP project ID'),
      topicName: z.string().describe('Name for the new topic'),
    },
    async ({ projectId, topicName }) => {
      try {
        const topic = await client.createTopic(projectId, topicName);
        return formatResponse(
          { success: true, message: `Topic ${topicName} created`, topic },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_delete_topic',
    `Delete a Pub/Sub topic.

Args:
  - projectId: GCP project ID
  - topicName: Name of the topic to delete

Returns:
  Confirmation of deletion.`,
    {
      projectId: z.string().describe('GCP project ID'),
      topicName: z.string().describe('Name of the topic to delete'),
    },
    async ({ projectId, topicName }) => {
      try {
        await client.deleteTopic(projectId, topicName);
        return formatResponse(
          { success: true, message: `Topic ${topicName} deleted` },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_publish_message',
    `Publish a message to a Pub/Sub topic.

Args:
  - projectId: GCP project ID
  - topicName: Name of the topic
  - data: Message data (will be base64 encoded)
  - attributes: Optional message attributes (key-value pairs)

Returns:
  Published message ID.`,
    {
      projectId: z.string().describe('GCP project ID'),
      topicName: z.string().describe('Name of the topic'),
      data: z.string().describe('Message data'),
      attributes: z.record(z.string(), z.string()).optional().describe('Message attributes'),
    },
    async ({ projectId, topicName, data, attributes }) => {
      try {
        const result = await client.publishMessage(projectId, topicName, [
          {
            data: btoa(data),
            attributes: attributes as Record<string, string> | undefined,
          },
        ]);
        return formatResponse(
          { success: true, message: 'Message published', messageIds: result.messageIds },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Subscriptions
  // ===========================================================================

  server.tool(
    'gcloud_list_subscriptions',
    `List Pub/Sub subscriptions in a project.

Args:
  - projectId: GCP project ID

Returns:
  List of subscriptions with their configuration.`,
    {
      projectId: z.string().describe('GCP project ID'),
    },
    async ({ projectId }) => {
      try {
        const result = await client.listSubscriptions(projectId);
        return formatResponse(result.subscriptions || [], 'json', 'subscriptions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_get_subscription',
    `Get details of a specific Pub/Sub subscription.

Args:
  - projectId: GCP project ID
  - subscriptionName: Name of the subscription

Returns:
  Subscription details including topic and configuration.`,
    {
      projectId: z.string().describe('GCP project ID'),
      subscriptionName: z.string().describe('Name of the subscription'),
    },
    async ({ projectId, subscriptionName }) => {
      try {
        const subscription = await client.getSubscription(projectId, subscriptionName);
        return formatResponse(subscription, 'json', 'subscription');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_create_subscription',
    `Create a new Pub/Sub subscription.

Args:
  - projectId: GCP project ID
  - subscriptionName: Name for the new subscription
  - topicName: Name of the topic to subscribe to

Returns:
  Created subscription details.`,
    {
      projectId: z.string().describe('GCP project ID'),
      subscriptionName: z.string().describe('Name for the new subscription'),
      topicName: z.string().describe('Name of the topic to subscribe to'),
    },
    async ({ projectId, subscriptionName, topicName }) => {
      try {
        const subscription = await client.createSubscription(
          projectId,
          subscriptionName,
          topicName
        );
        return formatResponse(
          { success: true, message: `Subscription ${subscriptionName} created`, subscription },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_delete_subscription',
    `Delete a Pub/Sub subscription.

Args:
  - projectId: GCP project ID
  - subscriptionName: Name of the subscription to delete

Returns:
  Confirmation of deletion.`,
    {
      projectId: z.string().describe('GCP project ID'),
      subscriptionName: z.string().describe('Name of the subscription to delete'),
    },
    async ({ projectId, subscriptionName }) => {
      try {
        await client.deleteSubscription(projectId, subscriptionName);
        return formatResponse(
          { success: true, message: `Subscription ${subscriptionName} deleted` },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_pull_messages',
    `Pull messages from a Pub/Sub subscription.

Args:
  - projectId: GCP project ID
  - subscriptionName: Name of the subscription
  - maxMessages: Maximum number of messages to pull (default: 10)

Returns:
  List of received messages with their data and ack IDs.`,
    {
      projectId: z.string().describe('GCP project ID'),
      subscriptionName: z.string().describe('Name of the subscription'),
      maxMessages: z.number().int().min(1).max(1000).default(10).describe('Max messages to pull'),
    },
    async ({ projectId, subscriptionName, maxMessages }) => {
      try {
        const result = await client.pullMessages(projectId, subscriptionName, maxMessages);
        // Decode message data
        const messages = (result.receivedMessages || []).map((rm) => ({
          ackId: rm.ackId,
          messageId: rm.message?.messageId,
          data: rm.message?.data ? atob(rm.message.data) : undefined,
          attributes: rm.message?.attributes,
          publishTime: rm.message?.publishTime,
        }));
        return formatResponse(messages, 'json', 'messages');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'gcloud_acknowledge_messages',
    `Acknowledge messages from a Pub/Sub subscription.

Args:
  - projectId: GCP project ID
  - subscriptionName: Name of the subscription
  - ackIds: List of acknowledgment IDs from pulled messages

Returns:
  Confirmation of acknowledgment.`,
    {
      projectId: z.string().describe('GCP project ID'),
      subscriptionName: z.string().describe('Name of the subscription'),
      ackIds: z.array(z.string()).describe('List of ack IDs to acknowledge'),
    },
    async ({ projectId, subscriptionName, ackIds }) => {
      try {
        await client.acknowledgeMessages(projectId, subscriptionName, ackIds);
        return formatResponse(
          { success: true, message: `${ackIds.length} messages acknowledged` },
          'json'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
