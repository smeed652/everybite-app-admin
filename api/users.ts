import type { VercelRequest, VercelResponse } from '@vercel/node';
// Load .env.local when running locally with `vercel dev` (the CLI doesn’t automatically load it for API routes)
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config({ path: '.env.local' });
}
import { checkRole } from './_utils/checkRole';

import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersCommandInput,
  ListUsersCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';

/**
 * GET /api/users
 *
 * Query params:
 *   - limit: number (optional, default 60)
 *   - paginationToken: string (optional, to continue a previous page)
 *
 * Response:
 *   {
 *     users: Array<{
 *       username: string;
 *       email: string;
 *       status: string;
 *       enabled: boolean;
 *       created: string;
 *     }>;
 *     nextToken?: string;
 *   }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!(await checkRole(req, res, ['ADMIN']))) return;
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const AWS_REGION = process.env.AWS_REGION || process.env.VITE_AWS_REGION;
  const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || process.env.VITE_COGNITO_USER_POOL_ID;
  if (!AWS_REGION || !COGNITO_USER_POOL_ID) {
    return res.status(500).json({ error: 'Missing Cognito env vars' });
  }

  const limit = Math.min(Number(req.query.limit) || 60, 60);
  const paginationToken = typeof req.query.paginationToken === 'string' ? req.query.paginationToken : undefined;

  const client = new CognitoIdentityProviderClient({ region: AWS_REGION });
  const input: ListUsersCommandInput = {
    UserPoolId: COGNITO_USER_POOL_ID,
    Limit: limit,
    PaginationToken: paginationToken,
  };

  try {
    const data: ListUsersCommandOutput = await client.send(new ListUsersCommand(input));
    const users = (data.Users || []).map((u) => {
      const emailAttr = u.Attributes?.find((a) => a.Name === 'email');
      return {
        username: u.Username || '',
        email: emailAttr?.Value || '',
        status: u.UserStatus || '',
        enabled: !!u.Enabled,
        created: u.UserCreateDate?.toISOString() || '',
      };
    });

    return res.status(200).json({ users, nextToken: data.PaginationToken });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[api/users] list users error', err);
    return res.status(500).json({ error: err.message || 'Failed to list users' });
  }
}
