import { useState } from "react";
import { useDataWarehouseUsers_Lambda } from "../hooks/useDataWarehouse_Lambda";
import { useTableSort } from "../hooks/useTableSort";
import { MetabaseUser } from "../types/metabase";
import { MetabaseUsersTableError } from "./MetabaseUsersTableError";
import { MetabaseUsersTableHeader } from "./MetabaseUsersTableHeader";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";
import { Skeleton } from "./ui/Skeleton";
import { Table, TBody, TD, TH, THead, TR } from "./ui/Table";

export default function MetabaseUsersTable() {
  const pageSize = 50;

  const { users, loading, error, refetch } = useDataWarehouseUsers_Lambda({
    page: 1,
    pageSize,
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Convert DataWarehouseUser to MetabaseUser for compatibility
  const metabaseUsers: MetabaseUser[] = users.users.map((user) => ({
    ...user,
    name:
      user.name ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.email,
    firstName: user.firstName || null,
    lastName: user.lastName || null,
    dateJoined: user.dateJoined || "",
    lastLogin: user.lastLogin || null,
    locale: user.locale || null,
    ssoSource: user.ssoSource || null,
  }));

  const { handleSort, sortData } = useTableSort<MetabaseUser>("dateJoined");

  // Filter users based on search term
  const filteredUsers =
    metabaseUsers?.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false) ||
        (user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false)
    ) || [];

  // Sort filtered users
  const filteredAndSortedUsers = sortData(filteredUsers);

  // If there's an error, show it prominently
  if (error) {
    return <MetabaseUsersTableError error={error} onRetry={refetch} />;
  }

  return (
    <Card className="p-6 h-screen flex flex-col">
      <MetabaseUsersTableHeader
        totalUsers={users?.total || 0}
        filteredCount={filteredAndSortedUsers.length}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={refetch}
      />

      {loading && !users?.users ? (
        <div className="space-y-4 flex-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-auto pb-6">
          <Table>
            <THead className="sticky top-0 bg-white z-10">
              <TR>
                <TH onClick={() => handleSort("name")}>Name</TH>
                <TH onClick={() => handleSort("email")}>Email</TH>
                <TH onClick={() => handleSort("dateJoined")}>Joined</TH>
                <TH onClick={() => handleSort("lastLogin")}>Last Login</TH>
                <TH>Status</TH>
                <TH>Role</TH>
                <TH>Locale</TH>
                <TH>SSO</TH>
              </TR>
            </THead>
            <TBody>
              {filteredAndSortedUsers.map((user) => (
                <TR key={user.id}>
                  <TD>{user.name}</TD>
                  <TD>{user.email}</TD>
                  <TD>
                    {user.dateJoined
                      ? new Date(user.dateJoined).toLocaleDateString()
                      : "-"}
                  </TD>
                  <TD>
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : "-"}
                  </TD>
                  <TD>
                    {user.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </TD>
                  <TD>
                    {user.isSuperuser ? (
                      <Badge variant="secondary">Admin</Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
                    )}
                    {user.isQbnewb && (
                      <Badge variant="outline" className="ml-1">
                        QB Newb
                      </Badge>
                    )}
                  </TD>
                  <TD>{user.locale || "-"}</TD>
                  <TD>{user.ssoSource || "-"}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}

      {!loading && filteredAndSortedUsers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground flex-1">
          {users?.users?.length === 0
            ? "No users found in Metabase."
            : "No users found matching your search criteria."}
        </div>
      )}
    </Card>
  );
}
