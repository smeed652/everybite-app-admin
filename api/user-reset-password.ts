import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  CognitoIdentityProviderClient,
  AdminSetUserPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';

function generateTempPassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const specials = '!@#$%*';
  const required = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    specials[Math.floor(Math.random() * specials.length)],
  ];
  const all = upper + lower + digits + specials;
  for (let i = required.length; i < 12; i++) {
    required.push(all[Math.floor(Math.random() * all.length)]);
  }
  for (let i = required.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [required[i], required[j]] = [required[j], required[i]];
  }
  return required.join('');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { AWS_REGION, COGNITO_USER_POOL_ID } = process.env;
  if (!AWS_REGION || !COGNITO_USER_POOL_ID) return res.status(500).json({ error: 'Missing env' });

  const { username } = req.body as { username?: string };
  if (!username) return res.status(400).json({ error: 'username required' });

  const tmpPassword = generateTempPassword();
  const client = new CognitoIdentityProviderClient({ region: AWS_REGION });
  try {
    await client.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: username,
        Password: tmpPassword,
        Permanent: false,
      }),
    );
    return res.status(200).json({ password: tmpPassword });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[user-reset-password]', err);
    return res.status(500).json({ error: err.message || 'reset failed' });
  }
}
