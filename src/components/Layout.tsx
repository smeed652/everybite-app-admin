import { NavLink, Outlet } from 'react-router-dom';
import { Button } from './ui/Button';
import { Separator } from './ui/Separator';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

interface NavItem { label: string; to: string; disabled?: boolean }
interface NavSection { heading: string; items: NavItem[] }

export default function Layout() {
  const { logout } = useAuth();

  const navSections: NavSection[] = [
    {
      heading: 'Home',
      items: [
        { label: 'Dashboard', to: '/' },
        { label: 'Users', to: '/users' },
      ],
    },
    {
      heading: 'Documents',
      items: [
        { label: 'Reports', to: '/reports', disabled: true },
      ],
    },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className={cn("hidden md:flex w-64 flex-col border-r bg-muted/40", "shadcn:shadow shadcn:shadow-slate-400/20")}>
        <div className="flex h-14 items-center px-4 text-lg font-semibold">EveryBite</div>
        <Separator />
        <nav className={cn("flex-1 overflow-y-auto px-3 py-4 text-sm", "shadcn:py-4 shadcn:px-6")}>
          {navSections.map((section) => (
            <div key={section.heading} className="space-y-1">
              <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {section.heading}
              </p>
              {section.items.map((item) => {
                const { label, to, disabled } = item;
                return (
                <NavLink
                  key={label}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 transition-colors',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
                      disabled && 'opacity-50 pointer-events-none',
                    )
                  }
                >
                  {/* placeholder icon */}
                  <span className="text-lg">•</span>
                  <span>{label}</span>
                </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
        <Separator />
        <div className="p-4">
          <Button data-cy="logout-btn" variant="outline" className="w-full" onClick={logout}>
            Log out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
