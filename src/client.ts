/**
 * Google Cloud Platform API Client
 *
 * This file handles all HTTP communication with Google Cloud APIs.
 *
 * MULTI-TENANT: This client receives credentials per-request via TenantCredentials,
 * allowing a single server to serve multiple tenants with different access tokens.
 *
 * Base URLs:
 * - Compute Engine: https://compute.googleapis.com/compute/v1
 * - Cloud Storage: https://storage.googleapis.com/storage/v1
 * - Cloud Functions: https://cloudfunctions.googleapis.com/v2
 * - Cloud Run: https://run.googleapis.com/v2
 * - BigQuery: https://bigquery.googleapis.com/bigquery/v2
 * - Pub/Sub: https://pubsub.googleapis.com/v1
 * - Cloud SQL: https://sqladmin.googleapis.com/sql/v1beta4
 * - IAM: https://iam.googleapis.com/v1
 * - Secret Manager: https://secretmanager.googleapis.com/v1
 * - Cloud DNS: https://dns.googleapis.com/dns/v1
 * - GKE: https://container.googleapis.com/v1
 * - Cloud Logging: https://logging.googleapis.com/v2
 */

import type { TenantCredentials } from './types/env.js';
import {
  AuthenticationError,
  GCloudApiError,
  NotFoundError,
  PermissionDeniedError,
  RateLimitError,
} from './utils/errors.js';

// =============================================================================
// API Base URLs
// =============================================================================

const API_URLS = {
  compute: 'https://compute.googleapis.com/compute/v1',
  storage: 'https://storage.googleapis.com/storage/v1',
  functions: 'https://cloudfunctions.googleapis.com/v2',
  run: 'https://run.googleapis.com/v2',
  bigquery: 'https://bigquery.googleapis.com/bigquery/v2',
  pubsub: 'https://pubsub.googleapis.com/v1',
  sql: 'https://sqladmin.googleapis.com/sql/v1beta4',
  iam: 'https://iam.googleapis.com/v1',
  secretmanager: 'https://secretmanager.googleapis.com/v1',
  dns: 'https://dns.googleapis.com/dns/v1',
  container: 'https://container.googleapis.com/v1',
  logging: 'https://logging.googleapis.com/v2',
};

// =============================================================================
// GCloud Client Interface
// =============================================================================

export interface GCloudClient {
  // Connection
  testConnection(): Promise<{ connected: boolean; message: string }>;

  // =========================================================================
  // Compute Engine
  // =========================================================================
  listInstances(
    projectId: string,
    zone: string
  ): Promise<{ items?: ComputeInstance[]; nextPageToken?: string }>;
  getInstance(projectId: string, zone: string, instanceName: string): Promise<ComputeInstance>;
  createInstance(projectId: string, zone: string, instance: CreateInstanceRequest): Promise<Operation>;
  deleteInstance(projectId: string, zone: string, instanceName: string): Promise<Operation>;
  startInstance(projectId: string, zone: string, instanceName: string): Promise<Operation>;
  stopInstance(projectId: string, zone: string, instanceName: string): Promise<Operation>;
  resetInstance(projectId: string, zone: string, instanceName: string): Promise<Operation>;

  // Disks
  listDisks(projectId: string, zone: string): Promise<{ items?: Disk[]; nextPageToken?: string }>;
  getDisk(projectId: string, zone: string, diskName: string): Promise<Disk>;
  createDisk(projectId: string, zone: string, disk: CreateDiskRequest): Promise<Operation>;
  deleteDisk(projectId: string, zone: string, diskName: string): Promise<Operation>;
  resizeDisk(projectId: string, zone: string, diskName: string, sizeGb: string): Promise<Operation>;

  // Networks
  listNetworks(projectId: string): Promise<{ items?: Network[]; nextPageToken?: string }>;
  getNetwork(projectId: string, networkName: string): Promise<Network>;
  createNetwork(projectId: string, network: CreateNetworkRequest): Promise<Operation>;
  deleteNetwork(projectId: string, networkName: string): Promise<Operation>;

  // Firewalls
  listFirewalls(projectId: string): Promise<{ items?: Firewall[]; nextPageToken?: string }>;
  getFirewall(projectId: string, firewallName: string): Promise<Firewall>;
  createFirewall(projectId: string, firewall: CreateFirewallRequest): Promise<Operation>;
  deleteFirewall(projectId: string, firewallName: string): Promise<Operation>;

  // =========================================================================
  // Cloud Storage
  // =========================================================================
  listBuckets(projectId: string): Promise<{ items?: Bucket[]; nextPageToken?: string }>;
  getBucket(bucketName: string): Promise<Bucket>;
  createBucket(projectId: string, bucket: CreateBucketRequest): Promise<Bucket>;
  deleteBucket(bucketName: string): Promise<void>;

  listObjects(
    bucketName: string,
    prefix?: string,
    maxResults?: number
  ): Promise<{ items?: StorageObject[]; nextPageToken?: string }>;
  getObject(bucketName: string, objectName: string): Promise<StorageObject>;
  deleteObject(bucketName: string, objectName: string): Promise<void>;
  copyObject(
    sourceBucket: string,
    sourceObject: string,
    destBucket: string,
    destObject: string
  ): Promise<StorageObject>;

  // =========================================================================
  // Cloud Functions
  // =========================================================================
  listFunctions(
    projectId: string,
    location: string
  ): Promise<{ functions?: CloudFunction[]; nextPageToken?: string }>;
  getFunction(projectId: string, location: string, functionName: string): Promise<CloudFunction>;
  deleteFunction(projectId: string, location: string, functionName: string): Promise<Operation>;

  // =========================================================================
  // Cloud Run
  // =========================================================================
  listCloudRunServices(
    projectId: string,
    location: string
  ): Promise<{ services?: CloudRunService[]; nextPageToken?: string }>;
  getCloudRunService(
    projectId: string,
    location: string,
    serviceName: string
  ): Promise<CloudRunService>;
  deleteCloudRunService(
    projectId: string,
    location: string,
    serviceName: string
  ): Promise<Operation>;

