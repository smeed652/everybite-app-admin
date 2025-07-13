import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, Menu } from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function SmartMenusNav() {
  const location = useLocation();
  const isInsideSmartMenus = location.pathname.startsWith('/smart-menus');
  const detailMatch = location.pathname.match(/^\/smart-menus\/(?<id>[^/]+)/);
  const widgetId = detailMatch?.groups?.id;

  const [open, setOpen] = useState(isInsideSmartMenus);
  // Open section automatically when user navigates into it
  useEffect(() => {
    if (isInsideSmartMenus) setOpen(true);
  }, [isInsideSmartMenus]);

  const baseClasses = 'flex items-center gap-2 rounded-md px-3 py-2 transition-colors';
  const inactive = 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground';
  const active = 'bg-accent text-accent-foreground font-medium';

  return (
    <div className="space-y-1">
      {/* Parent toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(baseClasses, 'w-full justify-between', isInsideSmartMenus ? active : inactive)}
      >
        <span className="flex items-center gap-2">
          <Menu className="h-4 w-4" />
          SmartMenus
        </span>
        <ChevronDown className={cn('h-4 w-4 transform transition-transform', open ? 'rotate-180' : '')} />
      </button>

      {open && (
        <div className="pl-6" aria-label="SmartMenus submenu">
          <NavLink
            to="/smart-menus"
            className={({ isActive }) =>
              cn(baseClasses, isActive ? active : inactive, 'block')}
          >
            List
          </NavLink>

          {widgetId && (
            <>
              <NavLink
                to={`/smart-menus/${widgetId}`}
                className={({ isActive }) =>
                  cn(baseClasses, isActive ? active : inactive, 'block')}
              >
                Basics
              </NavLink>
              <NavLink
                to={`/smart-menus/${widgetId}/features`}
                className={() => cn(baseClasses, inactive, 'block') }
              >
                Features
              </NavLink>
              <NavLink
                to={`/smart-menus/${widgetId}/marketing`}
                className={() => cn(baseClasses, inactive, 'block') }
              >
                Marketing
              </NavLink>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export { SmartMenusNav };
