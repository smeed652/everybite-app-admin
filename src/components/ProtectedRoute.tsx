import { fetchAuthSession } from "aws-amplify/auth";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactElement;
  allowedRoles?: string[]; // omit means any signed-in user
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  // Track auth check status
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [roleAllowed, setRoleAllowed] = useState(true);

  useEffect(() => {
    // Only allow test environment to stub auth via localStorage in actual test environments
    interface WindowWithCypress {
      Cypress?: unknown;
    }
    const isCypress =
      typeof window !== "undefined" &&
      (window as WindowWithCypress).Cypress !== undefined;
    const isTestEnv =
      isCypress ||
      import.meta.env.VITE_E2E === "true" ||
      (typeof process !== "undefined" && process.env.NODE_ENV === "test");

    // Debug logging
    // eslint-disable-next-line no-console
    console.log(
      "[ProtectedRoute] isTestEnv:",
      isTestEnv,
      "VITE_E2E:",
      import.meta.env.VITE_E2E,
      "NODE_ENV:",
      typeof process !== "undefined" ? process.env.NODE_ENV : undefined
    );

    const localToken = isTestEnv ? localStorage.getItem("everybiteAuth") : null;
    // eslint-disable-next-line no-console
    console.log("[ProtectedRoute] localToken:", localToken);
    if (isTestEnv && localToken) {
      try {
        const parsed = JSON.parse(localToken);
        const groupsArr: string[] = Array.isArray(parsed.groups)
          ? parsed.groups
          : typeof parsed.groups === "string"
            ? [parsed.groups]
            : [];
        setSignedIn(true);
        if (allowedRoles && allowedRoles.length > 0) {
          const isAllowed = groupsArr.some((g) => allowedRoles.includes(g));
          setRoleAllowed(isAllowed);
        }
        setLoading(false);
        // eslint-disable-next-line no-console
        console.log(
          "[ProtectedRoute] (test bypass) signedIn:",
          true,
          "roleAllowed:",
          allowedRoles && allowedRoles.length > 0
            ? groupsArr.some((g) => allowedRoles.includes(g))
            : true
        );
        return; // skip Amplify call
      } catch {
        // fall through to Amplify fetch
      }
    }

    // Amplify throws if no session / not signed in
    fetchAuthSession()
      .then((session) => {
        // eslint-disable-next-line no-console
        console.log(
          "[ProtectedRoute] fetchAuthSession success - full session:",
          session
        );
        // eslint-disable-next-line no-console
        console.log("[ProtectedRoute] session.tokens:", session.tokens);
        // eslint-disable-next-line no-console
        console.log(
          "[ProtectedRoute] session.tokens?.accessToken:",
          session.tokens?.accessToken
        );
        // eslint-disable-next-line no-console
        console.log(
          "[ProtectedRoute] session.tokens?.idToken:",
          session.tokens?.idToken
        );

        // Check if we actually have valid tokens - if not, user is not signed in
        const hasValidTokens =
          session.tokens?.accessToken || session.tokens?.idToken;
        // eslint-disable-next-line no-console
        console.log("[ProtectedRoute] hasValidTokens:", hasValidTokens);

        if (!hasValidTokens) {
          // eslint-disable-next-line no-console
          console.log(
            "[ProtectedRoute] No valid tokens found - treating as not signed in"
          );
          setSignedIn(false);
          setLoading(false);
          return;
        }

        setSignedIn(true);
        if (allowedRoles && allowedRoles.length > 0) {
          // Amplify stores groups in accessToken payload -> cognito:groups
          // accessToken is opaque type; treat payload as unknown object
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const anySession = session as any;
          const payload =
            anySession.accessToken?.payload ||
            anySession.tokens?.accessToken?.payload ||
            anySession.idToken?.payload ||
            anySession.tokens?.idToken?.payload;
          // eslint-disable-next-line no-console
          console.log("[ProtectedRoute] Amplify session payload:", payload);
          const rawGroups = payload?.["cognito:groups"];
          const groupsArr: string[] = Array.isArray(rawGroups)
            ? (rawGroups as string[])
            : typeof rawGroups === "string"
              ? [rawGroups]
              : [];
          // If user has no groups at all, consider them signed-in but unauthorized
          if (groupsArr.length === 0) {
            // No groups – treat as signed-out to force login rather than 403 page
            setSignedIn(false);
          } else {
            const isAllowed = groupsArr.some((g) => allowedRoles.includes(g));
            setRoleAllowed(isAllowed);
          }
        }
        // eslint-disable-next-line no-console
        console.log(
          "[ProtectedRoute] signedIn:",
          true,
          "roleAllowed:",
          roleAllowed
        );
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log("[ProtectedRoute] fetchAuthSession error:", err);
        setSignedIn(false);
      })
      .finally(() => setLoading(false));
  }, []);

  // Show loading overlay instead of unmounting content
  if (loading) {
    return (
      <div className="relative">
        {children}
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!signedIn) return <Navigate to="/login" replace />;
  if (!roleAllowed) return <Navigate to="/403" replace />;
  return children;
}

export { ProtectedRoute };
