import { describe, it, expect, vi } from 'vitest';
import { signIn, currentSession } from '../auth';

// Amplify helpers are re-exported by our auth lib.  Mock them so we can assert calls
vi.mock('aws-amplify/auth', () => ({
  signIn: vi.fn(() => Promise.resolve({ ok: true })),
  fetchAuthSession: vi.fn(() => Promise.resolve({ tokens: { idToken: { toString: () => 'jwt' } } })),
}));

describe('auth helpers', () => {
  it('signIn proxies to aws-amplify with username & password', async () => {
    const { signIn: amplifySignIn } = await import('aws-amplify/auth');
    await signIn('test@example.com', 'secret');
    expect(amplifySignIn).toHaveBeenCalledWith({ username: 'test@example.com', password: 'secret' });
  });

  it('currentSession proxies to fetchAuthSession', async () => {
    const { fetchAuthSession } = await import('aws-amplify/auth');
    const result = await currentSession();
    expect(fetchAuthSession).toHaveBeenCalled();
    expect(result).toEqual({ tokens: { idToken: { toString: expect.any(Function) } } });
  });
});
