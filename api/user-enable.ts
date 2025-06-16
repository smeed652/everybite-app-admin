import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  CognitoIdentityProviderClient,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  const { AWS_REGION, COGNITO_USER_POOL_ID } = process.env;
  if (!AWS_REGION || !COGNITO_USER_POOL_ID) return res.status(500).json({ error: 'Missing env' });

  const { username, enabled } = req.body as { username?: string; enabled?: boolean };
  if (!username || enabled === undefined)
    return res.status(400).json({ error: 'username & enabled required' });

  const client = new CognitoIdentityProviderClient({ region: AWS_REGION });
  try {
    if (enabled) {
      await client.send(new AdminEnableUserCommand({ UserPoolId: COGNITO_USER_POOL_ID, Username: username }));
    } else {
      await client.send(new AdminDisableUserCommand({ UserPoolId: COGNITO_USER_POOL_ID, Username: username }));
    }
    return res.status(200).json({ success: true });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[user-enable]', err);
    return res.status(500).json({ error: err.message || 'toggle failed' });
  }
}
