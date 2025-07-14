import { useState } from 'react';
import { Table, THead, TBody, TR, TH, TD } from './Table';
import { Button } from './Button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

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
export function DataTable<T>({ data, columns, loading = false, pageSize = 10, label }: DataTableProps<T>) {
  const [sortIdx, setSortIdx] = useState<number | null>(null);
  const [ascending, setAscending] = useState(true);
  const [page, setPage] = useState(0);

  const sortedData = (() => {
    if (sortIdx === null) return data;
    const col = columns[sortIdx];
    const copied = [...data];
    copied.sort(col.sortFn ?? ((a, b) => {
      const av = col.accessor(a);
      const bv = col.accessor(b);
      if (av === bv) return 0;
      if (av === undefined || av === null) return 1;
      if (bv === undefined || bv === null) return -1;
      return String(av) > String(bv) ? 1 : -1;
    }));
    return ascending ? copied : copied.reverse();
  })();

  const pagedData = pageSize ? sortedData.slice(page * pageSize, (page + 1) * pageSize) : sortedData;
  const pageCount = pageSize ? Math.ceil(sortedData.length / pageSize) : 1;

  const changeSort = (idx: number) => {
    if (sortIdx === idx) {
      setAscending(!ascending);
    } else {
      setSortIdx(idx);
      setAscending(true);
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
                className="px-3 py-2 cursor-pointer"
                onClick={col.sortable ? () => changeSort(idx) : undefined}
              >
                {col.header}
                {sortIdx === idx && (
                  <span className="ml-1 inline-block align-middle">
                    {ascending ? '▲' : '▼'}
                  </span>
                )}
              </TH>
            ))}
          </TR>
        </THead>
        <TBody>
          {loading && data.length === 0
            ? Array.from({ length: pageSize || 3 }).map((_, i) => (
                <TR key={i} className="border-t border-gray-200 dark:border-gray-700">
                  {columns.map((col) => (
                    <TD key={col.header} className="px-3 py-1">
                      <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                    </TD>
                  ))}
                </TR>
              ))
            : pagedData.map((row, i) => (
            <TR key={i} className="border-t border-gray-200 dark:border-gray-700 hover:bg-accent/20">
              {columns.map((col) => (
                <TD key={col.header} className="px-3 py-1 whitespace-nowrap">
                  {col.accessor(row)}
                </TD>
              ))}
            </TR>
          ))}
          {!loading && pagedData.length === 0 && (
            <TR>
              <TD colSpan={columns.length} className="py-4 text-center text-muted-foreground">
                No results
              </TD>
            </TR>
          )}
        </TBody>
      </Table>

      {pageSize && pageCount > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-end gap-1 text-sm">
          <span className="mr-2">
            Page {page + 1} of {pageCount}
          </span>
          <Button aria-label="First page" variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(0)}>
            <ChevronsLeft aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Button aria-label="Previous page" variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Button aria-label="Next page" variant="outline" size="sm" disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Button aria-label="Last page" variant="outline" size="sm" disabled={page >= pageCount - 1} onClick={() => setPage(pageCount - 1)}>
            <ChevronsRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        </nav>
      )}
    </div>
  );
}
