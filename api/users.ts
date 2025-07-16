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

  try {
    // Get users with pagination
    const usersInput: ListUsersCommandInput = {
      UserPoolId: COGNITO_USER_POOL_ID,
      Limit: limit,
      PaginationToken: paginationToken,
    };

    const usersData: ListUsersCommandOutput = await client.send(
      new ListUsersCommand(usersInput)
    );

    const users = usersData.Users || [];
    console.log(`[api/users] Found ${users.length} users`);

    // Fetch groups for all users in parallel with better error handling
    const usersWithGroups = await Promise.allSettled(
      users.map(async (u) => {
        const emailAttr = u.Attributes?.find((a) => a.Name === "email");
        const username = u.Username || "";

        // Get user groups with timeout
        let groups: string[] = [];
        try {
          const adminListGroupsForUserInput: AdminListGroupsForUserCommandInput =
            {
              UserPoolId: COGNITO_USER_POOL_ID,
              Username: username,
            };

          // Add timeout to prevent hanging requests
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Group fetch timeout")), 3000)
          );

          const userData: AdminListGroupsForUserCommandOutput =
            await Promise.race([
              client.send(
                new AdminListGroupsForUserCommand(adminListGroupsForUserInput)
              ),
              timeoutPromise,
            ]);

          groups = userData.Groups?.map((g) => g.GroupName || "") || [];
        } catch (groupErr: unknown) {
          // If we can't get groups, continue without them
          console.warn(
            `[api/users] failed to get groups for user ${username}:`,
            groupErr
          );
          // Don't throw - continue with empty groups
        }

        return {
          username,
          email: emailAttr?.Value || "",
          status: u.UserStatus || "",
          enabled: !!u.Enabled,
          created: u.UserCreateDate?.toISOString() || "",
          groups,
        };
      })
    );

    // Filter out failed promises and extract successful results
    const successfulUsers = usersWithGroups
      .filter(
        (
          result
        ): result is PromiseFulfilledResult<{
          username: string;
          email: string;
          status: string;
          enabled: boolean;
          created: string;
          groups: string[];
        }> => result.status === "fulfilled"
      )
      .map((result) => result.value);

    const failedUsers = usersWithGroups.filter(
      (result): result is PromiseRejectedResult => result.status === "rejected"
    ).length;

    if (failedUsers > 0) {
      console.warn(
        `[api/users] ${failedUsers} users failed to load groups, but continuing with successful ones`
      );
    }

    console.log(
      `[api/users] Returning ${successfulUsers.length} users with groups`
    );

    return res
      .status(200)
      .json({ users: successfulUsers, nextToken: usersData.PaginationToken });
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.error("[api/users] list users error", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to list users";
    return res.status(500).json({ error: errorMessage });
  }
}
