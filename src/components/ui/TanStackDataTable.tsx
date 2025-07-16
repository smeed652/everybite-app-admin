import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";
import { DataTableBody } from "./DataTableBody";
import { DataTableHeader } from "./DataTableHeader";
import { useDataTableSelection } from "./DataTableSelection";
import { DataTableToolbar } from "./DataTableToolbar";
import { Table } from "./Table";

interface DataTableProps<TData extends object> {
  onRowClick?: (row: TData) => void;
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  loading?: boolean;
  pageSize?: number;
  /** Optional accessible label for the table */
  label?: string;
  /** Unique ID to help external tests select the table */
  id?: string;
}

export function TanStackDataTable<TData extends object>({
  columns,
  data,
  loading = false,
  pageSize: _pageSize = 10,
  id,
  onRowClick,
  selectable = true,
  label,
}: Omit<DataTableProps<TData>, "label"> & {
  label?: string;
  selectable?: boolean;
}) {
  // Ensure we reference _pageSize so it isn't considered unused
  void _pageSize;
  // Scrollable wrapper ref (future use)
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Sorting / filtering / selection state
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  // Inject row-selection checkbox column at the start
  const columnsWithSelection = useDataTableSelection(columns, selectable);

  const table = useReactTable({
    data,
    columns: columnsWithSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div
      ref={wrapperRef}
      className="flex flex-col h-full space-y-2 pb-6"
      data-testid={id}
    >
      {/* Toolbar */}
      <DataTableToolbar table={table} loading={loading} />

      {/* Table */}
      <div className="flex-1 overflow-auto pb-4">
        <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
          <Table aria-label={label} className="min-w-full">
            <caption className="sr-only">Data table</caption>
            <DataTableHeader table={table} />
            <DataTableBody
              table={table}
              loading={loading}
              onRowClick={onRowClick}
            />
          </Table>
        </div>
      </div>
    </div>
  );
}
