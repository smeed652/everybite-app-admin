# GraphQL API (api.everbite.com/graphql) Setup Guide

This document details how the project is configured to communicate with the `https://api.everbite.com/graphql` endpoint, with a particular focus on the authorization mechanism.

## 1. Core Setup: Apollo Client

The project uses Apollo Client to interact with the GraphQL API.

*   **Instantiation:** The main Apollo Client instance is created by the `createApolloClient` function located in `src/lib/apollo.ts`.
*   **Provider:** This client instance is then provided to the entire React application using the `<ApolloProvider>` component in `src/index.tsx`.

    ```typescript
    // src/index.tsx (simplified)
    import { ApolloProvider } from '@apollo/client';
    import { createApolloClient } from './lib/apollo';

    const client = createApolloClient();

    root.render(
      <ApolloProvider client={client}>
        {/* ...rest of the app */}
      </ApolloProvider>
    );
    ```

*   **GraphQL API Endpoint:** The API endpoint URI is configured through an environment variable:
    *   `process.env.REACT_APP_GRAPHQL_URI`
    *   It defaults to `'https://api.everybite.com/graphql'` if the environment variable is not set.

## 2. Authorization Mechanism

Understanding the authorization flow is key to working with the API.

### 2.1. Primary Authorization: Static API Key

The primary method for authorizing requests made by the global Apollo Client is through a static API key.

*   **Configuration:** In `src/lib/apollo.ts`, within the `createApolloClient` function, an `Authorization` header is directly included in the `httpLink` configuration. 
*   **API Key Source:** The value for this `Authorization` header is sourced from the environment variable `process.env.REACT_APP_API_KEY`.

    ```typescript
    // src/lib/apollo.ts (simplified excerpt from createApolloClient)
    const apiKey = process.env.REACT_APP_API_KEY || '';

    const headers = {
      'Content-Type': 'application/json',
      Authorization: apiKey, // The API key is sent as the Authorization header
    };

    const httpLink = createHttpLink({
      uri: process.env.REACT_APP_GRAPHQL_URI || 'https://api.everybite.com/graphql',
      headers, // These headers are used for requests made by this client
    });

    // ... other links like errorLink, retryLink
    const link = from([errorLink, retryLink, httpLink]);

    return new ApolloClient({
      link,
      cache,
      // ... defaultOptions
    });
    ```
*   **Scope:** This API key is used for all requests made by the main, globally provided Apollo Client instance.

### 2.2. User Authentication (Login Flow)

The application also features a user login mechanism.

*   **Context and Utilities:**
    *   `src/features/auth/AuthContext.tsx`: Manages the user's authentication state within the React application.
    *   `src/features/auth/authUtils.ts`: Contains utility functions like `setAuthToken`, `getAuthToken`, `removeAuthToken`, `setUserData`, `getUserData`, and `removeUserData` for managing the user's token and data, likely in `localStorage`.
*   **Login Mutation:**
    *   User login is performed using the `LOGIN_MUTATION` (defined in `src/features/graphql/queries/auth.ts`).
    *   The `loginUser` async function in `src/features/auth/authApi.ts` executes this mutation.
*   **Authorization of the Login Mutation Itself:** Critically, the `loginUser` function calls `createApolloClient()` to get an Apollo Client instance for sending the `LOGIN_MUTATION`. This means the login request itself is authenticated using the static `REACT_APP_API_KEY` (as configured in `createApolloClient`).

### 2.3. How the User-Specific Token (from Login) is Utilized

This is a nuanced part of the setup:

1.  **Token Storage:** Upon successful login, the `LOGIN_MUTATION` returns a user-specific token, which is stored locally (e.g., in `localStorage`) by `setAuthToken`.
2.  **Client-Side State:** This stored token is primarily used by `AuthContext` and `authUtils` to manage the client-side authentication state (e.g., determining if a user is logged in, displaying user information).
3.  **No Automatic Injection into Global Client Headers:** The global Apollo Client (configured in `src/lib/apollo.ts` with the static `REACT_APP_API_KEY`) does **not** include an Apollo Link (such as `setContext` from `@apollo/client/link/context`) that would dynamically retrieve this user-specific token from storage and add it to the headers of subsequent GraphQL requests.

