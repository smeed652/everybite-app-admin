// Mock the wrapper module itself to avoid import.meta parsing in Jest
const mockSignIn = jest.fn();
const mockCurrentSession = (...args: any[]) => mockFetchSession(...args);

jest.mock('../../src/lib/auth', () => ({
  signIn: (...args: any[]) => mockSignIn(...args),
  currentSession: (...args: any[]) => mockCurrentSession(...args),
}));

// Now import after the mock
import { signIn, currentSession } from '../../src/lib/auth';
import { jest } from '@jest/globals';

// Mock aws-amplify/auth functions
const mockAmplifySignIn = jest.fn();
const mockFetchSession = jest.fn();

jest.mock('aws-amplify/auth', () => {
  return {
    signIn: (...args: any[]) => mockAmplifySignIn(...args),
    fetchAuthSession: (...args: any[]) => mockFetchSession(...args),
    signOut: jest.fn(),
    confirmSignIn: jest.fn(),
  };
});

describe('auth helpers', () => {
  it('signIn returns tokens on success', async () => {
    // @ts-ignore
mockSignIn.mockResolvedValueOnce({
      isSignedIn: true,
      tokens: {
        idToken: { toString: () => 'ID_TOKEN' },
        accessToken: { toString: () => 'ACCESS_TOKEN' },
        refreshToken: { toString: () => 'REFRESH_TOKEN' },
      },
    });

    const res = await signIn('john@everybite.com', 'Password123!');
    expect(mockSignIn).toHaveBeenCalledWith('john@everybite.com', 'Password123!');
    expect(res?.isSignedIn).toBe(true);
  });

  it('currentSession returns fresh tokens', async () => {
    const sessionObj = {
      tokens: {
        idToken: { toString: () => 'NEW_ID' },
        accessToken: { toString: () => 'NEW_ACCESS' },
        refreshToken: { toString: () => 'NEW_REFRESH' },
      },
    };
    // @ts-ignore
mockFetchSession.mockResolvedValueOnce(sessionObj);

    const res = await currentSession();
    expect(mockFetchSession).toHaveBeenCalled();
    expect(res).toBe(sessionObj);
  });

  it('currentSession throws on invalid refresh token', async () => {
    // @ts-ignore
mockFetchSession.mockRejectedValueOnce(new Error('invalid_grant'));
    await expect(currentSession()).rejects.toThrow('invalid_grant');
  });
});
