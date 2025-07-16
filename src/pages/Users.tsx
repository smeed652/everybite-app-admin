import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/Button";
import { UserInviteForm } from "../components/UserInviteForm";
import { UserList } from "../components/UserList";
import { useUsers } from "../hooks/useUsers";

export default function Users() {
  const [showInviteForm, setShowInviteForm] = useState(false);

  const {
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
  } = useUsers();

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
        <UserInviteForm
          onInvite={inviteUser}
          onCancel={() => setShowInviteForm(false)}
        />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <UserList
        users={users}
        loading={loading}
        hasMore={hasMore}
        loadingMore={loadingMore}
        actionLoading={actionLoading}
        onLoadMore={loadMore}
        onAction={performUserAction}
        onDelete={deleteUser}
      />
    </div>
  );
}