  // =========================================================================
  // BigQuery
  // =========================================================================
  listDatasets(projectId: string): Promise<{ datasets?: Dataset[]; nextPageToken?: string }>;
  getDataset(projectId: string, datasetId: string): Promise<Dataset>;
  createDataset(projectId: string, dataset: CreateDatasetRequest): Promise<Dataset>;
  deleteDataset(projectId: string, datasetId: string, deleteContents?: boolean): Promise<void>;

  listTables(
    projectId: string,
    datasetId: string
  ): Promise<{ tables?: Table[]; nextPageToken?: string }>;
  getTable(projectId: string, datasetId: string, tableId: string): Promise<Table>;

  runQuery(projectId: string, query: string, useLegacySql?: boolean): Promise<QueryResponse>;

  // =========================================================================
  // Pub/Sub
  // =========================================================================
  listTopics(projectId: string): Promise<{ topics?: Topic[]; nextPageToken?: string }>;
  getTopic(projectId: string, topicName: string): Promise<Topic>;
  createTopic(projectId: string, topicName: string): Promise<Topic>;
  deleteTopic(projectId: string, topicName: string): Promise<void>;
  publishMessage(projectId: string, topicName: string, messages: PubSubMessage[]): Promise<PublishResponse>;

  listSubscriptions(
    projectId: string
  ): Promise<{ subscriptions?: Subscription[]; nextPageToken?: string }>;
  getSubscription(projectId: string, subscriptionName: string): Promise<Subscription>;
  createSubscription(
    projectId: string,
    subscriptionName: string,
    topicName: string
  ): Promise<Subscription>;
  deleteSubscription(projectId: string, subscriptionName: string): Promise<void>;
  pullMessages(projectId: string, subscriptionName: string, maxMessages?: number): Promise<PullResponse>;
  acknowledgeMessages(projectId: string, subscriptionName: string, ackIds: string[]): Promise<void>;

  // =========================================================================
  // Cloud SQL
  // =========================================================================
  listSqlInstances(projectId: string): Promise<{ items?: SqlInstance[]; nextPageToken?: string }>;
  getSqlInstance(projectId: string, instanceName: string): Promise<SqlInstance>;
  deleteSqlInstance(projectId: string, instanceName: string): Promise<Operation>;
  restartSqlInstance(projectId: string, instanceName: string): Promise<Operation>;

  listDatabases(
    projectId: string,
    instanceName: string
  ): Promise<{ items?: SqlDatabase[]; nextPageToken?: string }>;
  getDatabase(projectId: string, instanceName: string, databaseName: string): Promise<SqlDatabase>;
  createDatabase(
    projectId: string,
    instanceName: string,
    databaseName: string
  ): Promise<Operation>;
  deleteDatabase(
    projectId: string,
    instanceName: string,
    databaseName: string
  ): Promise<Operation>;

  // =========================================================================
  // IAM
  // =========================================================================
  listServiceAccounts(
    projectId: string
  ): Promise<{ accounts?: ServiceAccount[]; nextPageToken?: string }>;
  getServiceAccount(projectId: string, email: string): Promise<ServiceAccount>;
  createServiceAccount(
    projectId: string,
    accountId: string,
    displayName?: string
  ): Promise<ServiceAccount>;
  deleteServiceAccount(projectId: string, email: string): Promise<void>;

  getProjectIamPolicy(projectId: string): Promise<IamPolicy>;
  setProjectIamPolicy(projectId: string, policy: IamPolicy): Promise<IamPolicy>;

  listRoles(projectId?: string): Promise<{ roles?: Role[]; nextPageToken?: string }>;

  // =========================================================================
  // Secret Manager
  // =========================================================================
  listSecrets(projectId: string): Promise<{ secrets?: Secret[]; nextPageToken?: string }>;
  getSecret(projectId: string, secretName: string): Promise<Secret>;
  createSecret(projectId: string, secretId: string, replication?: SecretReplication): Promise<Secret>;
  deleteSecret(projectId: string, secretName: string): Promise<void>;

  listSecretVersions(
    projectId: string,
    secretName: string
  ): Promise<{ versions?: SecretVersion[]; nextPageToken?: string }>;
  accessSecretVersion(projectId: string, secretName: string, version?: string): Promise<SecretPayload>;
  addSecretVersion(projectId: string, secretName: string, payload: string): Promise<SecretVersion>;

  // =========================================================================
  // Cloud DNS
  // =========================================================================
  listManagedZones(projectId: string): Promise<{ managedZones?: ManagedZone[]; nextPageToken?: string }>;
  getManagedZone(projectId: string, zoneName: string): Promise<ManagedZone>;
  createManagedZone(projectId: string, zone: CreateManagedZoneRequest): Promise<ManagedZone>;
  deleteManagedZone(projectId: string, zoneName: string): Promise<void>;

  listResourceRecordSets(
    projectId: string,
    zoneName: string
  ): Promise<{ rrsets?: ResourceRecordSet[]; nextPageToken?: string }>;
  createResourceRecordSet(
    projectId: string,
    zoneName: string,
    rrset: ResourceRecordSet
  ): Promise<ResourceRecordSet>;
  deleteResourceRecordSet(
    projectId: string,
    zoneName: string,
    name: string,
    type: string
  ): Promise<void>;

  // =========================================================================
  // GKE (Kubernetes Engine)
  // =========================================================================
  listClusters(projectId: string, location: string): Promise<{ clusters?: GkeCluster[] }>;
  getCluster(projectId: string, location: string, clusterName: string): Promise<GkeCluster>;
  deleteCluster(projectId: string, location: string, clusterName: string): Promise<Operation>;

