/**
 * Format age in minutes to human-readable format
 */
export const formatAge = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(minutes / 1440);
    return `${days}d ago`;
  }
};

/**
 * Format time until next refresh
 */
export const formatTimeUntil = (isoString: string): string => {
  const now = new Date();
  const next = new Date(isoString);
  const diffMs = next.getTime() - now.getTime();
  const totalMinutes = Math.round(diffMs / (1000 * 60));
  const absMinutes = Math.abs(totalMinutes);
  const sign = totalMinutes < 0 ? "-" : "";

  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;

  // Special case: for negative values, if minutes is zero, show as -120m, not -2h
  if (totalMinutes < 0 && minutes === 0 && hours > 0) {
    return `${sign}${absMinutes}m`;
  }

  if (hours > 0 && minutes > 0) {
    return `${sign}${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${sign}${hours}h`;
  } else {
    return `${sign}${minutes}m`;
  }
};

/**
 * Format TTL in hours to human-readable format
 */
export const formatTTL = (hours: number): string => {
  if (hours < 24) {
    return `${hours}h`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
};

/**
 * Format TTL in milliseconds to human-readable format
 */
export const formatTTLMs = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  } else if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  } else {
    return `${minutes}m`;
  }
};
