import { User, UserAction } from "../types/user";
import { Button } from "./ui/Button";
import { Skeleton } from "./ui/Skeleton";
import { Table, TBody, TD, TH, THead, TR } from "./ui/Table";
import { UserActions } from "./UserActions";

interface UserListProps {
  users: User[];
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  actionLoading: string | null;
  onLoadMore: () => void;
  onAction: (action: UserAction, username: string) => void;
  onDelete: (username: string) => void;
}

export function UserList({
  users,
  loading,
  hasMore,
  loadingMore,
  actionLoading,
  onLoadMore,
  onAction,
  onDelete,
}: UserListProps) {
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
    );
  }

  return (
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
                  <UserActions
                    user={user}
                    onAction={onAction}
                    onDelete={onDelete}
                    actionLoading={actionLoading}
                  />
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
          <Button onClick={onLoadMore} disabled={loadingMore} variant="outline">
            {loadingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
