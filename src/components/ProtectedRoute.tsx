import { Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

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
    // First, allow test environment to stub auth via localStorage
    interface WindowWithCypress {
      Cypress?: unknown;
    }
    const isCypress =
      typeof window !== 'undefined' && (window as WindowWithCypress).Cypress !== undefined;
    const isTestEnv = isCypress || import.meta.env.VITE_E2E === 'true' || process.env.NODE_ENV === 'test';
    const localToken = isTestEnv ? localStorage.getItem('everybiteAuth') : null;
    if (isTestEnv && localToken) {
      try {
        const parsed = JSON.parse(localToken);
        const groupsArr: string[] = Array.isArray(parsed.groups)
          ? parsed.groups
          : typeof parsed.groups === 'string'
            ? [parsed.groups]
            : [];
        setSignedIn(true);
        if (allowedRoles && allowedRoles.length > 0) {
          const isAllowed = groupsArr.some((g) => allowedRoles.includes(g));
          setRoleAllowed(isAllowed);
        }
        setLoading(false);
        return; // skip Amplify call
      } catch {
        // fall through to Amplify fetch
      }
    }

    // Amplify throws if no session / not signed in
    fetchAuthSession()
      .then((session) => {
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
          const rawGroups = payload?.['cognito:groups'];
          const groupsArr: string[] = Array.isArray(rawGroups)
            ? (rawGroups as string[])
            : typeof rawGroups === 'string'
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
      })
      .catch(() => setSignedIn(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!signedIn) return <Navigate to="/login" replace />;
  if (!roleAllowed) return <Navigate to="/403" replace />;
  return children;
}
