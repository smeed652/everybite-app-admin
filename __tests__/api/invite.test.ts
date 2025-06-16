import handler from '../../api/invite';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jest } from '@jest/globals';

// Mock AWS Cognito client
const mockSend = jest.fn();

jest.mock('@aws-sdk/client-cognito-identity-provider', () => {
  return {
    CognitoIdentityProviderClient: jest.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    AdminCreateUserCommand: jest.fn(),
    AdminSetUserPasswordCommand: jest.fn(),
  };
});

function mockReq(body: Record<string, unknown>, method: string = 'POST'): Partial<VercelRequest> {
  return { method, body } as Partial<VercelRequest>;
}

function mockRes() {
  // Minimal mock compatible with VercelResponse for our tests
  const res: any = {
    statusCode: 0,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this._json = payload;
      return this;
    },
  };
  jest.spyOn(res, 'status');
  jest.spyOn(res, 'json');
  return res as VercelResponse & { _json?: any };
}

describe('POST /api/invite', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV, AWS_REGION: 'us-west-1', COGNITO_USER_POOL_ID: 'us-west-1_foo' };
    mockSend.mockReset();
  });

  afterAll(() => {
    process.env = OLD_ENV; // restore
  });

  it('returns 200 on success', async () => {
    // @ts-ignore – relax arg type for mock
mockSend.mockResolvedValueOnce({}); // AdminCreateUser
    const req = mockReq({ email: 'john@everybite.com' });
    const res = mockRes();

    // @ts-expect-error partial types OK for test
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res._json).toEqual(expect.objectContaining({ success: true }));
    expect(mockSend).toHaveBeenCalled();
  });

  it('returns 400 for duplicate user', async () => {
    const err: any = new Error('exists');
    err.name = 'UsernameExistsException';
    // @ts-ignore
mockSend.mockRejectedValueOnce(err);

    const req = mockReq({ email: 'existing@everybite.com' });
    const res = mockRes();

    // @ts-expect-error partial types OK for test
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res._json).toEqual({ error: 'User already exists' });
  });

  it('returns 400 for invalid email domain', async () => {
    const req = mockReq({ email: 'foo@example.com' });
    const res = mockRes();

    // @ts-expect-error
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res._json).toEqual({ error: 'Email must end with @everybite.com' });
    expect(mockSend).not.toHaveBeenCalled();
  });
});
