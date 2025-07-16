import { Table } from "@tanstack/react-table";
import { SlidersHorizontal } from "lucide-react";
import * as React from "react";
import { Button } from "./Button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { Input } from "./Input";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  loading?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  loading,
}: DataTableToolbarProps<TData>) {
  // Simple global fuzzy text filter helper – here we just lowercase includes for brevity
  const globalFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    table.setGlobalFilter(e.target.value);
  };

  return (
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
  );
}