  listNodePools(
    projectId: string,
    location: string,
    clusterName: string
  ): Promise<{ nodePools?: NodePool[] }>;
  getNodePool(
    projectId: string,
    location: string,
    clusterName: string,
    nodePoolName: string
  ): Promise<NodePool>;

  // =========================================================================
  // Cloud Logging
  // =========================================================================
  listLogEntries(
    projectId: string,
    filter?: string,
    pageSize?: number
  ): Promise<{ entries?: LogEntry[]; nextPageToken?: string }>;
  writeLogEntries(projectId: string, logName: string, entries: WriteLogEntry[]): Promise<void>;
  listLogs(projectId: string): Promise<{ logNames?: string[]; nextPageToken?: string }>;
}

// =============================================================================
// Type Definitions
// =============================================================================

// Compute Engine Types
export interface ComputeInstance {
  id?: string;
  name?: string;
  zone?: string;
  machineType?: string;
  status?: string;
  networkInterfaces?: NetworkInterface[];
  disks?: AttachedDisk[];
  creationTimestamp?: string;
  selfLink?: string;
}

export interface NetworkInterface {
  network?: string;
  networkIP?: string;
  accessConfigs?: AccessConfig[];
}

export interface AccessConfig {
  type?: string;
  name?: string;
  natIP?: string;
}

export interface AttachedDisk {
  source?: string;
  boot?: boolean;
  autoDelete?: boolean;
}

export interface CreateInstanceRequest {
  name: string;
  machineType: string;
  disks: AttachedDisk[];
  networkInterfaces: NetworkInterface[];
}

export interface Disk {
  id?: string;
  name?: string;
  sizeGb?: string;
  type?: string;
  status?: string;
  zone?: string;
  sourceImage?: string;
  creationTimestamp?: string;
}

export interface CreateDiskRequest {
  name: string;
  sizeGb: string;
  type?: string;
  sourceImage?: string;
}

export interface Network {
  id?: string;
  name?: string;
  autoCreateSubnetworks?: boolean;
  subnetworks?: string[];
  creationTimestamp?: string;
}

export interface CreateNetworkRequest {
  name: string;
  autoCreateSubnetworks?: boolean;
}

export interface Firewall {
  id?: string;
  name?: string;
  network?: string;
  direction?: string;
  allowed?: FirewallRule[];
  denied?: FirewallRule[];
  sourceRanges?: string[];
  targetTags?: string[];
  creationTimestamp?: string;
}

export interface FirewallRule {
  IPProtocol?: string;
  ports?: string[];
}

export interface CreateFirewallRequest {
  name: string;
  network: string;
  direction?: string;
  allowed?: FirewallRule[];
  sourceRanges?: string[];
  targetTags?: string[];
}

export interface Operation {
  id?: string;
  name?: string;
  status?: string;
  operationType?: string;
  targetLink?: string;
  progress?: number;
  error?: { errors?: Array<{ code?: string; message?: string }> };
}

// Cloud Storage Types
export interface Bucket {
  id?: string;
  name?: string;
  location?: string;
  storageClass?: string;
  timeCreated?: string;
  updated?: string;
}

export interface CreateBucketRequest {
  name: string;
  location?: string;
  storageClass?: string;
}

export interface StorageObject {
  id?: string;
  name?: string;
  bucket?: string;
  size?: string;
  contentType?: string;
  timeCreated?: string;
  updated?: string;
  md5Hash?: string;
}

// Cloud Functions Types
export interface CloudFunction {
  name?: string;
  description?: string;
  state?: string;
  buildConfig?: {
    runtime?: string;
    entryPoint?: string;
    source?: object;
  };
  serviceConfig?: {
    uri?: string;
    serviceAccountEmail?: string;
  };
  createTime?: string;
  updateTime?: string;
}

// Cloud Run Types
export interface CloudRunService {
  name?: string;
  description?: string;
  uri?: string;
  generation?: string;
  labels?: Record<string, string>;
  createTime?: string;
  updateTime?: string;
  conditions?: Array<{ type?: string; state?: string }>;
}

// BigQuery Types
export interface Dataset {
  id?: string;
  datasetReference?: {
    datasetId?: string;
    projectId?: string;
  };
  location?: string;
  creationTime?: string;
  lastModifiedTime?: string;
}

export interface CreateDatasetRequest {
  datasetReference: {
    datasetId: string;
    projectId?: string;
  };
  location?: string;
}

export interface Table {
  id?: string;
  tableReference?: {
    tableId?: string;
    datasetId?: string;
    projectId?: string;
  };
  type?: string;
  creationTime?: string;
  numRows?: string;
  numBytes?: string;
}

export interface QueryResponse {
  jobComplete?: boolean;
  schema?: { fields?: Array<{ name?: string; type?: string }> };
  rows?: Array<{ f?: Array<{ v?: string }> }>;
  totalRows?: string;
  totalBytesProcessed?: string;
}

// Pub/Sub Types
export interface Topic {
  name?: string;
  labels?: Record<string, string>;
}

export interface Subscription {
  name?: string;
  topic?: string;
  ackDeadlineSeconds?: number;
  messageRetentionDuration?: string;
}

export interface PubSubMessage {
  data?: string;
  attributes?: Record<string, string>;
}

export interface PublishResponse {
  messageIds?: string[];
}

export interface PullResponse {
  receivedMessages?: Array<{
    ackId?: string;
    message?: {
      data?: string;
      attributes?: Record<string, string>;
      messageId?: string;
      publishTime?: string;
    };
  }>;
}

// Cloud SQL Types
export interface SqlInstance {
  name?: string;
  databaseVersion?: string;
  region?: string;
  state?: string;
  ipAddresses?: Array<{ type?: string; ipAddress?: string }>;
  settings?: {
    tier?: string;
    dataDiskSizeGb?: string;
  };
}

export interface SqlDatabase {
  name?: string;
  instance?: string;
  charset?: string;
  collation?: string;
}

