import { useState } from "react";

export type SortDirection = "asc" | "desc";

export function useTableSort<T>(
  defaultSortField: keyof T,
  defaultSortDirection: SortDirection = "desc"
) {
  const [sortField, setSortField] = useState<keyof T>(defaultSortField);
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(defaultSortDirection);

  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortData = <K extends T>(data: K[]): K[] => {
    return [...data].sort((a, b) => {
      const aValue = a[sortField] as unknown;
      const bValue = b[sortField] as unknown;

      // Handle date sorting
      if (
        typeof aValue === "string" &&
        typeof bValue === "string" &&
        (aValue.includes("-") || aValue.includes("/")) // Simple date detection
      ) {
        const aDate = new Date(aValue || "").getTime();
        const bDate = new Date(bValue || "").getTime();
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      }

      // Handle string sorting
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle boolean sorting
      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return sortDirection === "asc"
          ? aValue === bValue
            ? 0
            : aValue
              ? 1
              : -1
          : aValue === bValue
            ? 0
            : aValue
              ? -1
              : 1;
      }

      // Handle number sorting
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  };

  return {
    sortField,
    sortDirection,
    handleSort,
    sortData,
  };
}
