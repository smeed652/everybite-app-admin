import { flexRender, Table } from "@tanstack/react-table";
import { TBody, TD, TR } from "./Table";

interface DataTableBodyProps<TData> {
  table: Table<TData>;
  loading?: boolean;
  onRowClick?: (row: TData) => void;
}

export function DataTableBody<TData>({
  table,
  loading,
  onRowClick,
}: DataTableBodyProps<TData>) {
  return (
    <TBody>
      {loading ? (
        // Skeleton rows
        Array.from({ length: 15 }).map((_, i) => (
          <TR
            key={i}
            className="border-t border-gray-200 dark:border-gray-700 animate-pulse"
          >
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
          <TD
            colSpan={table.getAllLeafColumns().length}
            className="text-center py-4"
          >
            No results
          </TD>
        </TR>
      )}
    </TBody>
  );
}
