import { useCallback, useEffect, useState } from "react";
import { useToast } from "../components/ui/ToastProvider";
import {
  InviteUserRequest,
  User,
  UserAction,
  UsersResponse,
} from "../types/user";

// Use the same Lambda URL as Metabase - one consistent pattern
const getUsersApiUrl = () =>
  import.meta.env.VITE_METABASE_API_URL || "http://localhost:3001";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { showToast } = useToast();
  const usersApiUrl = getUsersApiUrl();

  const fetchUsers = useCallback(
    async (token?: string | null) => {
      try {
        setError(null);
        const params = new URLSearchParams();
        if (token) {
          params.append("nextToken", token);
        }
        params.append("limit", "20");

        const response = await fetch(`${usersApiUrl}users?${params}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: UsersResponse = await response.json();

        if (token) {
          setUsers((prev) => [...prev, ...data.users]);
        } else {
          setUsers(data.users);
        }

        setNextToken(data.nextToken || null);
        setHasMore(!!data.nextToken);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        showToast({
          title: `❌ Failed to fetch users: ${errorMessage}`,
          variant: "error",
        });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [usersApiUrl, showToast]
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    await fetchUsers(nextToken);
  }, [fetchUsers, loadingMore, hasMore, nextToken]);

  const performUserAction = useCallback(
    async (action: UserAction, username: string) => {
      setActionLoading(`${action}-${username}`);
      try {
        const response = await fetch(
          `${usersApiUrl}users/${username}/${action}`,
          {
            method: "PUT",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();
        showToast({ title: `✅ ${result.message}`, variant: "success" });

        // Refresh users list
        await fetchUsers();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        showToast({
          title: `❌ Failed to ${action} user: ${errorMessage}`,
          variant: "error",
        });
      } finally {
        setActionLoading(null);
      }
    },
    [usersApiUrl, showToast, fetchUsers]
  );

  const deleteUser = useCallback(
    async (username: string) => {
      if (!confirm(`Are you sure you want to delete user ${username}?`)) {
        return;
      }

      setActionLoading(`delete-${username}`);
      try {
        const response = await fetch(`${usersApiUrl}users/${username}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();
        showToast({ title: `✅ ${result.message}`, variant: "success" });

        // Refresh users list
        await fetchUsers();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        showToast({
          title: `❌ Failed to delete user: ${errorMessage}`,
          variant: "error",
        });
      } finally {
        setActionLoading(null);
      }
    },
    [usersApiUrl, showToast, fetchUsers]
  );

  const inviteUser = useCallback(
    async (userData: InviteUserRequest) => {
      try {
        const response = await fetch(`${usersApiUrl}users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();
        showToast({ title: `✅ ${result.message}`, variant: "success" });

        // Refresh users list
        await fetchUsers();
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        showToast({
          title: `❌ Failed to invite user: ${errorMessage}`,
          variant: "error",
        });
        return false;
      }
    },
    [usersApiUrl, showToast, fetchUsers]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    hasMore,
    loadingMore,
    actionLoading,
    loadMore,
    performUserAction,
    deleteUser,
    inviteUser,
    refreshUsers: () => fetchUsers(),
  };
}
