import { Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

interface Props {
  children: React.ReactElement;
}

export default function ProtectedRoute({ children }: Props) {
  // Track auth check status
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    // Amplify throws if no session / not signed in
    fetchAuthSession()
      .then(() => setSignedIn(true))
      .catch(() => setSignedIn(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!signedIn) return <Navigate to="/login" replace />;
  return children;
}
