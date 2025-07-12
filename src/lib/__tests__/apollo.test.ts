/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi } from 'vitest';

// Declare spies that will be initialised inside the factory of vi.mock so we
// can assert on them after the module under test is imported.
let createHttpLinkMock: ReturnType<typeof vi.fn>;
let setContextMock: ReturnType<typeof vi.fn>;
let fromMock: ReturnType<typeof vi.fn>;
let InMemoryCacheMock: ReturnType<typeof vi.fn>;
let ApolloClientCtor: ReturnType<typeof vi.fn>;

vi.mock('@apollo/client', () => {
  createHttpLinkMock = vi.fn().mockReturnValue('httpLink');
  fromMock = vi.fn().mockReturnValue('combinedLink');
  ApolloClientCtor = vi.fn().mockImplementation(({ link, cache }) => ({ link, cache }));
  InMemoryCacheMock = vi.fn().mockImplementation(() => 'cache');
  return {
    createHttpLink: createHttpLinkMock,
    ApolloLink: { from: fromMock },
    ApolloClient: ApolloClientCtor,
    InMemoryCache: InMemoryCacheMock,
  } as unknown as typeof import('@apollo/client');
});

vi.mock('@apollo/client/link/context', () => {
  setContextMock = vi.fn((fn) => fn);
  return { setContext: setContextMock } as unknown as typeof import('@apollo/client/link/context');
});

describe('Apollo client factory', () => {
  it('creates client with correct http link and auth header', async () => {
    // Provide env vars for the module to read before dynamic import.
    (import.meta as any).env = {
      VITE_GRAPHQL_URI: 'https://example.com/graphql',
      VITE_API_KEY: 'TESTKEY',
    };

    // Act: dynamic import after mocks in place
    const { client } = await import('../apollo');

    // Assert
    expect(createHttpLinkMock).toHaveBeenCalled();
    const httpArgs = createHttpLinkMock.mock.calls[0][0];
    expect(httpArgs).toMatchObject({
      headers: expect.objectContaining({ Authorization: expect.any(String) }),
    });

    // authLink builder should be called
    expect(setContextMock).toHaveBeenCalled();

    // ApolloLink.from should be called to combine links
    expect(fromMock).toHaveBeenCalled();

    // Final client should be constructed using our mocks
    expect(ApolloClientCtor).toHaveBeenCalled();
    expect(InMemoryCacheMock).toHaveBeenCalled();
    expect(client).toBeTruthy();
  });
});
