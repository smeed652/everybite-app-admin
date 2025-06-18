import { Fragment, useState } from 'react';
import { Input } from '../components/ui/Input';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { useSmartMenus } from '../features/smartMenus/hooks/useSmartMenus';

export default function SmartMenus() {
  const { smartMenus, loading, error } = useSmartMenus();
  const [search, setSearch] = useState('');

  if (error) {
    return <p className="text-red-500">Error loading SmartMenus: {error.message}</p>;
  }

  const filtered = smartMenus.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">SmartMenus</h1>
        <Input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {loading && smartMenus.length === 0 ? (
        <p>Loading…</p>
      ) : (
        <Table striped className="border border-gray-200 dark:border-gray-700">
          <THead className="bg-gray-100 dark:bg-gray-800 text-left">
            <TR>
              <TH className="px-3 py-2">Name</TH>
              <TH className="px-3 py-2">Slug</TH>
              <TH className="px-3 py-2">Updated</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((m) => (
              <Fragment key={m.id}>
                <TR className="border-t border-gray-200 dark:border-gray-700 hover:bg-accent/20">
                  <TD className="px-3 py-1 whitespace-nowrap">{m.name}</TD>
                  <TD className="px-3 py-1">{m.slug}</TD>
                  <TD className="px-3 py-1 whitespace-nowrap">
                    {m.updatedAt ? new Date(m.updatedAt).toLocaleDateString() : '—'}
                  </TD>
                </TR>
              </Fragment>
            ))}
            {filtered.length === 0 && (
              <TR>
                <TD colSpan={3} className="py-4 text-center text-muted-foreground">
                  No SmartMenus found
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      )}
      {/* Pagination stub – API lacks paging for widgets; implement when available */}
      <div className="text-sm text-muted-foreground">Total: {filtered.length}</div>
    </div>
  );
}
