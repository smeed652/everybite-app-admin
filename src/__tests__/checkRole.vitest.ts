/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { checkRole } from '../../api/_utils/checkRole';

// minimal Vercel-style response mock
function mockRes() {
  const res: any = {};
  res.status = vi.fn().mockImplementation(() => res);
  res.json = vi.fn().mockImplementation(() => res);
  return res;
}

afterEach(() => vi.restoreAllMocks());

describe('checkRole', () => {
  it('401 if Authorization header missing', async () => {
    const req: any = { headers: {} };
    const res = mockRes();

    const ok = await checkRole(req, res, ['ADMIN']);

    expect(ok).toBe(false);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing Authorization header' });
  });

  it('403 if user not in allowed group', async () => {
    vi.spyOn(jwt, 'decode').mockReturnValue({ 'cognito:groups': ['USER'] } as any);

    const req: any = { headers: { authorization: 'Bearer dummy' } };
    const res = mockRes();

    const ok = await checkRole(req, res, ['ADMIN']);

    expect(ok).toBe(false);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
  });

  it('passes when ADMIN group present', async () => {
    vi.spyOn(jwt, 'decode').mockReturnValue({ 'cognito:groups': ['ADMIN'] } as any);

    const req: any = { headers: { authorization: 'Bearer adminToken' } };
    const res = mockRes();

    const ok = await checkRole(req, res, ['ADMIN']);

    expect(ok).toBe(true);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});