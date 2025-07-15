import { MetabaseUsersTable } from "../components/MetabaseUsersTable";

export default function MetabaseUsers() {
  // Debug environment variables immediately
  console.log("🔍 [MetabaseUsers] Environment check:", {
    VITE_METABASE_API_URL: import.meta.env.VITE_METABASE_API_URL,
    REACT_APP_METABASE_API_URL: import.meta.env.REACT_APP_METABASE_API_URL,
    allEnvVars: import.meta.env,
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Metabase Users</h1>
        <p className="text-muted-foreground">
          View and manage Metabase user accounts with login information.
        </p>
      </div>

      <MetabaseUsersTable />
    </div>
  );
}
