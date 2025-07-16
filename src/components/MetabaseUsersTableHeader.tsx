import { Input } from "./ui/Input";

interface MetabaseUsersTableHeaderProps {
  totalUsers: number;
  filteredCount: number;
  loading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}

export const MetabaseUsersTableHeader = ({
  totalUsers,
  filteredCount,
  loading,
  searchTerm,
  onSearchChange,
  onRefresh,
}: MetabaseUsersTableHeaderProps) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <p className="text-muted-foreground">
            {totalUsers} total users • {filteredCount} shown
            {loading && " • Loading..."}
          </p>
        </div>
        <button
          onClick={onRefresh}
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
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-md"
        />
      </div>
    </>
  );
};
