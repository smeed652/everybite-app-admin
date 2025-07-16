/* eslint-disable @typescript-eslint/no-explicit-any */
import { MoreHorizontal, UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/DropdownMenu";
import { Input } from "../components/ui/Input";
import { Skeleton } from "../components/ui/Skeleton";
import { Table, TBody, TD, TH, THead, TR } from "../components/ui/Table";
import { useToast } from "../components/ui/ToastProvider";

interface User {
  username: string;
  email: string;
  emailVerified: boolean;
  status: string;
  enabled: boolean;
  createdAt: string;
  lastModified: string;
}

interface UsersResponse {
  users: User[];
  nextToken?: string;
}

interface InviteUserRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { showToast } = useToast();
  // Use the same Lambda URL as Metabase - one consistent pattern
  const usersApiUrl =
    import.meta.env.VITE_METABASE_API_URL || "http://localhost:3001";

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
    [usersApiUrl] // Remove showToast dependency to prevent circular dependencies
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    await fetchUsers(nextToken);
  }, [fetchUsers, loadingMore, hasMore, nextToken]);

  const inviteUser = useCallback(async () => {
    if (!inviteEmail || !invitePassword) {
      showToast({
        title: "❌ Email and password are required",
        variant: "error",
      });
      return;
    }

    setInviting(true);
    try {
      const userData: InviteUserRequest = {
        email: inviteEmail,
        password: invitePassword,
        ...(inviteFirstName && { firstName: inviteFirstName }),
        ...(inviteLastName && { lastName: inviteLastName }),
      };

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

      // Reset form
      setInviteEmail("");
      setInvitePassword("");
      setInviteFirstName("");
      setInviteLastName("");
      setShowInviteForm(false);

      // Refresh users list
      await fetchUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      showToast({
        title: `❌ Failed to invite user: ${errorMessage}`,
        variant: "error",
      });
    } finally {
      setInviting(false);
    }
  }, [
    usersApiUrl,
    inviteEmail,
    invitePassword,
    inviteFirstName,
    inviteLastName,
    showToast,
  ]);

  const performUserAction = useCallback(
    async (action: string, username: string) => {
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
    [usersApiUrl, showToast]
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
    [usersApiUrl, showToast]
  );

  useEffect(() => {
    fetchUsers();
  }, []); // Only run once on mount

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string, enabled: boolean) => {
    if (!enabled) return "text-red-600";
    switch (status) {
      case "CONFIRMED":
        return "text-green-600";
      case "UNCONFIRMED":
        return "text-yellow-600";
      case "ARCHIVED":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Users</h1>
          <Button disabled>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <Skeleton className="h-4 w-32 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={() => setShowInviteForm(!showInviteForm)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </div>

      {showInviteForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Invite New User</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              type="email"
            />
            <Input
              placeholder="Password"
              value={invitePassword}
              onChange={(e) => setInvitePassword(e.target.value)}
              type="password"
            />
            <Input
              placeholder="First Name (optional)"
              value={inviteFirstName}
              onChange={(e) => setInviteFirstName(e.target.value)}
            />
            <Input
              placeholder="Last Name (optional)"
              value={inviteLastName}
              onChange={(e) => setInviteLastName(e.target.value)}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={inviteUser} disabled={inviting}>
              {inviting ? "Inviting..." : "Invite User"}
            </Button>
            <Button variant="outline" onClick={() => setShowInviteForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <THead>
            <TR>
              <TH>Email</TH>
              <TH>Status</TH>
              <TH>Email Verified</TH>
              <TH>Created</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {users?.length > 0 ? (
              users.map((user) => (
                <TR key={user.username}>
                  <TD>{user.email}</TD>
                  <TD>
                    <span className={getStatusColor(user.status, user.enabled)}>
                      {user.status} {!user.enabled && "(Disabled)"}
                    </span>
                  </TD>
                  <TD>{user.emailVerified ? "✅" : "❌"}</TD>
                  <TD>{formatDate(user.createdAt)}</TD>
                  <TD>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {user.enabled ? (
                          <DropdownMenuItem
                            onClick={() =>
                              performUserAction("disable", user.username)
                            }
                            disabled={
                              actionLoading === `disable-${user.username}`
                            }
                          >
                            {actionLoading === `disable-${user.username}`
                              ? "Disabling..."
                              : "Disable"}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() =>
                              performUserAction("enable", user.username)
                            }
                            disabled={
                              actionLoading === `enable-${user.username}`
                            }
                          >
                            {actionLoading === `enable-${user.username}`
                              ? "Enabling..."
                              : "Enable"}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() =>
                            performUserAction("reset-password", user.username)
                          }
                          disabled={
                            actionLoading === `reset-password-${user.username}`
                          }
                        >
                          {actionLoading === `reset-password-${user.username}`
                            ? "Resetting..."
                            : "Reset Password"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteUser(user.username)}
                          disabled={actionLoading === `delete-${user.username}`}
                          className="text-red-600"
                        >
                          {actionLoading === `delete-${user.username}`
                            ? "Deleting..."
                            : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TD>
                </TR>
              ))
            ) : (
              <TR>
                <TD colSpan={5} className="text-center py-8 text-gray-500">
                  No users found
                </TD>
              </TR>
            )}
          </TBody>
        </Table>

        {hasMore && (
          <div className="p-4 text-center">
            <Button onClick={loadMore} disabled={loadingMore} variant="outline">
              {loadingMore ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
