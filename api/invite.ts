import type { VercelRequest, VercelResponse } from '@vercel/node';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !email.endsWith('@everybite.com')) {
    return res.status(400).json({ error: 'Email must end with @everybite.com' });
  }

  const { AWS_REGION, COGNITO_USER_POOL_ID } = process.env;
  if (!AWS_REGION || !COGNITO_USER_POOL_ID) {
    return res.status(500).json({ error: 'Missing Cognito env vars' });
  }
  const client = new CognitoIdentityProviderClient({ region: AWS_REGION });
  const tmpPassword = password || generateTempPassword();
  const responsePassword = tmpPassword;

  try {
    await client.send(
      new AdminCreateUserCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: email,
        TemporaryPassword: tmpPassword,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'true' },
        ],
        MessageAction: 'SUPPRESS',
      }),
    );

    if (password) {
      await client.send(
        new AdminSetUserPasswordCommand({
          UserPoolId: COGNITO_USER_POOL_ID,
          Username: email,
          Password: password,
          Permanent: true,
        }),
      );
    }
    return res.status(200).json({ success: true, password: responsePassword });
  } catch (err: any) {
    console.error(err);
    if (err?.name === 'UsernameExistsException') {
      return res.status(400).json({ error: 'User already exists' });
    }
    return res.status(500).json({ error: err.message || 'Invite failed' });
  }
}

function generateTempPassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const specials = '!@#$%*';

  // pick at least one from each required set
  const required = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    specials[Math.floor(Math.random() * specials.length)],
  ];

  // remaining characters (to reach 12) can be from the union of all sets
  const all = upper + lower + digits + specials;
  for (let i = required.length; i < 12; i++) {
    required.push(all[Math.floor(Math.random() * all.length)]);
  }

  // shuffle to avoid predictable positions
  for (let i = required.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [required[i], required[j]] = [required[j], required[i]];
  }

  return required.join('');
}
