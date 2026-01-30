# Google Cloud Platform MCP Server

[![Primrose MCP](https://img.shields.io/badge/Primrose-MCP-blue)](https://primrose.dev/mcp/gcloud)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server for Google Cloud Platform, enabling AI assistants to manage compute resources, storage, databases, serverless functions, and cloud infrastructure.

## Features

- **Compute** - VM instances and compute resources
- **Storage** - Cloud Storage buckets and objects
- **Functions** - Cloud Functions management
- **BigQuery** - Data warehouse operations
- **Pub/Sub** - Messaging and event streaming
- **Cloud SQL** - Managed database operations
- **IAM** - Identity and access management
- **Secret Manager** - Secrets and configuration
- **Cloud DNS** - DNS management
- **GKE** - Kubernetes Engine operations
- **Logging** - Cloud Logging operations

## Quick Start

The recommended way to use this MCP server is through the Primrose SDK:

```bash
npm install primrose-mcp
```

```typescript
import { PrimroseMCP } from 'primrose-mcp';

const primrose = new PrimroseMCP({
  service: 'gcloud',
  headers: {
    'X-GCloud-Access-Token': 'your-oauth-access-token',
    'X-GCloud-Project-ID': 'your-project-id'
  }
});
```

## Manual Installation

If you prefer to run the MCP server directly:

```bash
# Clone the repository
git clone https://github.com/primrose-ai/primrose-mcp-gcloud.git
cd primrose-mcp-gcloud

# Install dependencies
npm install

# Run locally
npm run dev
```

## Configuration

### Required Headers

| Header | Description |
|--------|-------------|
| `X-GCloud-Access-Token` | OAuth 2.0 access token (Bearer token) |

### Optional Headers

| Header | Description |
|--------|-------------|
| `X-GCloud-Project-ID` | Default project ID for API calls |

**Note:** Generate tokens using `gcloud auth print-access-token`

## Available Tools

### Compute Tools
- List and manage VM instances
- Instance creation and deletion
- Instance start/stop operations
- Machine type management

### Storage Tools
- Bucket management (create, list, delete)
- Object operations (upload, download, delete)
- Bucket policies and ACLs

### Functions Tools
- Deploy and manage Cloud Functions
- Function invocation
- Logs and monitoring

### BigQuery Tools
- Dataset and table management
- Query execution
- Job management
- Data import/export

### Pub/Sub Tools
- Topic management
- Subscription management
- Message publishing and pulling

### Cloud SQL Tools
- Instance management
- Database operations
- User management
- Backup operations

### IAM Tools
- Role management
- Policy bindings
- Service account operations

### Secret Manager Tools
- Create and manage secrets
- Secret versions
- Access policies

### Cloud DNS Tools
- Zone management
- Record set operations
- DNS configuration

### GKE Tools
- Cluster management
- Node pool operations
- Workload management

### Logging Tools
- Log entries retrieval
- Log sink management
- Metrics and alerts

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Related Resources

- [Primrose SDK Documentation](https://primrose.dev/docs)
- [Google Cloud Documentation](https://cloud.google.com/docs)
- [Google Cloud APIs](https://cloud.google.com/apis)
- [Model Context Protocol](https://modelcontextprotocol.io)

## License

MIT
