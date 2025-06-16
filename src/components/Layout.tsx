import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { useAuth } from '../context/AuthContext';

interface NavItem { label: string; to: string; disabled?: boolean }
interface NavSection { heading: string; items: NavItem[] }

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

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
      <aside className="w-60 bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-200 dark:border-gray-800">EveryBite</div>
        <nav className="flex-1 space-y-4 px-3 py-2 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.heading} className="space-y-1">
              <p className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
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
                    `flex items-center gap-2 rounded px-3 py-2 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-800 ${
                      isActive ? 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                    } ${disabled ? 'opacity-50 pointer-events-none' : ''}`
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
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Button variant="outline" className="w-full" onClick={logout}>
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
