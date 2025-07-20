# @everybite/lambda-graphql-service

A reusable Lambda GraphQL service module for Node.js applications. This package provides a clean, type-safe interface for executing GraphQL queries against AWS Lambda endpoints with built-in caching and error handling.

## Installation

```bash
npm install @everybite/lambda-graphql-service
```

## Quick Start

```typescript
import { lambdaService } from "@everybite/lambda-graphql-service";

// Execute a simple query
const result = await lambdaService.query(MY_QUERY, { id: 123 });

if (result.error) {
  console.error("Query failed:", result.error);
} else {
  console.log("Data:", result.data);
}
```

## Features

- ✅ **Type-safe GraphQL queries** with full TypeScript support
- ✅ **Built-in caching** with Apollo Client
- ✅ **Error handling** with consistent error responses
- ✅ **Parallel query execution** for prefetching data
- ✅ **Customizable configuration** for different environments
- ✅ **Cache management** with clear/reset operations
- ✅ **Logging support** for debugging

## API Reference

### `lambdaService.query<T>(document, variables?, config?)`

Execute a GraphQL query.

```typescript
const result = await lambdaService.query<MyQueryType>(
  MY_QUERY_DOCUMENT,
  { id: 123 },
  { enableLogging: true }
);
```

### `lambdaService.mutation<T>(document, variables?, config?)`

Execute a GraphQL mutation.

```typescript
const result = await lambdaService.mutation<MyMutationType>(
  MY_MUTATION_DOCUMENT,
  { input: { name: "test" } }
);
```

### `lambdaService.prefetch<T>(queries, config?)`

Execute multiple queries in parallel.

```typescript
const result = await lambdaService.prefetch<{
  users: UsersQuery;
  posts: PostsQuery;
}>([
  { key: "users", document: USERS_QUERY },
  { key: "posts", document: POSTS_QUERY },
]);
```

### `lambdaService.clearCache(config?)`

Clear the Apollo cache.

```typescript
await lambdaService.clearCache();
```

### `lambdaService.resetCache(config?)`

Reset the Apollo cache.

```typescript
await lambdaService.resetCache();
```

## Configuration

```typescript
interface ServiceConfig {
  client?: ApolloClient<unknown>;
  defaultFetchPolicy?: FetchPolicy;
  enableLogging?: boolean;
}
```

## Custom Apollo Client

```typescript
import { createLambdaService } from "@everybite/lambda-graphql-service";
import { ApolloClient, InMemoryCache } from "@apollo/client";

const customClient = new ApolloClient({
  uri: "https://my-lambda-endpoint.com/graphql",
  cache: new InMemoryCache(),
});

const customService = createLambdaService({
  client: customClient,
  enableLogging: true,
});

const result = await customService.query(MY_QUERY);
```

## Error Handling

All service methods return a consistent `ServiceResult<T>` type:

```typescript
interface ServiceResult<T> {
  data: T | null;
  error: Error | null;
}
```

```typescript
const result = await lambdaService.query(MY_QUERY);

if (result.error) {
  // Handle error
  console.error("Query failed:", result.error.message);
  return;
}

// Use data
console.log("Success:", result.data);
```

## Examples

### React Hook Integration

```typescript
import { useState, useEffect } from "react";
import { lambdaService } from "@everybite/lambda-graphql-service";

function useDashboardData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const result = await lambdaService.prefetch({
        quarterly: QUARTERLY_METRICS_QUERY,
        widgets: WIDGET_ANALYTICS_QUERY,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  return { data, loading, error };
}
```

### Express.js Integration

```typescript
import express from "express";
import { lambdaService } from "@everybite/lambda-graphql-service";

const app = express();

app.get("/api/dashboard", async (req, res) => {
  try {
    const result = await lambdaService.prefetch({
      quarterly: QUARTERLY_METRICS_QUERY,
      widgets: WIDGET_ANALYTICS_QUERY,
    });

    if (result.error) {
      return res.status(500).json({ error: result.error.message });
    }

    res.json(result.data);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT
