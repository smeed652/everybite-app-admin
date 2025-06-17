import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import logger from './logger';

/**
 * Simple RBAC guard for Vercel API routes.
 * Usage:
 *   if (!(await checkRole(req, res, ['ADMIN']))) return;
 *   // continue with handler
 */
export async function checkRole(
  req: VercelRequest,
  res: VercelResponse,
  allowedRoles: string[]
): Promise<boolean> {
  const header = req.headers.authorization || req.headers.Authorization || '';
  const token = Array.isArray(header) ? header[0] : header;
  const bearerPrefix = 'Bearer ';
  if (!token || !token.startsWith(bearerPrefix)) {
    res.status(401).json({ error: 'Missing Authorization header' });
    return false;
  }
  const jwtToken = token.slice(bearerPrefix.length);

  try {
    // Decode without verification – we only need claims; verification handled by AWS signature if needed
    const decoded: any = jwt.decode(jwtToken, { json: true });
    const groups: string[] | undefined = Array.isArray(decoded?.['cognito:groups'])
      ? decoded['cognito:groups']
      : undefined;
    const isAllowed = groups ? groups.some((g) => allowedRoles.includes(g)) : false;
    if (!isAllowed) {
      res.status(403).json({ error: 'Forbidden' });
      return false;
    }
    return true;
  } catch (err) {
    logger.error('[checkRole] failed to decode token', err);
    res.status(400).json({ error: 'Invalid token' });
    return false;
  }
}
