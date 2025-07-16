import { ColumnDef } from "@tanstack/react-table";
import * as React from "react";

export function useDataTableSelection<TData extends object>(
  columns: ColumnDef<TData, unknown>[],
  selectable: boolean
): ColumnDef<TData, unknown>[] {
  return React.useMemo<ColumnDef<TData, unknown>[]>(() => {
    if (!selectable) return columns;
    return [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => (
          <input
            aria-label="Select all rows"
            type="checkbox"
            className="h-4 w-4"
            checked={
              table.getIsAllRowsSelected() || table.getIsSomeRowsSelected()
            }
            aria-checked={
              table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
            }
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
}
