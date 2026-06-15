import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@repo/ui";

const navItems = [
  { to: "/", label: "대시보드", end: true },
  { to: "/menus", label: "메뉴", end: false },
  { to: "/contents", label: "콘텐츠", end: false },
  { to: "/users", label: "사용자", end: false },
];

export function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r border-border bg-card p-4">
        <div className="mb-6 px-2 text-lg font-semibold">Admin</div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
