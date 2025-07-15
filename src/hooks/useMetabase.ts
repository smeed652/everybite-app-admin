import { useCallback, useEffect, useState } from "react";
import { DashboardMetrics, MetabaseUsersResponse } from "../types/metabase";

// Get API base URL from environment variables
const getApiBaseUrl = () => {
  const apiUrl =
    import.meta.env.VITE_METABASE_API_URL ||
    import.meta.env.REACT_APP_METABASE_API_URL ||
    "";

  console.log("🔍 [useMetabase] Environment check:", {
    VITE_METABASE_API_URL: import.meta.env.VITE_METABASE_API_URL,
    REACT_APP_METABASE_API_URL: import.meta.env.REACT_APP_METABASE_API_URL,
    resolved: apiUrl,
  });

  return apiUrl;
};

// Hook to fetch Metabase dashboard metrics
export const useMetabaseMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const apiBaseUrl = getApiBaseUrl();
      if (!apiBaseUrl) {
        throw new Error("Metabase API URL not configured");
      }

      const endpoint = `${apiBaseUrl.replace(/\/$/, "")}/metabase/dashboard`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error("Failed to fetch Metabase metrics");
      }
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, loading, error, refetch: fetchMetrics };
};

// Hook to fetch Metabase users
export const useMetabaseUsers = () => {
  const [users, setUsers] = useState<MetabaseUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const apiBaseUrl = getApiBaseUrl();
      if (!apiBaseUrl) {
        throw new Error("Metabase API URL not configured");
      }

      const endpoint = `${apiBaseUrl.replace(/\/$/, "")}/metabase/users`;
      console.log("🔍 [useMetabase] Fetching users from:", endpoint);

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error("Failed to fetch Metabase users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
};
