import { ColumnDef } from "@tanstack/react-table";
import {
  Image as ImageIcon,
  LayoutGrid,
  Plug,
  ShoppingCart,
  Table as TableIcon,
  Tag,
} from "lucide-react";
import { useMemo } from "react";
import type { Widget } from "../../../generated/graphql";
import { Layout } from "../../../generated/graphql";

export function useSmartMenusColumns(): ColumnDef<Widget>[] {
  return useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-gray-500">
            {row.original.id.slice(0, 8)}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "NAME",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "slug",
        header: "SLUG",
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">{row.original.slug}</span>
        ),
      },
      {
        accessorKey: "displayImages",
        header: "PHOTOS",
        cell: ({ row }) => (
          <div className="flex justify-center">
            {row.original.displayImages ? (
              <ImageIcon
                className="h-4 w-4 text-blue-500"
                data-testid="images-icon"
              />
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "isSyncEnabled",
        header: "SYNC",
        cell: ({ row }) => (
          <div className="flex justify-center">
            {row.original.isSyncEnabled ? (
              <Plug
                className="h-4 w-4 text-green-500"
                data-testid="sync-icon"
              />
            ) : (
              <Plug className="h-4 w-4 text-red-500" data-testid="sync-icon" />
            )}
          </div>
        ),
      },
      {
        accessorKey: "isOrderButtonEnabled",
        header: "ORDERING",
        cell: ({ row }) => (
          <div className="flex justify-center">
            {row.original.isOrderButtonEnabled ? (
              <ShoppingCart
                className="h-4 w-4 text-blue-500"
                data-testid="ordering-icon"
              />
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "orderUrl",
        header: "UTM",
        cell: ({ row }) => (
          <div className="flex justify-center">
            {row.original.orderUrl && row.original.orderUrl.includes("utm_") ? (
              <Tag className="h-4 w-4 text-purple-500" data-testid="utm-icon" />
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "layout",
        header: "LAYOUT",
        cell: ({ row }) => (
          <div className="flex justify-center">
            {row.original.layout === Layout.Card ? (
              <LayoutGrid
                className="h-4 w-4 text-orange-500"
                data-testid="layout-icon"
              />
            ) : (
              <TableIcon
                className="h-4 w-4 text-blue-600"
                data-testid="layout-icon"
              />
            )}
          </div>
        ),
      },
      {
        accessorKey: "publishedAt",
        header: "PUBLISHED",
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {row.original.publishedAt
              ? new Date(row.original.publishedAt).toLocaleDateString()
              : ""}
          </span>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "UPDATED",
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {new Date(row.original.updatedAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: "colors",
        header: "COLORS",
        cell: ({ row }) => (
          <div className="flex gap-1">
            {row.original.primaryBrandColor && (
              <div
                className="w-3 h-3 rounded border border-gray-300"
                style={{ backgroundColor: row.original.primaryBrandColor }}
                data-testid="color-swatch"
              />
            )}
            {row.original.highlightColor && (
              <div
                className="w-3 h-3 rounded border border-gray-300"
                style={{ backgroundColor: row.original.highlightColor }}
                data-testid="color-swatch"
              />
            )}
            {!row.original.primaryBrandColor &&
              !row.original.highlightColor && (
                <>
                  <div
                    className="w-3 h-3 rounded border border-gray-300 bg-gray-200"
                    data-testid="color-swatch"
                  />
                  <div
                    className="w-3 h-3 rounded border border-gray-300 bg-gray-200"
                    data-testid="color-swatch"
                  />
                  <div
                    className="w-3 h-3 rounded border border-gray-300 bg-gray-200"
                    data-testid="color-swatch"
                  />
                </>
              )}
          </div>
        ),
      },
    ],
    []
  );
}
