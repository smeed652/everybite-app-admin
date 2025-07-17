import { ScheduledRefreshInfo as ScheduledRefreshInfoType } from "../../types/cache";
import { formatTimeUntil } from "./utils/cacheFormatters";

interface ScheduledRefreshInfoProps {
  scheduledInfo: ScheduledRefreshInfoType;
}

export function ScheduledRefreshInfo({
  scheduledInfo,
}: ScheduledRefreshInfoProps) {
  if (!scheduledInfo.enabled || !scheduledInfo.scheduled) {
    return null;
  }

  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-blue-900">Scheduled Refresh</h4>
        <p className="text-xs text-blue-700">
          Daily at {scheduledInfo.scheduledTime} ({scheduledInfo.timezone})
        </p>
        {scheduledInfo.nextRefresh && (
          <div className="text-sm font-medium text-blue-900">
            Next refresh in {formatTimeUntil(scheduledInfo.nextRefresh)}
          </div>
        )}
      </div>
    </div>
  );
}
