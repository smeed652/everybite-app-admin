import { useState } from "react";
import { useMetabaseUsers } from "../hooks/useMetabase";
import { MetabaseUser } from "../types/metabase";
import { Card } from "./ui/Card";
import { Input } from "./ui/Input";
import { Skeleton } from "./ui/Skeleton";
import { Table, TBody, TD, TH, THead, TR } from "./ui/Table";

// Simple Badge component
const Badge = ({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}) => {
  const baseClasses =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const variantClasses = {
    default: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    secondary: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    destructive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    outline:
      "border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300",
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const MetabaseUsersTable = () => {
  const { users, loading, error, refetch } = useMetabaseUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof MetabaseUser>("dateJoined");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof MetabaseUser) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredAndSortedUsers =
    users?.users
      ?.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ??
            false) ||
          (user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ??
            false)
      )
      .sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        // Handle date sorting
        if (
          sortField === "dateJoined" ||
          sortField === "lastLogin" ||
          sortField === "updatedAt"
        ) {
          aValue = aValue || "";
          bValue = bValue || "";
          const aDate = new Date(aValue as string).getTime();
          const bDate = new Date(bValue as string).getTime();
          return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
        }

        // Handle string sorting
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle boolean sorting
        if (typeof aValue === "boolean" && typeof bValue === "boolean") {
          return sortDirection === "asc"
            ? aValue === bValue
              ? 0
              : aValue
                ? 1
                : -1
            : aValue === bValue
              ? 0
              : aValue
                ? -1
                : 1;
        }

        return 0;
      }) || [];

  // If there's an error, show it prominently
  if (error) {
    return (
      <Card className="p-6 border-4 border-red-500">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Metabase Users</h2>
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 mb-2 font-medium">
              Error loading users:
            </p>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <p className="text-muted-foreground">
            {users?.total || 0} total users • {filteredAndSortedUsers.length}{" "}
            shown
            {loading && " • Loading..."}
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="mb-4 flex-shrink-0">
        <Input
          type="text"
          placeholder="Search by name, email, or first/last name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {loading && !users ? (
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
};
