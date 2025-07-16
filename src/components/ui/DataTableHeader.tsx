import { flexRender, Table } from "@tanstack/react-table";
import { TH, THead, TR } from "./Table";

interface DataTableHeaderProps<TData> {
  table: Table<TData>;
}

export function DataTableHeader<TData>({ table }: DataTableHeaderProps<TData>) {
  return (
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
                  {header.column.getIsSorted() === "asc" ? "▲" : "▼"}
                </span>
              ) : null}
            </TH>
          ))}
        </TR>
      ))}
    </THead>
  );
}
