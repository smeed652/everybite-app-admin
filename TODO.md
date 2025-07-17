# Project TODOs

## Pending

- **Remove all AWS Cognito SDK dependencies and related code from the project, including package.json, lambda/metabase-proxy/package.json, and any code in api/ and lambda/ that uses the SDK.**
  - Status: Pending

- **Fix the caching on Dashboard page. Right now only a portion of the ui/ux elements are cached it should be the entire page.**
  - Status: Pending

- **Refactor the UI/UX to the new approach**
  - Status: Pending

## In Progress

- **Fix all Users page and related tests to match the current API and UI implementation, including toast mocking and API route expectations.**
  - Status: In Progress

## Completed

- **Refactor: Centralize toast usage in a single utility (`src/lib/toast.ts`) and update all app code and tests to use this utility instead of referencing `react-hot-toast` directly.**
  - Status: Completed
  - Note: This makes it easier to mock and update toast behavior in the future.
