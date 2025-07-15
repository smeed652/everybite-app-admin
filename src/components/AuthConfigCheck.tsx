import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

export const AuthConfigCheck = () => {
  const [missingConfig, setMissingConfig] = useState<string[]>([]);

  useEffect(() => {
    const requiredVars = [
      { key: "VITE_AWS_REGION", name: "AWS Region" },
      { key: "VITE_COGNITO_USER_POOL_ID", name: "Cognito User Pool ID" },
      { key: "VITE_COGNITO_APP_CLIENT_ID", name: "Cognito App Client ID" },
    ];

    const missing = requiredVars.filter((envVar) => {
      const value = (import.meta.env as Record<string, string | undefined>)[
        envVar.key
      ];
      return !value;
    });

    setMissingConfig(missing.map((m) => m.name));
  }, []);

  if (missingConfig.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Authentication Configuration Missing
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                The following environment variables are required for
                authentication:
              </p>
              <ul className="list-disc list-inside mt-1">
                {missingConfig.map((config) => (
                  <li key={config}>{config}</li>
                ))}
              </ul>
              <p className="mt-2">
                Please check your <code>.env.local</code> file and ensure all
                required variables are set.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
