/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Skeleton } from "../components/ui/Skeleton";
import { Table, TBody, TD, TH, THead, TR } from "../components/ui/Table";
import { useToast } from "../components/ui/ToastProvider";
import { useAuth } from "../context/AuthContext";

interface CognitoUserRow {
  username: string;
  email: string;
  status: string;
  enabled: boolean;
  created: string;
  groups: string[];
}

interface UsersResponse {
  users: CognitoUserRow[];
  nextToken?: string;
}

interface InviteUserRequest {
  email: string;
  password?: string;
}

interface InviteUserResponse {
  success: boolean;
  message: string;
}

export default function Users() {
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<CognitoUserRow[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const fetchUsers = async (token?: string) => {
    setListLoading(true);
    try {
      const qs = token ? `?paginationToken=${encodeURIComponent(token)}` : "";
      const res = await fetch(`/api/users${qs}`, {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data: UsersResponse = await res.json();
      setUsers((prev) => (token ? [...prev, ...data.users] : data.users));
      setNextToken(data.nextToken);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error loading users";
      showToast({ title: errorMessage, variant: "error" });
    } finally {
      setListLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
        } as InviteUserRequest),
      });
      const data: InviteUserResponse = await res.json();
      if (data.success) {
        showToast({ title: "User invited successfully", variant: "success" });
        setInviteEmail("");
        fetchUsers(); // refresh list
      } else {
        showToast({
          title: data.message || "Failed to invite user",
          variant: "error",
        });
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to invite user";
      showToast({ title: errorMessage, variant: "error" });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleAction = async (action: string, username: string) => {
    try {
      const res = await fetch(`/api/user-${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ username }),
      });
      if (res.ok) {
        showToast({
          title:
            action === "reset-password"
              ? "User reset-password successfully"
              : `User ${action}d successfully`,
          variant: "success",
        });
        fetchUsers(); // refresh list
      } else {
        showToast({ title: `Failed to ${action} user`, variant: "error" });
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to ${action} user`;
      showToast({ title: errorMessage, variant: "error" });
    }
    setMenuOpen(null);
  };

  if (listLoading && users.length === 0) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            className="w-64"
          />
          <Button
            onClick={handleInvite}
            disabled={inviteLoading || !inviteEmail.trim()}
          >
            {inviteLoading ? "Inviting..." : "Invite User"}
          </Button>
        </div>
      </div>

      <div ref={tableRef} className="border rounded-lg overflow-hidden">
        <Table>
          <THead>
            <TR>
              <TH>Username</TH>
              <TH>Email</TH>
              <TH>Status</TH>
              <TH>Created</TH>
              <TH>Groups</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {users.map((user) => (
              <TR key={user.username}>
                <TD>{user.username}</TD>
                <TD>{user.email}</TD>
                <TD>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      user.status === "CONFIRMED"
                        ? "bg-green-100 text-green-800"
                        : user.status === "UNCONFIRMED"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </TD>
                <TD>{new Date(user.created).toLocaleDateString()}</TD>
                <TD>
                  <div className="flex flex-wrap gap-1">
                    {user.groups.map((group) => (
                      <span
                        key={group}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {group}
                      </span>
                    ))}
                  </div>
                </TD>
                <TD>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setMenuOpen(
                          menuOpen === user.username ? null : user.username
                        )
                      }
                      aria-label={`Actions for ${user.email}`}
                    >
                      ⋮
                    </Button>
                    {menuOpen === user.username && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded-md shadow-lg z-10">
                        <button
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() =>
                            handleAction(
                              user.enabled ? "disable" : "enable",
                              user.username
                            )
                          }
                        >
                          {user.enabled ? "Disable" : "Enable"}
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() =>
                            handleAction("reset-password", user.username)
                          }
                        >
                          Reset Password
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={() => handleAction("delete", user.username)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>

      {nextToken && (
        <div className="text-center">
          <Button
            onClick={() => fetchUsers(nextToken)}
            disabled={listLoading}
            variant="outline"
          >
            {listLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
