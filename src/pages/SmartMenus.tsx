import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
/* eslint-disable max-lines */
import { Button } from '../components/ui/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/DropdownMenu';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Image as ImageIcon, ShoppingCart, Table as TableIcon, IdCard, Tag, Minus, Plug } from 'lucide-react';
import { MoreHorizontal, ChevronDown } from 'lucide-react';

import { TanStackDataTable } from '../components/ui/TanStackDataTable';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { ColumnDef } from '@tanstack/react-table';
import { useSmartMenus } from '../features/smartMenus/hooks/useSmartMenus';

export default function SmartMenus() {
  const navigate = useNavigate();
  const { smartMenus, loading, error } = useSmartMenus();

  const ListFilter = ({ column, labels }: { column: any; labels: string[] }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-6 w-6 p-0">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {['all', ...labels.map((l) => l.toLowerCase())].map((v) => (
          <DropdownMenuItem
            key={v}
            onClick={() => column.setFilterValue(v === 'all' ? undefined : v)}
            className={column.getFilterValue() === v ? 'font-semibold' : ''}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const LayoutFilter = ({ column }: { column: any }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-6 w-6 p-0">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {['all', 'card', 'table'].map((v) => (
          <DropdownMenuItem
            key={v}
            onClick={() => column.setFilterValue(v === 'all' ? undefined : v)}
            className={column.getFilterValue() === v ? 'font-semibold' : ''}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

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
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          Photos
          <ListFilter column={column} labels={['Enabled','Disabled']} />
        </div>
      ),
      accessorFn: (m) => m.displayImages,
      filterFn: (row, _id, val) => {
        if (!val) return true;
        const v = !!row.getValue(_id);
        return val === 'enabled' ? v : !v;
      },
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <ImageIcon data-testid="images-icon" className="h-4 w-4 text-emerald-600" />
        ) : (
          <Minus className="h-4 w-4 text-muted-foreground" />
        ),
    },
    {
      id: 'sync',
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          Sync
          <ListFilter column={column} labels={['Active','Deactive']} />
        </div>
      ),
      accessorFn: (m) => m.isSyncEnabled,
      filterFn: (row, _id, val) => {
        if (!val) return true;
        const v = !!row.getValue(_id);
        return val === 'enabled' ? v : !v;
      },
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <Plug data-testid="sync-icon" className="h-4 w-4 text-emerald-600" />
        ) : (
          <Plug data-testid="sync-icon" className="h-4 w-4 text-red-600" />
        ),
    },
    {
      id: 'ordering',
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          Ordering
          <ListFilter column={column} labels={['Enabled','Disabled']} />
        </div>
      ),
      accessorFn: (m) => m.isOrderButtonEnabled,
      filterFn: (row, _id, val) => {
        if (!val) return true;
        const v = !!row.getValue(_id);
        return val === 'enabled' ? v : !v;
      },
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <ShoppingCart data-testid="ordering-icon" className="h-4 w-4 text-emerald-600" />
        ) : (
          <Minus className="h-4 w-4 text-muted-foreground" />
        ),
    },
    {
      id: 'utm',
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          UTM
          <ListFilter column={column} labels={['Enabled','Disabled']} />
        </div>
      ),
      accessorFn: (m) => m.orderUrl ?? '',
      filterFn: (row, _id, val) => {
        if (!val) return true;
        const url = (row.getValue(_id) as string) || '';
        const has = /[?&]utm_/.test(url);
        return val === 'enabled' ? has : !has;
      },
      cell: ({ getValue }) => {
        const url = getValue<string>();
        const hasUtm = /[?&]utm_/.test(url);
        return hasUtm ? <Tag data-testid="utm-icon" className="h-4 w-4 text-emerald-600" /> : <Minus className="h-4 w-4 text-muted-foreground" />;
      },
    },
    {
      accessorKey: 'layout',
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          Layout
          <LayoutFilter column={column} />
        </div>
      ),
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
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              aria-label="Row actions"
              onClick={(e) => e.stopPropagation()}
            >
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
  ] /* eslint-disable-line react-hooks/exhaustive-deps */ , [smartMenus]);

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
          pageSize={smartMenus.length}
          selectable={false}
          onRowClick={(row) => navigate(`/smart-menus/${row.id}`)}
        />
      </div>
    </div>
  );
}
