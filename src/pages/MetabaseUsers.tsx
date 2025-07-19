import MetabaseUsersTable from "../components/MetabaseUsersTable";

export default function MetabaseUsers() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Metabase Users</h1>
        <MetabaseUsersTable />
      </div>
    </div>
  );
}
