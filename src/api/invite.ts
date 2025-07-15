import {
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * POST /api/invite
 * Body: { email: string; password?: string }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email is required" });
  }

  if (!email.endsWith("@everybite.com")) {
    return res.status(400).json({ error: "Email must be @everybite.com" });
  }

  const REGION = process.env.AWS_REGION;
  const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

  if (!REGION || !USER_POOL_ID) {
    return res
      .status(500)
      .json({ error: "Server not configured with Cognito env vars" });
  }

  const client = new CognitoIdentityProviderClient({ region: REGION });

  try {
    // 1. Create user with temporary password
    const tempPassword = password || generateTempPassword();

    await client.send(
      new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        TemporaryPassword: tempPassword,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "email_verified", Value: "true" },
        ],
        MessageAction: "SUPPRESS", // we handle notification ourselves
      })
    );

    // 2. Immediately set permanent password (optional)
    if (password) {
      await client.send(
        new AdminSetUserPasswordCommand({
          UserPoolId: USER_POOL_ID,
          Username: email,
          Password: password,
          Permanent: true,
        })
      );
    }

    return res.status(200).json({ success: true });
  } catch (err: unknown) {
    console.error("Invite error", err);
    let message = "Failed to invite user";
    if (
      err &&
      typeof err === "object" &&
      "message" in err &&
      typeof (err as { message?: unknown }).message === "string"
    ) {
      message = (err as { message: string }).message;
    }
    return res.status(500).json({ error: message });
  }
}

function generateTempPassword() {
  // 12-char random with letters, numbers & symbols that meet Cognito complexity by default
  const chars = "ABCDEFGHJKLMNPQRSTUWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%*";
  let pw = "";
  for (let i = 0; i < 12; i++)
    pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}
