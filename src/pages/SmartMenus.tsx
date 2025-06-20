import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Image as ImageIcon, ShoppingCart, Table as TableIcon, IdCard, Tag, Minus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '../components/ui/DropdownMenu';
import { MoreHorizontal } from 'lucide-react';

import { TanStackDataTable } from '../components/ui/TanStackDataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useSmartMenus } from '../features/smartMenus/hooks/useSmartMenus';

export default function SmartMenus() {
  const navigate = useNavigate();
  const { smartMenus, loading, error } = useSmartMenus();

  const columns: ColumnDef<typeof smartMenus[number]>[] = useMemo(() => [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ getValue }) => getValue() ?? '—',
      sortable: true,
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ getValue }) => getValue() ?? '—',
      sortable: true,
    },
    {
      id: 'images',
      header: 'Images',
      accessorFn: (m) => m.displayImages,
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <ImageIcon data-testid="images-icon" className="h-4 w-4 text-emerald-600" />
        ) : (
          <Minus className="h-4 w-4 text-muted-foreground" />
        ),
    },
    {
      id: 'ordering',
      header: 'Ordering',
      accessorFn: (m) => m.isOrderButtonEnabled,
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <ShoppingCart data-testid="ordering-icon" className="h-4 w-4 text-emerald-600" />
        ) : (
          <Minus className="h-4 w-4 text-muted-foreground" />
        ),
    },
    {
      id: 'utm',
      header: 'UTM',
      accessorFn: (m) => m.orderUrl ?? '',
      cell: ({ getValue }) => {
        const url = getValue<string>();
        const hasUtm = /[?&]utm_/.test(url);
        return hasUtm ? <Tag data-testid="utm-icon" className="h-4 w-4 text-emerald-600" /> : <Minus className="h-4 w-4 text-muted-foreground" />;
      },
    },
    {
      accessorKey: 'layout',
      header: 'Layout',
      cell: ({ getValue }) => {
        const layout = getValue<string>() ?? '';
        switch (layout.toLowerCase()) {
          case 'card':
          case 'gallery':
            return <IdCard data-testid="layout-icon" className="h-4 w-4 text-emerald-600" />;
          case 'table':
          case 'list':
            return <TableIcon data-testid="layout-icon" className="h-4 w-4 text-sky-600" />;
          default:
            return <Minus className="h-4 w-4 text-muted-foreground" />;
        }
      },
      sortable: true,
    },
    {
      id: 'published',
      header: 'Published',
      accessorFn: (m) => m.publishedAt ? new Date(m.publishedAt).toISOString() : '',
      cell: ({ getValue }) => {
        const v = getValue<string>();
        return v ? new Date(v).toLocaleDateString() : '—';
      },
    },
    {
      id: 'updated',
      header: 'Updated',
      accessorFn: (m) => m.updatedAt ? new Date(m.updatedAt).toISOString() : '',
      cell: ({ getValue }) => {
        const v = getValue<string>();
        return v ? new Date(v).toLocaleDateString() : '—';
      },
    },
    {
      id: 'colors',
      header: 'Colors',
      cell: ({ row }) => {
        const p = row.original.primaryBrandColor;
        const h = row.original.highlightColor;
        const b = row.original.backgroundColor;
        return (
          <div className="flex gap-1">
            {[p, h, b].map((c, idx) => (
              <span
                key={`${c ?? 'none'}-${idx}`}
                className="h-4 w-4 rounded-sm border border-gray-300 dark:border-gray-700"
                style={{ background: c || '#fff' }}
                title={c}
              />
            ))}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 w-8 p-0" aria-label="Row actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log('View', row.original.id)}>
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Edit', row.original.id)}>
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [smartMenus]);

  if (error) {
    return <p className="text-red-500">Error loading SmartMenus: {error.message}</p>;
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <h1 className="text-2xl font-bold">SmartMenus</h1>
      <div className="flex-1">
        <TanStackDataTable
          id="smartmenus-table"
          data={smartMenus}
          columns={columns}
          loading={loading}
          pageSize={10}
          onRowClick={(row) => navigate(`/smart-menus/${row.id}`)}
        />
      </div>
    </div>
  );
}
