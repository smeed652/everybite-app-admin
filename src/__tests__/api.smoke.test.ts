import fetch from 'cross-fetch';

// Simple smoke test to ensure the EveryBite GraphQL endpoint is reachable
// and returns a 200 OK for a basic introspection-style query. This guards
// against network / env mis-configuration in CI.

describe('EveryBite GraphQL API', () => {
  const endpoint = process.env.VITE_API_URL ?? 'https://api.everybite.com/graphql';

  it('responds to a minimal query', async () => {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // `__typename` is guaranteed to exist and executes cheaply.
      body: JSON.stringify({ query: 'query { __typename }' }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('data');
  });
});