**Implications of this Setup:**

*   The `REACT_APP_API_KEY` serves as the consistent authorization credential for the application's interactions with the GraphQL API via the main Apollo client.
*   The user-specific token obtained after login is mainly for client-side awareness of the user's session.
*   For the backend to recognize the logged-in user for subsequent operations (after the login mutation), it likely relies on:
    *   The initial `LOGIN_MUTATION` (authenticated by `REACT_APP_API_KEY`) establishing a user session on the server (e.g., cookie-based session).
    *   Subsequent requests, still authenticated by the valid `REACT_APP_API_KEY`, are then associated with this server-side user session.
*   This means that for most GraphQL operations post-login, the application continues to use the `REACT_APP_API_KEY` for the `Authorization` header, and the backend handles user-specific context based on the established session.

This setup avoids the need to dynamically alter Apollo Client's headers with the user-specific token for every request, simplifying the client-side configuration, assuming the backend supports this model (API key for general request authorization + session management for user context).

## 3. Environment Variables

Key environment variables for API interaction:

*   `REACT_APP_GRAPHQL_URI`: The full URL to the GraphQL endpoint (e.g., `https://api.everybite.com/graphql`).
*   `REACT_APP_API_KEY`: The static API key used in the `Authorization` header for requests made by the main Apollo Client.

These should be defined in your project's `.env` files (e.g., `.env.local`, `.env.development`, `.env.production`).

## 4. Writing Queries and Mutations

*   GraphQL queries and mutations are typically defined using `gql` from `@apollo/client`.
*   Many predefined queries, mutations, and fragments can be found within the `src/features/graphql/` directory (e.g., in `queries/`, `mutations/`, `types/`).
*   Hooks like `useQuery`, `useMutation`, and `useLazyQuery` from `@apollo/client` (or custom wrappers like those in `src/features/graphql/useGraphQL.ts`) are used to execute these operations in components.

## 5. Code Generation (GraphQL Code Generator)

(Information about GraphQL Code Generator setup would go here if it's being used. Based on the current file review, there's no direct evidence of its setup, but if it exists, details on its configuration file, scripts, and how types are generated should be included.)

## 6. Summary & Key Takeaways for Rebuilding

To replicate this GraphQL setup in another project:

1.  **Install Apollo Client:** Add `@apollo/client` and `graphql` to your project dependencies.
2.  **Configure Apollo Client (`apollo.ts`):**
    *   Create an `HttpLink` pointing to your GraphQL endpoint (`REACT_APP_GRAPHQL_URI`).
    *   Crucially, configure the `headers` for this `HttpLink` to include the static `Authorization` header, sourcing its value from an environment variable like `REACT_APP_API_KEY`.
    *   Consider adding error handling (like `onError` from `@apollo/client/link/error`) and retry logic (`RetryLink` from `@apollo/client/link/retry`).
    *   Instantiate `ApolloClient` with the composed link and a cache (e.g., `InMemoryCache`).
3.  **Provide Client (`index.tsx`):** Wrap your application with `<ApolloProvider client={client}>`.
4.  **Environment Variables:** Set up `.env` files for `REACT_APP_GRAPHQL_URI` and `REACT_APP_API_KEY`.
5.  **User Authentication Flow (if needed):
    *   Implement client-side logic to store any user-specific token returned by your login mutation (e.g., in `localStorage`).
    *   Use a React Context (`AuthContext`) to manage user authentication state in the UI.
    *   Ensure your backend is designed to work with the static API key for general request authorization and manages user sessions server-side after a successful login (which itself is authorized by the static API key).

This documentation should provide a clear understanding of how the project interfaces with the `api.everbite.com/graphql` service. The distinction between the static API key authorization for the client and the user-specific token management for client-side state is the most important aspect to grasp.