// IAM Types
export interface ServiceAccount {
  name?: string;
  email?: string;
  displayName?: string;
  disabled?: boolean;
}

export interface IamPolicy {
  version?: number;
  bindings?: Array<{
    role?: string;
    members?: string[];
  }>;
  etag?: string;
}

export interface Role {
  name?: string;
  title?: string;
  description?: string;
  includedPermissions?: string[];
}

// Secret Manager Types
export interface Secret {
  name?: string;
  replication?: SecretReplication;
  createTime?: string;
  labels?: Record<string, string>;
}

export interface SecretReplication {
  automatic?: object;
  userManaged?: {
    replicas?: Array<{ location?: string }>;
  };
}

export interface SecretVersion {
  name?: string;
  state?: string;
  createTime?: string;
}

export interface SecretPayload {
  data?: string;
}

// Cloud DNS Types
export interface ManagedZone {
  id?: string;
  name?: string;
  dnsName?: string;
  description?: string;
  visibility?: string;
  creationTime?: string;
}

export interface CreateManagedZoneRequest {
  name: string;
  dnsName: string;
  description?: string;
  visibility?: string;
}

export interface ResourceRecordSet {
  name?: string;
  type?: string;
  ttl?: number;
  rrdatas?: string[];
}

// GKE Types
export interface GkeCluster {
  name?: string;
  location?: string;
  status?: string;
  currentMasterVersion?: string;
  currentNodeVersion?: string;
  endpoint?: string;
  nodeConfig?: object;
  nodePools?: NodePool[];
  createTime?: string;
}

export interface NodePool {
  name?: string;
  status?: string;
  initialNodeCount?: number;
  config?: object;
  autoscaling?: {
    enabled?: boolean;
    minNodeCount?: number;
    maxNodeCount?: number;
  };
}

// Cloud Logging Types
export interface LogEntry {
  logName?: string;
  resource?: { type?: string; labels?: Record<string, string> };
  timestamp?: string;
  severity?: string;
  textPayload?: string;
  jsonPayload?: object;
}

export interface WriteLogEntry {
  severity?: string;
  textPayload?: string;
  jsonPayload?: object;
  labels?: Record<string, string>;
}

// =============================================================================
// GCloud Client Implementation
// =============================================================================

class GCloudClientImpl implements GCloudClient {
  private credentials: TenantCredentials;

  constructor(credentials: TenantCredentials) {
    this.credentials = credentials;
  }

  // ===========================================================================
  // HTTP Request Helper
  // ===========================================================================

