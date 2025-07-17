import { useCallback, useEffect, useState } from "react";
import { useToast } from "../components/ui/ToastProvider";
import { InviteUserRequest, User, UserAction } from "../types/user";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { showToast } = useToast();

  const fetchUsers = useCallback(
    async (token?: string | null) => {
      console.log("[useUsers] fetchUsers called", { token });
      try {
        setError(null);

        const params = new URLSearchParams();
        if (token) {
          params.append("paginationToken", token);
        }
        params.append("limit", "20");

        // Use the server-side API route for Cognito users
        const response = await fetch(`/api/users?${params.toString()}`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("[useUsers] API response:", data);

        const transformedUsers: User[] = data.users.map(
          (user: {
            username: string;
            email: string;
            status: string;
            enabled: boolean;
            created: string;
            groups: string[];
          }) => ({
            id: user.username,
            username: user.username,
            email: user.email,
            firstName: "",
            lastName: "",
            name: user.email,
            dateJoined: user.created,
            lastLogin: user.created,
            isActive: user.enabled,
            isSuperuser: user.groups?.includes("ADMIN") || false,
            status: user.status,
            emailVerified: user.status === "CONFIRMED",
            enabled: user.enabled,
            createdAt: user.created,
            lastModified: user.created,
          })
        );

        if (token) {
          setUsers((prev) => [...prev, ...transformedUsers]);
        } else {
          setUsers(transformedUsers);
        }

        setNextToken(data.nextToken || null);
        setHasMore(!!data.nextToken);
        console.log("[useUsers] Users updated. hasMore:", !!data.nextToken);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        showToast({
          title: `❌ Failed to fetch users: ${errorMessage}`,
          variant: "error",
        });
        console.error("[useUsers] Error in fetchUsers:", err);
        if (err instanceof Error && err.stack) {
          console.error("[useUsers] Stack trace:", err.stack);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [showToast]
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
        let endpoint = "";
        const method = "PATCH";

        switch (action) {
          case "enable":
            endpoint = `/api/user-enable`;
            break;
          case "disable":
            endpoint = `/api/user-enable`;
            break;
          case "reset-password":
            endpoint = `/api/user-reset-password`;
            break;
          default:
            throw new Error(`Unknown action: ${action}`);
        }

        const body: { username: string; enabled?: boolean } = { username };
        if (action === "enable" || action === "disable") {
          body.enabled = action === "enable";
        }

        const response = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const message = `${action} user successfully`;
        showToast({ title: `✅ ${message}`, variant: "success" });

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
    [showToast, fetchUsers]
  );

  const deleteUser = useCallback(
    async (username: string) => {
      if (!confirm(`Are you sure you want to delete user ${username}?`)) {
        return;
      }

      setActionLoading(`delete-${username}`);
      try {
        const response = await fetch(`/api/user-delete?username=${username}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        showToast({
          title: "✅ User deleted successfully",
          variant: "success",
        });

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
    [showToast, fetchUsers]
  );

  const inviteUser = useCallback(
    async (userData: InviteUserRequest) => {
      try {
        const response = await fetch("/api/invite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        showToast({
          title: "✅ User invited successfully",
          variant: "success",
        });

        // Refresh users list
        await fetchUsers();

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        showToast({
          title: `❌ Failed to invite user: ${errorMessage}`,
          variant: "error",
        });
        throw err;
      }
    },
    [showToast, fetchUsers]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    nextToken,
    hasMore,
    loadingMore,
    actionLoading,
    fetchUsers,
    loadMore,
    performUserAction,
    deleteUser,
    inviteUser,
  };
}
