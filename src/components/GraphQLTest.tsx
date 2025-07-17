import React from "react";
import {
  isMetabaseGraphQLConfigured,
  useTestGraphQLConnection,
} from "../hooks/useMetabaseGraphQL";

export const GraphQLTest: React.FC = () => {
  const isConfigured = isMetabaseGraphQLConfigured();
  const { data, loading, error } = useTestGraphQLConnection();

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">GraphQL Connection Test</h3>

      <div className="space-y-2">
        <div>
          <strong>Configuration:</strong>{" "}
          {isConfigured ? "✅ Configured" : "❌ Not Configured"}
        </div>

        <div>
          <strong>Status:</strong> {loading ? "🔄 Loading..." : "✅ Ready"}
        </div>

        {error && (
          <div className="text-red-600">
            <strong>Error:</strong> {error.message}
          </div>
        )}

        {data && (
          <div className="text-green-600">
            <strong>Success:</strong> GraphQL connection working
          </div>
        )}

        <div className="text-sm text-gray-600">
          <strong>Environment Variables:</strong>
          <br />
          VITE_LAMBDA_GRAPHQL_URI:{" "}
          {import.meta.env.VITE_LAMBDA_GRAPHQL_URI ? "✅ Set" : "❌ Not Set"}
          <br />
          VITE_LAMBDA_API_KEY:{" "}
          {import.meta.env.VITE_LAMBDA_API_KEY ? "✅ Set" : "❌ Not Set"}
        </div>
      </div>
    </div>
  );
};
