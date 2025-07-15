import { Gauge, Menu, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import SmartMenusNav from "../features/smartMenus/components/SmartMenusNav";
import { Button } from "./ui/Button";
import { Separator } from "./ui/Separator";
import { Sheet, SheetContent, SheetTrigger } from "./ui/Sheet";

import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

interface NavItem {
  label: string;
  to: string;
  disabled?: boolean;
}
interface NavSection {
  heading: string;
  items: NavItem[];
}

export default function Layout() {
  const { logout } = useAuth();

  const navSections: NavSection[] = [
    {
      heading: "Home",
      items: [
        { label: "Dashboard", to: "/" },
        { label: "Users", to: "/users" },
      ],
    },
    {
      heading: "Documents",
      items: [{ label: "Reports", to: "/reports", disabled: true }],
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar trigger */}
      <div className="flex md:hidden items-center p-2 border-b">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Menu aria-hidden="true" className="h-4 w-4" />
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            {/* Reuse the same nav list */}
            <div className="h-full w-full flex flex-col">
              <div className="flex h-14 items-center px-4 text-lg font-semibold">
                EveryBite
              </div>
              <Separator />
              <nav
                aria-label="Sidebar navigation"
                className="flex-1 overflow-y-auto px-3 py-4 text-sm"
              >
                {navSections.map((section) => (
                  <div key={section.heading} className="space-y-1">
                    <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {section.heading}
                    </p>
                    {section.items.map(({ label, to, disabled }) => {
                      const Icon =
                        label === "Dashboard"
                          ? Gauge
                          : label === "Users"
                            ? Users
                            : label === "SmartMenus"
                              ? Menu
                              : undefined;
                      return (
                        <NavLink
                          key={label}
                          to={to}
                          end={to === "/"}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-2 rounded-md px-3 py-2 transition-colors",
                              isActive
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                              disabled && "pointer-events-none"
                            )
                          }
                        >
                          {Icon ? (
                            <Icon aria-hidden="true" className="h-4 w-4" />
                          ) : (
                            <span className="text-lg">•</span>
                          )}
                          <span>{label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                ))}
                <SmartMenusNav />
              </nav>
              <Separator />
              <div className="p-4">
                <Button variant="outline" className="w-full" onClick={logout}>
                  Log out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <h1 className="ml-4 font-semibold">EveryBite Admin</h1>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex w-64 flex-col border-r bg-muted/40",
          "shadcn:shadow shadcn:shadow-slate-400/20"
        )}
      >
        <div className="flex h-14 items-center px-4 text-lg font-semibold">
          EveryBite
        </div>
        <Separator />
        <nav
          aria-label="Sidebar navigation"
          className={cn(
            "flex-1 overflow-y-auto px-3 py-4 text-sm",
            "shadcn:py-4 shadcn:px-6"
          )}
        >
          {navSections.map((section) => (
            <div key={section.heading} className="space-y-1">
              <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {section.heading}
              </p>
              {section.items.map((item) => {
                const { label, to, disabled } = item;
                const Icon =
                  label === "Dashboard"
                    ? Gauge
                    : label === "Users"
                      ? Users
                      : label === "SmartMenus"
                        ? Menu
                        : undefined;
                return (
                  <NavLink
                    key={label}
                    to={to}
                    end={to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                        disabled && "pointer-events-none"
                      )
                    }
                  >
                    {Icon ? (
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <span className="text-lg">•</span>
                    )}
                    <span>{label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
          <SmartMenusNav />
        </nav>
        <Separator />
        <div className="p-4">
          <Button
            data-cy="logout-btn"
            variant="outline"
            className="w-full"
            onClick={logout}
          >
            Log out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <section
        className="flex-1 overflow-hidden"
        aria-label="Main content"
        id="main-content"
      >
        <Outlet />
      </section>
    </div>
  );
}

export { Layout };
