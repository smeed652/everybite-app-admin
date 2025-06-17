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
    // Amplify throws if no session / not signed in
    fetchAuthSession()
      .then((session) => {
        setSignedIn(true);
        if (allowedRoles && allowedRoles.length > 0) {
          // Amplify stores groups in accessToken payload -> cognito:groups
          // accessToken is opaque type; treat payload as unknown object
          const payload = (session as { accessToken?: { payload?: Record<string, unknown> } })?.accessToken?.payload;
          const groups: string[] | undefined = Array.isArray(payload?.['cognito:groups']) ? (payload?.['cognito:groups'] as string[]) : undefined;
          const isAllowed = groups ? groups.some((g) => allowedRoles.includes(g)) : false;
          setRoleAllowed(isAllowed);
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
