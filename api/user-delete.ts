import type { VercelRequest, VercelResponse } from '@vercel/node';
import { CognitoIdentityProviderClient, AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const { AWS_REGION, COGNITO_USER_POOL_ID } = process.env;
  if (!AWS_REGION || !COGNITO_USER_POOL_ID) return res.status(500).json({ error: 'Missing env' });

  const { username } = req.query;
  if (typeof username !== 'string') return res.status(400).json({ error: 'username required' });

  const client = new CognitoIdentityProviderClient({ region: AWS_REGION });
  try {
    await client.send(new AdminDeleteUserCommand({ UserPoolId: COGNITO_USER_POOL_ID, Username: username }));
    return res.status(200).json({ success: true });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[user-delete]', err);
    return res.status(500).json({ error: err.message || 'delete failed' });
  }
}