  private getAuthHeaders(): Record<string, string> {
    if (!this.credentials.accessToken) {
      throw new AuthenticationError(
        'No access token provided. Include X-GCloud-Access-Token header.'
      );
    }

    return {
      Authorization: `Bearer ${this.credentials.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError('Rate limit exceeded', retryAfter ? parseInt(retryAfter, 10) : 60);
    }

    // Handle authentication errors
    if (response.status === 401) {
      throw new AuthenticationError('Authentication failed. Check your access token.');
    }

    // Handle permission errors
    if (response.status === 403) {
      throw new PermissionDeniedError('Permission denied. Check your IAM permissions.');
    }

    // Handle not found
    if (response.status === 404) {
      throw new NotFoundError('Resource', url);
    }

    // Handle other errors
    if (!response.ok) {
      const errorBody = await response.text();
      let message = `API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        message = errorJson.error?.message || errorJson.message || message;
      } catch {
        // Use default message
      }
      throw new GCloudApiError(message, response.status);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  // ===========================================================================
  // Connection
  // ===========================================================================

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      // Try to list projects to verify connectivity
      const projectId = this.credentials.projectId;
      if (projectId) {
        await this.request(`${API_URLS.compute}/projects/${projectId}`);
        return { connected: true, message: `Successfully connected to GCP project: ${projectId}` };
      }
      return {
        connected: false,
        message: 'No project ID provided. Set X-GCloud-Project-ID header.',
      };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  // ===========================================================================
  // Compute Engine - Instances
  // ===========================================================================

  async listInstances(
    projectId: string,
    zone: string
  ): Promise<{ items?: ComputeInstance[]; nextPageToken?: string }> {
    return this.request(`${API_URLS.compute}/projects/${projectId}/zones/${zone}/instances`);
  }

  async getInstance(projectId: string, zone: string, instanceName: string): Promise<ComputeInstance> {
    return this.request(
      `${API_URLS.compute}/projects/${projectId}/zones/${zone}/instances/${instanceName}`
    );
  }

  async createInstance(
    projectId: string,
    zone: string,
    instance: CreateInstanceRequest
  ): Promise<Operation> {
    return this.request(`${API_URLS.compute}/projects/${projectId}/zones/${zone}/instances`, {
      method: 'POST',
      body: JSON.stringify(instance),
    });
  }

  async deleteInstance(projectId: string, zone: string, instanceName: string): Promise<Operation> {
    return this.request(
      `${API_URLS.compute}/projects/${projectId}/zones/${zone}/instances/${instanceName}`,
      { method: 'DELETE' }
    );
  }

  async startInstance(projectId: string, zone: string, instanceName: string): Promise<Operation> {
    return this.request(
      `${API_URLS.compute}/projects/${projectId}/zones/${zone}/instances/${instanceName}/start`,
      { method: 'POST' }
    );
  }

  async stopInstance(projectId: string, zone: string, instanceName: string): Promise<Operation> {
    return this.request(
      `${API_URLS.compute}/projects/${projectId}/zones/${zone}/instances/${instanceName}/stop`,
      { method: 'POST' }
    );
  }

  async resetInstance(projectId: string, zone: string, instanceName: string): Promise<Operation> {
    return this.request(
      `${API_URLS.compute}/projects/${projectId}/zones/${zone}/instances/${instanceName}/reset`,
      { method: 'POST' }
    );
  }

  // ===========================================================================
  // Compute Engine - Disks
  // ===========================================================================

  async listDisks(
    projectId: string,
    zone: string
  ): Promise<{ items?: Disk[]; nextPageToken?: string }> {
    return this.request(`${API_URLS.compute}/projects/${projectId}/zones/${zone}/disks`);
  }

  async getDisk(projectId: string, zone: string, diskName: string): Promise<Disk> {
    return this.request(
      `${API_URLS.compute}/projects/${projectId}/zones/${zone}/disks/${diskName}`
    );
  }

  async createDisk(
    projectId: string,
    zone: string,
    disk: CreateDiskRequest
  ): Promise<Operation> {
    return this.request(`${API_URLS.compute}/projects/${projectId}/zones/${zone}/disks`, {
      method: 'POST',
      body: JSON.stringify(disk),
    });
  }

  async deleteDisk(projectId: string, zone: string, diskName: string): Promise<Operation> {
    return this.request(
      `${API_URLS.compute}/projects/${projectId}/zones/${zone}/disks/${diskName}`,
      { method: 'DELETE' }
    );
  }

  async resizeDisk(
    projectId: string,
    zone: string,
    diskName: string,
    sizeGb: string
  ): Promise<Operation> {
    return this.request(
      `${API_URLS.compute}/projects/${projectId}/zones/${zone}/disks/${diskName}/resize`,
      {
        method: 'POST',
        body: JSON.stringify({ sizeGb }),
      }
    );
  }

  // ===========================================================================
  // Compute Engine - Networks
  // ===========================================================================

  async listNetworks(
    projectId: string
  ): Promise<{ items?: Network[]; nextPageToken?: string }> {
    return this.request(`${API_URLS.compute}/projects/${projectId}/global/networks`);
  }

  async getNetwork(projectId: string, networkName: string): Promise<Network> {
    return this.request(
      `${API_URLS.compute}/projects/${projectId}/global/networks/${networkName}`
    );
  }

  async createNetwork(
    projectId: string,
    network: CreateNetworkRequest
  ): Promise<Operation> {
    return this.request(`${API_URLS.compute}/projects/${projectId}/global/networks`, {
      method: 'POST',
      body: JSON.stringify(network),
    });
  }

  async deleteNetwork(projectId: string, networkName: string): Promise<Operation> {
    return this.request(
      `${API_URLS.compute}/projects/${projectId}/global/networks/${networkName}`,
      { method: 'DELETE' }
    );
  }

  // ===========================================================================
  // Compute Engine - Firewalls
  // ===========================================================================

  async listFirewalls(
    projectId: string
  ): Promise<{ items?: Firewall[]; nextPageToken?: string }> {
    return this.request(`${API_URLS.compute}/projects/${projectId}/global/firewalls`);
  }

  async getFirewall(projectId: string, firewallName: string): Promise<Firewall> {
    return this.request(
      `${API_URLS.compute}/projects/${projectId}/global/firewalls/${firewallName}`
    );
  }

  async createFirewall(
    projectId: string,
    firewall: CreateFirewallRequest
  ): Promise<Operation> {
    return this.request(`${API_URLS.compute}/projects/${projectId}/global/firewalls`, {
      method: 'POST',
      body: JSON.stringify(firewall),
    });
  }

  async deleteFirewall(projectId: string, firewallName: string): Promise<Operation> {
    return this.request(
      `${API_URLS.compute}/projects/${projectId}/global/firewalls/${firewallName}`,
      { method: 'DELETE' }
    );
  }

  // ===========================================================================
  // Cloud Storage - Buckets
  // ===========================================================================

  async listBuckets(
    projectId: string
  ): Promise<{ items?: Bucket[]; nextPageToken?: string }> {
    return this.request(`${API_URLS.storage}/b?project=${projectId}`);
  }

  async getBucket(bucketName: string): Promise<Bucket> {
    return this.request(`${API_URLS.storage}/b/${bucketName}`);
  }

  async createBucket(projectId: string, bucket: CreateBucketRequest): Promise<Bucket> {
    return this.request(`${API_URLS.storage}/b?project=${projectId}`, {
      method: 'POST',
      body: JSON.stringify(bucket),
    });
  }

  async deleteBucket(bucketName: string): Promise<void> {
    await this.request(`${API_URLS.storage}/b/${bucketName}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Cloud Storage - Objects
  // ===========================================================================

  async listObjects(
    bucketName: string,
    prefix?: string,
    maxResults?: number
  ): Promise<{ items?: StorageObject[]; nextPageToken?: string }> {
    const params = new URLSearchParams();
    if (prefix) params.set('prefix', prefix);
    if (maxResults) params.set('maxResults', String(maxResults));
    const query = params.toString();
    return this.request(`${API_URLS.storage}/b/${bucketName}/o${query ? `?${query}` : ''}`);
  }

  async getObject(bucketName: string, objectName: string): Promise<StorageObject> {
    return this.request(`${API_URLS.storage}/b/${bucketName}/o/${encodeURIComponent(objectName)}`);
  }

  async deleteObject(bucketName: string, objectName: string): Promise<void> {
    await this.request(
      `${API_URLS.storage}/b/${bucketName}/o/${encodeURIComponent(objectName)}`,
      { method: 'DELETE' }
    );
  }

  async copyObject(
    sourceBucket: string,
    sourceObject: string,
    destBucket: string,
    destObject: string
  ): Promise<StorageObject> {
    return this.request(
      `${API_URLS.storage}/b/${sourceBucket}/o/${encodeURIComponent(sourceObject)}/copyTo/b/${destBucket}/o/${encodeURIComponent(destObject)}`,
      { method: 'POST' }
    );
  }

  // ===========================================================================
  // Cloud Functions
  // ===========================================================================

  async listFunctions(
    projectId: string,
    location: string
  ): Promise<{ functions?: CloudFunction[]; nextPageToken?: string }> {
    return this.request(
      `${API_URLS.functions}/projects/${projectId}/locations/${location}/functions`
    );
  }

  async getFunction(
    projectId: string,
    location: string,
    functionName: string
  ): Promise<CloudFunction> {
    return this.request(
      `${API_URLS.functions}/projects/${projectId}/locations/${location}/functions/${functionName}`
    );
  }

  async deleteFunction(
    projectId: string,
    location: string,
    functionName: string
  ): Promise<Operation> {
    return this.request(
      `${API_URLS.functions}/projects/${projectId}/locations/${location}/functions/${functionName}`,
      { method: 'DELETE' }
    );
  }

  // ===========================================================================
  // Cloud Run
  // ===========================================================================

  async listCloudRunServices(
    projectId: string,
    location: string
  ): Promise<{ services?: CloudRunService[]; nextPageToken?: string }> {
    return this.request(
      `${API_URLS.run}/projects/${projectId}/locations/${location}/services`
    );
  }

  async getCloudRunService(
    projectId: string,
    location: string,
    serviceName: string
  ): Promise<CloudRunService> {
    return this.request(
      `${API_URLS.run}/projects/${projectId}/locations/${location}/services/${serviceName}`
    );
  }

  async deleteCloudRunService(
    projectId: string,
    location: string,
    serviceName: string
  ): Promise<Operation> {
    return this.request(
      `${API_URLS.run}/projects/${projectId}/locations/${location}/services/${serviceName}`,
      { method: 'DELETE' }
    );
  }

  // ===========================================================================
  // BigQuery - Datasets
  // ===========================================================================

  async listDatasets(
    projectId: string
  ): Promise<{ datasets?: Dataset[]; nextPageToken?: string }> {
    return this.request(`${API_URLS.bigquery}/projects/${projectId}/datasets`);
  }

  async getDataset(projectId: string, datasetId: string): Promise<Dataset> {
    return this.request(`${API_URLS.bigquery}/projects/${projectId}/datasets/${datasetId}`);
  }

  async createDataset(projectId: string, dataset: CreateDatasetRequest): Promise<Dataset> {
    return this.request(`${API_URLS.bigquery}/projects/${projectId}/datasets`, {
      method: 'POST',
      body: JSON.stringify(dataset),
    });
  }

  async deleteDataset(
    projectId: string,
    datasetId: string,
    deleteContents = false
  ): Promise<void> {
    await this.request(
      `${API_URLS.bigquery}/projects/${projectId}/datasets/${datasetId}?deleteContents=${deleteContents}`,
      { method: 'DELETE' }
    );
  }

  // ===========================================================================
  // BigQuery - Tables
  // ===========================================================================

  async listTables(
    projectId: string,
    datasetId: string
  ): Promise<{ tables?: Table[]; nextPageToken?: string }> {
    return this.request(
      `${API_URLS.bigquery}/projects/${projectId}/datasets/${datasetId}/tables`
    );
  }

  async getTable(projectId: string, datasetId: string, tableId: string): Promise<Table> {
    return this.request(
      `${API_URLS.bigquery}/projects/${projectId}/datasets/${datasetId}/tables/${tableId}`
    );
  }

  // ===========================================================================
  // BigQuery - Query
  // ===========================================================================

  async runQuery(
    projectId: string,
    query: string,
    useLegacySql = false
  ): Promise<QueryResponse> {
    return this.request(`${API_URLS.bigquery}/projects/${projectId}/queries`, {
      method: 'POST',
      body: JSON.stringify({
        query,
        useLegacySql,
      }),
    });
  }

  // ===========================================================================
  // Pub/Sub - Topics
  // ===========================================================================

  async listTopics(
    projectId: string
  ): Promise<{ topics?: Topic[]; nextPageToken?: string }> {
    return this.request(`${API_URLS.pubsub}/projects/${projectId}/topics`);
  }

  async getTopic(projectId: string, topicName: string): Promise<Topic> {
    return this.request(`${API_URLS.pubsub}/projects/${projectId}/topics/${topicName}`);
  }

  async createTopic(projectId: string, topicName: string): Promise<Topic> {
    return this.request(`${API_URLS.pubsub}/projects/${projectId}/topics/${topicName}`, {
      method: 'PUT',
    });
  }

  async deleteTopic(projectId: string, topicName: string): Promise<void> {
    await this.request(`${API_URLS.pubsub}/projects/${projectId}/topics/${topicName}`, {
      method: 'DELETE',
    });
  }

  async publishMessage(
    projectId: string,
    topicName: string,
    messages: PubSubMessage[]
  ): Promise<PublishResponse> {
    return this.request(
      `${API_URLS.pubsub}/projects/${projectId}/topics/${topicName}:publish`,
      {
        method: 'POST',
        body: JSON.stringify({ messages }),
      }
    );
  }

  // ===========================================================================
  // Pub/Sub - Subscriptions
  // ===========================================================================

  async listSubscriptions(
    projectId: string
  ): Promise<{ subscriptions?: Subscription[]; nextPageToken?: string }> {
    return this.request(`${API_URLS.pubsub}/projects/${projectId}/subscriptions`);
  }

  async getSubscription(projectId: string, subscriptionName: string): Promise<Subscription> {
    return this.request(
      `${API_URLS.pubsub}/projects/${projectId}/subscriptions/${subscriptionName}`
    );
  }

  async createSubscription(
    projectId: string,
    subscriptionName: string,
    topicName: string
  ): Promise<Subscription> {
    return this.request(
      `${API_URLS.pubsub}/projects/${projectId}/subscriptions/${subscriptionName}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          topic: `projects/${projectId}/topics/${topicName}`,
        }),
      }
    );
  }

  async deleteSubscription(projectId: string, subscriptionName: string): Promise<void> {
    await this.request(
      `${API_URLS.pubsub}/projects/${projectId}/subscriptions/${subscriptionName}`,
      { method: 'DELETE' }
    );
  }

  async pullMessages(
    projectId: string,
    subscriptionName: string,
    maxMessages = 10
  ): Promise<PullResponse> {
    return this.request(
      `${API_URLS.pubsub}/projects/${projectId}/subscriptions/${subscriptionName}:pull`,
      {
        method: 'POST',
        body: JSON.stringify({ maxMessages }),
      }
    );
  }

  async acknowledgeMessages(
    projectId: string,
    subscriptionName: string,
    ackIds: string[]
  ): Promise<void> {
    await this.request(
      `${API_URLS.pubsub}/projects/${projectId}/subscriptions/${subscriptionName}:acknowledge`,
      {
        method: 'POST',
        body: JSON.stringify({ ackIds }),
      }
    );
  }

  // ===========================================================================
  // Cloud SQL - Instances
  // ===========================================================================

  async listSqlInstances(
    projectId: string
  ): Promise<{ items?: SqlInstance[]; nextPageToken?: string }> {
    return this.request(`${API_URLS.sql}/projects/${projectId}/instances`);
  }

  async getSqlInstance(projectId: string, instanceName: string): Promise<SqlInstance> {
    return this.request(`${API_URLS.sql}/projects/${projectId}/instances/${instanceName}`);
  }

  async deleteSqlInstance(projectId: string, instanceName: string): Promise<Operation> {
    return this.request(`${API_URLS.sql}/projects/${projectId}/instances/${instanceName}`, {
      method: 'DELETE',
    });
  }

  async restartSqlInstance(projectId: string, instanceName: string): Promise<Operation> {
    return this.request(
      `${API_URLS.sql}/projects/${projectId}/instances/${instanceName}/restart`,
      { method: 'POST' }
    );
  }

  // ===========================================================================
  // Cloud SQL - Databases
  // ===========================================================================

  async listDatabases(
    projectId: string,
    instanceName: string
  ): Promise<{ items?: SqlDatabase[]; nextPageToken?: string }> {
    return this.request(
      `${API_URLS.sql}/projects/${projectId}/instances/${instanceName}/databases`
    );
  }

  async getDatabase(
    projectId: string,
    instanceName: string,
    databaseName: string
  ): Promise<SqlDatabase> {
    return this.request(
      `${API_URLS.sql}/projects/${projectId}/instances/${instanceName}/databases/${databaseName}`
    );
  }

  async createDatabase(
    projectId: string,
    instanceName: string,
    databaseName: string
  ): Promise<Operation> {
    return this.request(
      `${API_URLS.sql}/projects/${projectId}/instances/${instanceName}/databases`,
      {
        method: 'POST',
        body: JSON.stringify({ name: databaseName }),
      }
    );
  }

  async deleteDatabase(
    projectId: string,
    instanceName: string,
    databaseName: string
  ): Promise<Operation> {
    return this.request(
      `${API_URLS.sql}/projects/${projectId}/instances/${instanceName}/databases/${databaseName}`,
      { method: 'DELETE' }
    );
  }

  // ===========================================================================
  // IAM - Service Accounts
  // ===========================================================================

  async listServiceAccounts(
    projectId: string
  ): Promise<{ accounts?: ServiceAccount[]; nextPageToken?: string }> {
    return this.request(`${API_URLS.iam}/projects/${projectId}/serviceAccounts`);
  }

  async getServiceAccount(projectId: string, email: string): Promise<ServiceAccount> {
    return this.request(
      `${API_URLS.iam}/projects/${projectId}/serviceAccounts/${email}`
    );
  }

  async createServiceAccount(
    projectId: string,
    accountId: string,
    displayName?: string
  ): Promise<ServiceAccount> {
    return this.request(`${API_URLS.iam}/projects/${projectId}/serviceAccounts`, {
      method: 'POST',
      body: JSON.stringify({
        accountId,
        serviceAccount: { displayName },
      }),
    });
  }

  async deleteServiceAccount(projectId: string, email: string): Promise<void> {
    await this.request(
      `${API_URLS.iam}/projects/${projectId}/serviceAccounts/${email}`,
      { method: 'DELETE' }
    );
  }

  // ===========================================================================
  // IAM - Policies
  // ===========================================================================

  async getProjectIamPolicy(projectId: string): Promise<IamPolicy> {
    return this.request(
      `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}:getIamPolicy`,
      { method: 'POST', body: JSON.stringify({}) }
    );
  }

  async setProjectIamPolicy(projectId: string, policy: IamPolicy): Promise<IamPolicy> {
    return this.request(
      `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}:setIamPolicy`,
      {
        method: 'POST',
        body: JSON.stringify({ policy }),
      }
    );
  }

  async listRoles(
    projectId?: string
  ): Promise<{ roles?: Role[]; nextPageToken?: string }> {
    if (projectId) {
      return this.request(`${API_URLS.iam}/projects/${projectId}/roles`);
    }
    return this.request(`${API_URLS.iam}/roles`);
  }

  // ===========================================================================
  // Secret Manager
  // ===========================================================================

  async listSecrets(
    projectId: string
  ): Promise<{ secrets?: Secret[]; nextPageToken?: string }> {
    return this.request(`${API_URLS.secretmanager}/projects/${projectId}/secrets`);
  }

  async getSecret(projectId: string, secretName: string): Promise<Secret> {
    return this.request(
      `${API_URLS.secretmanager}/projects/${projectId}/secrets/${secretName}`
    );
  }

  async createSecret(
    projectId: string,
    secretId: string,
    replication?: SecretReplication
  ): Promise<Secret> {
    return this.request(
      `${API_URLS.secretmanager}/projects/${projectId}/secrets?secretId=${secretId}`,
      {
        method: 'POST',
        body: JSON.stringify({
          replication: replication || { automatic: {} },
        }),
      }
    );
  }

  async deleteSecret(projectId: string, secretName: string): Promise<void> {
    await this.request(
      `${API_URLS.secretmanager}/projects/${projectId}/secrets/${secretName}`,
      { method: 'DELETE' }
    );
  }

  async listSecretVersions(
    projectId: string,
    secretName: string
  ): Promise<{ versions?: SecretVersion[]; nextPageToken?: string }> {
    return this.request(
      `${API_URLS.secretmanager}/projects/${projectId}/secrets/${secretName}/versions`
    );
  }

  async accessSecretVersion(
    projectId: string,
    secretName: string,
    version = 'latest'
  ): Promise<SecretPayload> {
    return this.request(
      `${API_URLS.secretmanager}/projects/${projectId}/secrets/${secretName}/versions/${version}:access`
    );
  }

  async addSecretVersion(
    projectId: string,
    secretName: string,
    payload: string
  ): Promise<SecretVersion> {
    return this.request(
      `${API_URLS.secretmanager}/projects/${projectId}/secrets/${secretName}:addVersion`,
      {
        method: 'POST',
        body: JSON.stringify({
          payload: { data: btoa(payload) },
        }),
      }
    );
  }

  // ===========================================================================
  // Cloud DNS
  // ===========================================================================

  async listManagedZones(
    projectId: string
  ): Promise<{ managedZones?: ManagedZone[]; nextPageToken?: string }> {
    return this.request(`${API_URLS.dns}/projects/${projectId}/managedZones`);
  }

  async getManagedZone(projectId: string, zoneName: string): Promise<ManagedZone> {
    return this.request(
      `${API_URLS.dns}/projects/${projectId}/managedZones/${zoneName}`
    );
  }

  async createManagedZone(
    projectId: string,
    zone: CreateManagedZoneRequest
  ): Promise<ManagedZone> {
    return this.request(`${API_URLS.dns}/projects/${projectId}/managedZones`, {
      method: 'POST',
      body: JSON.stringify(zone),
    });
  }

  async deleteManagedZone(projectId: string, zoneName: string): Promise<void> {
    await this.request(
      `${API_URLS.dns}/projects/${projectId}/managedZones/${zoneName}`,
      { method: 'DELETE' }
    );
  }

  async listResourceRecordSets(
    projectId: string,
    zoneName: string
  ): Promise<{ rrsets?: ResourceRecordSet[]; nextPageToken?: string }> {
    return this.request(
      `${API_URLS.dns}/projects/${projectId}/managedZones/${zoneName}/rrsets`
    );
  }

  async createResourceRecordSet(
    projectId: string,
    zoneName: string,
    rrset: ResourceRecordSet
  ): Promise<ResourceRecordSet> {
    return this.request(
      `${API_URLS.dns}/projects/${projectId}/managedZones/${zoneName}/rrsets`,
      {
        method: 'POST',
        body: JSON.stringify(rrset),
      }
    );
  }

  async deleteResourceRecordSet(
    projectId: string,
    zoneName: string,
    name: string,
    type: string
  ): Promise<void> {
    await this.request(
      `${API_URLS.dns}/projects/${projectId}/managedZones/${zoneName}/rrsets/${name}/${type}`,
      { method: 'DELETE' }
    );
  }

  // ===========================================================================
  // GKE (Kubernetes Engine)
  // ===========================================================================

  async listClusters(
    projectId: string,
    location: string
  ): Promise<{ clusters?: GkeCluster[] }> {
    return this.request(
      `${API_URLS.container}/projects/${projectId}/locations/${location}/clusters`
    );
  }

  async getCluster(
    projectId: string,
    location: string,
    clusterName: string
  ): Promise<GkeCluster> {
    return this.request(
      `${API_URLS.container}/projects/${projectId}/locations/${location}/clusters/${clusterName}`
    );
  }

  async deleteCluster(
    projectId: string,
    location: string,
    clusterName: string
  ): Promise<Operation> {
    return this.request(
      `${API_URLS.container}/projects/${projectId}/locations/${location}/clusters/${clusterName}`,
      { method: 'DELETE' }
    );
  }

  async listNodePools(
    projectId: string,
    location: string,
    clusterName: string
  ): Promise<{ nodePools?: NodePool[] }> {
    return this.request(
      `${API_URLS.container}/projects/${projectId}/locations/${location}/clusters/${clusterName}/nodePools`
    );
  }

  async getNodePool(
    projectId: string,
    location: string,
    clusterName: string,
    nodePoolName: string
  ): Promise<NodePool> {
    return this.request(
      `${API_URLS.container}/projects/${projectId}/locations/${location}/clusters/${clusterName}/nodePools/${nodePoolName}`
    );
  }

  // ===========================================================================
  // Cloud Logging
  // ===========================================================================

  async listLogEntries(
    projectId: string,
    filter?: string,
    pageSize = 100
  ): Promise<{ entries?: LogEntry[]; nextPageToken?: string }> {
    return this.request(`${API_URLS.logging}/entries:list`, {
      method: 'POST',
      body: JSON.stringify({
        resourceNames: [`projects/${projectId}`],
        filter,
        pageSize,
        orderBy: 'timestamp desc',
      }),
    });
  }

  async writeLogEntries(
    projectId: string,
    logName: string,
    entries: WriteLogEntry[]
  ): Promise<void> {
    await this.request(`${API_URLS.logging}/entries:write`, {
      method: 'POST',
      body: JSON.stringify({
        logName: `projects/${projectId}/logs/${encodeURIComponent(logName)}`,
        resource: { type: 'global' },
        entries,
      }),
    });
  }

  async listLogs(
    projectId: string
  ): Promise<{ logNames?: string[]; nextPageToken?: string }> {
    return this.request(`${API_URLS.logging}/projects/${projectId}/logs`);
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a GCloud client instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides its own credentials via headers,
 * allowing a single server deployment to serve multiple tenants.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
export function createGCloudClient(credentials: TenantCredentials): GCloudClient {
  return new GCloudClientImpl(credentials);
}
