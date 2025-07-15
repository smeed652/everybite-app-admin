import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
/* eslint-disable max-lines */
import {
  IdCard,
  Image as ImageIcon,
  MoreHorizontal,
  Plug,
  ShoppingCart,
  Table as TableIcon,
  Tag,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/DropdownMenu";

import { ColumnDef } from "@tanstack/react-table";
import { TanStackDataTable } from "../components/ui/TanStackDataTable";
import { useSmartMenus } from "../features/smartMenus/hooks/useSmartMenus";
import type { Widget } from "../generated/graphql";
import { Layout } from "../generated/graphql";

export default function SmartMenus() {
  const navigate = useNavigate();
  const { smartMenus, loading, error } = useSmartMenus();

  const columns: ColumnDef<Widget>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {row.original.displayImages && (
                <ImageIcon className="h-3 w-3 text-gray-400" />
              )}
              {row.original.displayIngredients && (
                <Tag className="h-3 w-3 text-gray-400" />
              )}
              {row.original.displayFeedbackButton && (
                <IdCard className="h-3 w-3 text-gray-400" />
              )}
              {row.original.isByoEnabled && (
                <ShoppingCart className="h-3 w-3 text-gray-400" />
              )}
              {row.original.isOrderButtonEnabled && (
                <Plug className="h-3 w-3 text-gray-400" />
              )}
            </div>
            <span className="font-medium">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: "layout",
        header: "Layout",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            {row.original.layout === Layout.Card ? (
              <ImageIcon className="h-4 w-4" />
            ) : (
              <TableIcon className="h-4 w-4" />
            )}
            <span className="capitalize">
              {row.original.layout.toLowerCase()}
            </span>
          </div>
        ),
        filterFn: (row, id, value) => {
          return value === "all" || row.getValue(id) === value.toUpperCase();
        },
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              row.original.isActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {row.original.isActive ? "Active" : "Inactive"}
          </span>
        ),
        filterFn: (row, id, value) => {
          return value === "all" || String(row.getValue(id)) === value;
        },
      },
      {
        accessorKey: "publishedAt",
        header: "Published",
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">
            {row.original.publishedAt
              ? new Date(row.original.publishedAt).toLocaleDateString()
              : "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Actions for ${row.original.name}`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => navigate(`/smartmenus/${row.original.id}`)}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    navigate(`/smartmenus/${row.original.id}/features`)
                  }
                >
                  Features
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    navigate(`/smartmenus/${row.original.id}/marketing`)
                  }
                >
                  Marketing
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [navigate]
  );

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Error loading SmartMenus
          </h2>
          <p className="text-gray-600 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">SmartMenus</h1>
        <Button onClick={() => navigate("/smartmenus/new")}>
          Create SmartMenu
        </Button>
      </div>

      <TanStackDataTable
        columns={columns}
        data={smartMenus || []}
        loading={loading}
        selectable={false}
        onRowClick={(row) => navigate(`/smartmenus/${row.id}`)}
        label="SmartMenus list"
      />
    </div>
  );
}
