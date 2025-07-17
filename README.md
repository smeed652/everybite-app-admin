# EveryBite SmartMenu Analytics GraphQL API

This Lambda function provides a GraphQL API for EveryBite's SmartMenu analytics data, connecting to Metabase/Athena to serve analytics queries.

## 🏗️ Architecture

- **GraphQL API**: Built with Apollo Server
- **Data Source**: AWS Athena via Metabase
- **Authentication**: API Key-based authentication
- **Deployment**: AWS Lambda with API Gateway

## 📁 Project Structure

```
lambda/metabase-proxy/
├── index.js                    # Main Lambda function
├── package.json               # Dependencies
├── env-vars.json             # Environment variables template
├── scripts/
│   ├── deployment/           # Deployment and environment scripts
│   │   ├── set-env.sh       # Set environment variables
│   │   ├── set-all-env.sh   # Set all environment variables
│   │   └── check-env.sh     # Check environment configuration
│   ├── testing/             # Test scripts for API functionality
│   │   ├── test-api-key.js  # Test API key authentication
│   │   ├── test-table-resolvers.js # Test table-specific resolvers
│   │   └── test-enhanced-queries.js # Test enhanced schema queries
│   └── schema/              # Schema generation and exploration
│       ├── generate-enhanced-schema.js # Generate enhanced schema data
│       ├── generate-graphql-schema.js  # Generate GraphQL schema
│       ├── run-schema-exploration.js   # Run schema exploration
│       └── enhanced-schema-exploration.js # Enhanced schema exploration
├── docs/                    # Documentation
│   ├── GRAPHQL_QUERY_GENERATOR.md
│   ├── ATHENA_SCHEMA_GUIDE.md
│   ├── SCHEMA_EXPLORATION_GUIDE.md
│   └── athena-schema-documentation.md
├── generated/               # Generated files
│   ├── enhanced-schema-results.json
│   ├── enhanced-schema.graphql
│   ├── generated-schema.graphql
│   ├── enhanced-schema-summary.json
│   └── schema-generation-summary.json
├── legacy/                  # Deprecated scripts (for reference)
├── resolvers/              # GraphQL resolvers
│   ├── analytics.js        # Analytics resolvers
│   └── table-resolvers.js  # Table-specific resolvers
├── queries/                # GraphQL queries
│   ├── analytics.js        # Analytics queries
│   └── metabase.js         # Metabase queries
└── schema/                 # Schema definitions
    └── analytics.js        # Analytics schema
```

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Set environment variables
./scripts/deployment/set-env.sh

# Check configuration
./scripts/deployment/check-env.sh
```

### 2. Deploy Lambda Function

```bash
# Deploy to AWS Lambda
npm run deploy
```

### 3. Test the API

```bash
# Test API key authentication
node scripts/testing/test-api-key.js

# Test table resolvers
node scripts/testing/test-table-resolvers.js

# Test enhanced queries
node scripts/testing/test-enhanced-queries.js
```

## 📊 Available Queries

### Core Analytics

- `info`: Get Lambda deployment and runtime information
- `tables`: List all available tables with metadata
- `tableMetadata`: Get detailed metadata for a specific table
- `dataVolumes`: Get data volume statistics
- `relationships`: Get table relationships and foreign keys

### Table-Specific Queries

The API provides read-only access to 120+ tables including:

- `smartmenus`: SmartMenu data
- `orders`: Order information
- `users`: User data
- `restaurants`: Restaurant information
- `menu_items`: Menu item data
- `analytics_events`: Analytics events

Each table supports:

- Pagination with `limit` and `offset`
- Filtering with `where` clauses
- Sorting with `orderBy`

## 🔧 Development

### Schema Generation

```bash
# Generate enhanced schema data
node scripts/schema/generate-enhanced-schema.js

# Generate GraphQL schema
node scripts/schema/generate-graphql-schema.js

# Run schema exploration
node scripts/schema/run-schema-exploration.js
```

### Testing

```bash
# Run all tests
npm test

# Test specific functionality
node scripts/testing/test-api-key.js
```

## 🔐 Authentication

The API uses API key authentication. Set your API key in the environment variables:

```bash
export METABASE_API_KEY="your-api-key-here"
```

## 📈 Monitoring

- **Logs**: CloudWatch logs
- **Metrics**: CloudWatch metrics
- **Errors**: Sentry integration (if configured)

## 🗂️ Legacy Files

Deprecated scripts and files are stored in the `legacy/` directory for reference. These include:

- JWT authentication scripts (replaced by API key)
- Old test scripts (consolidated into current testing suite)
- Legacy schema exploration scripts (superseded by enhanced versions)

## 📝 TODO

- [ ] Phase 4: Lambda function enhancement and optimization
  - [ ] Performance optimization
  - [ ] Enhanced error handling
  - [ ] Security hardening
  - [ ] Comprehensive documentation
  - [ ] Monitoring and alerting setup
