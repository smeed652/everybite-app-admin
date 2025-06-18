import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
  ColumnFiltersState,
  getFilteredRowModel,
  RowSelectionState,
} from '@tanstack/react-table';
import {
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from './Table'; // existing shadcn primitives
import { Button } from './Button';
import { Input } from './Input';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from './DropdownMenu';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, SlidersHorizontal } from 'lucide-react';

interface DataTableProps<TData extends object> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  loading?: boolean;
  pageSize?: number;
  /** Unique ID to help external tests select the table */
  id?: string;
}

export function TanStackDataTable<TData extends object>({
  columns,
  data,
  loading = false,
  pageSize = 10,
  id,
}: DataTableProps<TData>) {
  // Sorting / filtering / selection state
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  // Inject row-selection checkbox column at the start
  const columnsWithSelection = React.useMemo<ColumnDef<TData, unknown>[]>(() => [
    {
      id: 'select',
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={table.getIsAllRowsSelected() || table.getIsSomeRowsSelected()}
          aria-checked={table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      size: 24,
    },
    ...columns,
  ], [columns]);

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
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: { pageSize },
    },
  });

  // Simple global fuzzy text filter helper – here we just lowercase includes for brevity
  const globalFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    table.setGlobalFilter(e.target.value);
  };

  return (
    <div className="space-y-2" data-testid={id}>
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search…"
          className="h-8 w-48"
          onChange={globalFilter}
          disabled={loading}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 h-8">
              <SlidersHorizontal className="h-4 w-4" /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {table.getAllLeafColumns().map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={() => column.toggleVisibility()}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
        <Table className="min-w-full">
          <THead className="bg-gray-100 dark:bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TR key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TH
                    key={header.id}
                    className="px-3 py-2 select-none cursor-pointer"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() ? (
                      <span className="ml-1 inline-block align-middle">
                        {header.column.getIsSorted() === 'asc' ? '▲' : '▼'}
                      </span>
                    ) : null}
                  </TH>
                ))}
              </TR>
            ))}
          </THead>
          <TBody>
            {loading ? (
              // Skeleton rows
              Array.from({ length: pageSize }).map((_, i) => (
                <TR key={i} className="border-t border-gray-200 dark:border-gray-700 animate-pulse">
                  {table.getAllLeafColumns().map((col) => (
                    <TD key={col.id} className="px-3 py-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    </TD>
                  ))}
                </TR>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TR
                  key={row.id}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-accent/20"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TD key={cell.id} className="px-3 py-2 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TD>
                  ))}
                </TR>
              ))
            ) : (
              <TR>
                <TD colSpan={table.getAllLeafColumns().length} className="text-center py-4">
                  No results
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-end gap-1 text-sm">
          <span className="mr-2">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanNextPage()}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
