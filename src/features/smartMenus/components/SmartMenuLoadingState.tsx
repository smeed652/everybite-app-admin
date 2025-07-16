import { Card } from "../../../components/ui/Card";
import { Skeleton } from "../../../components/ui/Skeleton";

export const SmartMenuLoadingState = () => {
  return (
    <div className="p-8 space-y-4" data-testid="smartmenu-generic-page">
      <Skeleton className="h-8 w-1/3" />
      <Card className="h-64" />
    </div>
  );
};
