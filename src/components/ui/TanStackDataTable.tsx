import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,

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
import { SlidersHorizontal } from 'lucide-react';

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
}: Omit<DataTableProps<TData>, 'label'> & { label?: string; selectable?: boolean }) {
  // Ensure we reference _pageSize so it isn't considered unused
  void _pageSize;
  // Scrollable wrapper ref (future use)
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Sorting / filtering / selection state
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  // Inject row-selection checkbox column at the start
  const columnsWithSelection = React.useMemo<ColumnDef<TData, unknown>[]>(() => {
    if (!selectable) return columns;
    return [
      {
        id: 'select',
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => (
          <input
    aria-label="Select all rows"
            type="checkbox"
            className="h-4 w-4"
            checked={table.getIsAllRowsSelected() || table.getIsSomeRowsSelected()}
            aria-checked={table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
    aria-label="Select row"
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
    ];
  }, [columns, selectable]);

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

  //


  // Simple global fuzzy text filter helper – here we just lowercase includes for brevity
  const globalFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    table.setGlobalFilter(e.target.value);
  };

  return (
    <div ref={wrapperRef} className="flex flex-col h-full space-y-2 pb-6" data-testid={id}>
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
              <SlidersHorizontal aria-hidden="true" className="h-4 w-4" /> Columns
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
      <div className="flex-1 overflow-auto pb-4">
        <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
        <Table
          aria-label={label}
           className="min-w-full">
            <caption className="sr-only">Data table</caption>
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
              Array.from({ length: 15 }).map((_, i) => (
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
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-accent/20 cursor-pointer"
                  onClick={() => onRowClick?.(row.original)}
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
    </div>
  </div>
  );
}
