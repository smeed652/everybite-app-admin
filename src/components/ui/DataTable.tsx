import { useMemo, useState } from "react";
import { Table, TBody, TD, TH, THead, TR } from "./Table";

export interface Column<T> {
  /** Header label */
  header: string;
  /** Return cell contents for a given row */
  accessor: (row: T) => React.ReactNode;
  /** Enable sorting (uses accessor string if provided) */
  sortable?: boolean;
  /** Optional sort function override */
  sortFn?: (a: T, b: T) => number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  /** Client-side page size (default 10). Set to 0 or undefined to disable pagination. */
  pageSize?: number;
  /** Optional aria-label */
  label?: string;
}

/**
 * Simple reusable DataTable component built on the existing shadcn Table primitives.
 * Handles client-side sorting and pagination. Keep <250 lines per user preference.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function DataTable<T>({
  data,
  columns,
  loading = false,
  pageSize = 10,
  label,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortIdx, setSortIdx] = useState<number | null>(null);
  const [ascending, setAscending] = useState(true);

  const sortedData = useMemo(() => {
    if (sortIdx === null) return data;

    const column = columns[sortIdx];
    if (!column.sortable) return data;

    return [...data].sort((a, b) => {
      const aVal = column.accessor(a);
      const bVal = column.accessor(b);

      if (typeof aVal === "string" && typeof bVal === "string") {
        return ascending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return ascending ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [data, columns, sortIdx, ascending]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const pagedData = sortedData.slice(startIdx, startIdx + pageSize);

  const changeSort = (idx: number) => {
    if (sortIdx === idx) {
      setAscending(!ascending);
    } else {
      setSortIdx(idx);
      setAscending(true);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, idx: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      changeSort(idx);
    }
  };

  return (
    <div className="space-y-2" aria-label={label}>
      <Table striped className="border border-gray-200 dark:border-gray-700">
        {label && <caption className="sr-only">{label}</caption>}
        <THead className="bg-gray-100 dark:bg-gray-800 text-left select-none">
          <TR>
            {columns.map((col, idx) => (
              <TH
                key={col.header}
                className={`px-3 py-2 ${col.sortable ? "cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset" : ""}`}
                onClick={col.sortable ? () => changeSort(idx) : undefined}
                onKeyDown={
                  col.sortable ? (e) => handleKeyDown(e, idx) : undefined
                }
                tabIndex={col.sortable ? 0 : undefined}
                role={col.sortable ? "button" : undefined}
                aria-label={col.sortable ? `Sort by ${col.header}` : undefined}
                aria-sort={
                  sortIdx === idx
                    ? ascending
                      ? "ascending"
                      : "descending"
                    : undefined
                }
              >
                {col.header}
                {sortIdx === idx && (
                  <span
                    className="ml-1 inline-block align-middle"
                    aria-hidden="true"
                  >
                    {ascending ? "▲" : "▼"}
                  </span>
                )}
              </TH>
            ))}
          </TR>
        </THead>
        <TBody>
          {loading && data.length === 0
            ? Array.from({ length: pageSize || 3 }).map((_, i) => (
                <TR
                  key={i}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  {columns.map((col) => (
                    <TD key={col.header} className="px-3 py-1">
                      <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                    </TD>
                  ))}
                </TR>
              ))
            : pagedData.map((row, i) => (
                <TR
                  key={i}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-accent/20"
                >
                  {columns.map((col) => (
                    <TD
                      key={col.header}
                      className="px-3 py-1 whitespace-nowrap"
                    >
                      {col.accessor(row)}
                    </TD>
                  ))}
                </TR>
              ))}
          {!loading && pagedData.length === 0 && (
            <TR>
              <TD
                colSpan={columns.length}
                className="py-4 text-center text-muted-foreground"
              >
                No results
              </TD>
            </TR>
          )}
        </TBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIdx + 1} to{" "}
            {Math.min(startIdx + pageSize, sortedData.length)} of{" "}
            {sortedData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
