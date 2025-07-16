import { Card } from "./ui/Card";

interface MetabaseUsersTableErrorProps {
  error: string;
  onRetry: () => void;
}

export const MetabaseUsersTableError = ({
  error,
  onRetry,
}: MetabaseUsersTableErrorProps) => {
  return (
    <Card className="p-6 border-4 border-red-500">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Metabase Users</h2>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 mb-2 font-medium">Error loading users:</p>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    </Card>
  );
};
