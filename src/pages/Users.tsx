import { useState, useEffect, useRef, Fragment } from 'react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { Checkbox } from '../components/ui/Checkbox';
import { Label } from '../components/ui/Label';
import toast from 'react-hot-toast';

interface CognitoUserRow {
  username: string;
  email: string;
  status: string;
  enabled: boolean;
  created: string;
}

export default function Users() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // list users state
  const [users, setUsers] = useState<CognitoUserRow[]>([]);
  const [nextToken, setNextToken] = useState<string | undefined>();
  const [listLoading, setListLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const toggleEnabled = async (u: CognitoUserRow, newVal: boolean) => {
    const prev = u.enabled;
    // optimistic
    setUsers((list) => list.map((x) => (x.username === u.username ? { ...x, enabled: newVal } : x)));
    try {
      const res = await fetch('/api/user-enable', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u.username, enabled: newVal }),
      });
      if (!res.ok) throw new Error('Toggle failed');
      toast.success(`User ${newVal ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      // revert
      setUsers((list) => list.map((x) => (x.username === u.username ? { ...x, enabled: prev } : x)));
      toast.error(err.message || 'Error updating user');
    }
  };

  const resetPassword = async (u: CognitoUserRow) => {
    try {
      const res = await fetch('/api/user-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u.username }),
      });
      if (!res.ok) throw new Error('Reset failed');
      const data = await res.json();
      await navigator.clipboard.writeText(data.password);
      toast.success(`Temp password copied to clipboard: ${data.password}`);
    } catch (err: any) {
      toast.error(err.message || 'Error resetting password');
    }
  };

  const deleteUser = async (u: CognitoUserRow) => {
    if (!confirm(`Delete ${u.email}? This cannot be undone.`)) return;
    const prev = users;
    setUsers((list) => list.filter((x) => x.username !== u.username));
    try {
      const res = await fetch(`/api/user-delete?username=${encodeURIComponent(u.username)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('User deleted');
    } catch (err: any) {
      setUsers(prev);
      toast.error(err.message || 'Error deleting user');
    }
  };

  const handleReset = (u: CognitoUserRow) => {
    setMenuOpen(null);
    resetPassword(u);
  };

  const handleDelete = (u: CognitoUserRow) => {
    setMenuOpen(null);
    deleteUser(u);
  };

  // close dropdown on outside click
  const tableRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const fetchUsers = async (token?: string) => {
    setListLoading(true);
    try {
      const qs = token ? `?paginationToken=${encodeURIComponent(token)}` : '';
      const res = await fetch(`/api/users${qs}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers((prev) => (token ? [...prev, ...data.users] : data.users));
      setNextToken(data.nextToken);
    } catch (err: any) {
      toast.error(err.message || 'Error loading users');
    } finally {
      setListLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || undefined }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to invite user');
      }
      const data = await res.json();
      if (data.password) {
        await navigator.clipboard.writeText(data.password);
        toast.success(`User invited. Password copied: ${data.password}`);
      } else {
        toast.success('User invited');
      }
      setEmail('');
      setPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Error inviting user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Invite User</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="user@everybite.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Temporary Password (optional)</Label>
          <Input
            id="password"
            type="text"
            placeholder="Auto-generate if blank"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Inviting...' : 'Invite'}
        </Button>
      </form>

      {/* Users table */}
      <div ref={tableRef} className="overflow-x-auto overflow-visible">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Existing Users</h2>
          <Input
            placeholder="Search email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        {listLoading && users.length === 0 ? (
          <p>Loading…</p>
        ) : (
          <Table striped className="border border-gray-200 dark:border-gray-700">
            <THead className="bg-gray-100 dark:bg-gray-800 text-left">
              <TR>
                <TH className="px-3 py-2">Email</TH>
                <TH className="px-3 py-2">Status</TH>
                <TH className="px-3 py-2">Enabled</TH>
                <TH className="px-3 py-2">Created</TH>
                <TH />
              </TR>
            </THead>
            <TBody>
              {users
                .filter((u) => u.email.toLowerCase().includes(search.toLowerCase()))
                .map((u) => (
                  <Fragment key={u.username}>
                    <TR className="border-t border-gray-200 dark:border-gray-700">
                      <TD className="px-3 py-1 whitespace-nowrap">{u.email}</TD>
                      <TD className="px-3 py-1 capitalize">{u.status.toLowerCase()}</TD>
                      <TD className="px-3 py-1">
                        <Checkbox
                          checked={u.enabled}
                          onCheckedChange={(val: boolean | 'indeterminate') => toggleEnabled(u, Boolean(val))}
                        />
                      </TD>
                      <TD className="px-3 py-1 whitespace-nowrap">{new Date(u.created).toLocaleDateString()}</TD>
                      <TD className="px-1 py-1 text-right">
                        <Button className="px-2" title="Actions" onClick={() => setMenuOpen(menuOpen === u.username ? null : u.username)}>
                          ⋯
                        </Button>
                      </TD>
                    </TR>
                    {menuOpen === u.username && (
                      <TR className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                        <TD colSpan={5} className="px-4 py-2 space-x-4 text-right">
                          <Button onClick={() => resetPassword(u)}>Reset PW</Button>
                          <Button className="text-red-400" onClick={() => deleteUser(u)}>Delete</Button>
                        </TD>
                      </TR>
                    )}
                  </Fragment>
                ))}
            </TBody>
          </Table>
        )}
        {nextToken && (
          <Button disabled={listLoading} onClick={() => fetchUsers(nextToken)} className="mt-3">
            {listLoading ? 'Loading…' : 'Load more'}
          </Button>
        )}
      </div>
    </div>
  );
}
