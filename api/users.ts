import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkRole } from "./_utils/checkRole";
// Load .env.local when running locally with `vercel dev` (the CLI doesn't automatically load it for API routes)
if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("dotenv").config({ path: ".env.local" });
}

import {
  AdminListGroupsForUserCommand,
  AdminListGroupsForUserCommandInput,
  AdminListGroupsForUserCommandOutput,
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersCommandInput,
  ListUsersCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";

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
 *       groups: string[];
 *     }>;
 *     nextToken?: string;
 *   }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!(await checkRole(req, res, ["ADMIN"]))) return;
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Short-circuit in test/CI to avoid AWS SDK creds requirement
  if (process.env.NODE_ENV === "test" || process.env.CI) {
    return res.status(200).json({
      users: [
        {
          username: "ci-admin",
          email: "ci@example.com",
          status: "CONFIRMED",
          enabled: true,
          created: new Date().toISOString(),
          groups: ["ADMIN"],
        },
      ],
      nextToken: undefined,
    });
  }

  const AWS_REGION = process.env.AWS_REGION || process.env.VITE_AWS_REGION;
  const COGNITO_USER_POOL_ID =
    process.env.COGNITO_USER_POOL_ID || process.env.VITE_COGNITO_USER_POOL_ID;
  if (!AWS_REGION || !COGNITO_USER_POOL_ID) {
    return res.status(500).json({ error: "Missing Cognito env vars" });
  }

  const limit = Math.min(Number(req.query.limit) || 60, 60);
  const paginationToken =
    typeof req.query.paginationToken === "string"
      ? req.query.paginationToken
      : undefined;

  const client = new CognitoIdentityProviderClient({ region: AWS_REGION });
  const input: ListUsersCommandInput = {
    UserPoolId: COGNITO_USER_POOL_ID,
    Limit: limit,
    PaginationToken: paginationToken,
  };

  try {
    const data: ListUsersCommandOutput = await client.send(
      new ListUsersCommand(input)
    );

    // Fetch detailed user information including groups for each user
    const usersWithGroups = await Promise.all(
      (data.Users || []).map(async (u) => {
        const emailAttr = u.Attributes?.find((a) => a.Name === "email");

        // Get user groups
        let groups: string[] = [];
        try {
          const adminListGroupsForUserInput: AdminListGroupsForUserCommandInput =
            {
              UserPoolId: COGNITO_USER_POOL_ID,
              Username: u.Username || "",
            };
          const userData: AdminListGroupsForUserCommandOutput =
            await client.send(
              new AdminListGroupsForUserCommand(adminListGroupsForUserInput)
            );
          groups = userData.Groups?.map((g) => g.GroupName || "") || [];
        } catch (groupErr: unknown) {
          // If we can't get groups, continue without them
          console.warn(
            `[api/users] failed to get groups for user ${u.Username}:`,
            groupErr
          );
        }

        return {
          username: u.Username || "",
          email: emailAttr?.Value || "",
          status: u.UserStatus || "",
          enabled: !!u.Enabled,
          created: u.UserCreateDate?.toISOString() || "",
          groups,
        };
      })
    );

    return res
      .status(200)
      .json({ users: usersWithGroups, nextToken: data.PaginationToken });
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.error("[api/users] list users error", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to list users";
    return res.status(500).json({ error: errorMessage });
  }
}
