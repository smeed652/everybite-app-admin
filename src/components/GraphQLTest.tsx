import { useState } from "react";
import {
  isDataWarehouseGraphQLConfigured,
  useDailyInteractions,
  useQuarterlyMetrics,
  useWidgetAnalytics,
} from "../hooks/useDataWarehouse_Lambda";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

export const GraphQLTest: React.FC = () => {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  const handleTestConnection = () => {
    const configured = isDataWarehouseGraphQLConfigured();
    setIsConfigured(configured);
  };

  // Test the hooks
  const widgetAnalytics = useWidgetAnalytics();
  const dailyInteractions = useDailyInteractions();
  const quarterlyMetrics = useQuarterlyMetrics();

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Data Warehouse GraphQL Test</h2>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Configuration Test</h3>
        <Button onClick={handleTestConnection} className="mb-2">
          Test Configuration
        </Button>
        {isConfigured !== null && (
          <p className={isConfigured ? "text-green-600" : "text-red-600"}>
            {isConfigured ? "✅ Configured" : "❌ Not configured"}
          </p>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Hook Tests</h3>
        <div className="space-y-2">
          <p>
            Widget Analytics:{" "}
            {widgetAnalytics.loading
              ? "Loading..."
              : widgetAnalytics.error
                ? "Error"
                : "Loaded"}
          </p>
          <p>
            Daily Interactions:{" "}
            {dailyInteractions.loading
              ? "Loading..."
              : dailyInteractions.error
                ? "Error"
                : "Loaded"}
          </p>
          <p>
            Quarterly Metrics:{" "}
            {quarterlyMetrics.loading
              ? "Loading..."
              : quarterlyMetrics.error
                ? "Error"
                : "Loaded"}
          </p>
        </div>
      </Card>
    </div>
  );
};
