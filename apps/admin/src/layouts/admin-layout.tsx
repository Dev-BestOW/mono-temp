import { Link, NavLink, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { CATEGORIES } from "@repo/types";
import { cn } from "@repo/ui";

const linkClass = (active: boolean) =>
  cn(
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );

const groupLabelClass = "mt-5 mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground";

export function AdminLayout() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get("category");
  // Any /contents, /contents/new, /contents/:id/edit route.
  const onContents = location.pathname.startsWith("/contents");

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r border-border bg-card p-4">
        <div className="mb-6 px-2 text-lg font-semibold">Admin</div>
        <nav className="flex flex-col gap-1">
          <NavLink to="/" end className={({ isActive }) => linkClass(isActive)}>
            대시보드
          </NavLink>

          {/* Menu/category entries — unified with the user web nav. Each opens
              that category's content management (filtered list + new post). */}
          <div className={groupLabelClass}>메뉴</div>
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              to={`/contents?category=${category.slug}`}
              className={linkClass(onContents && activeCategory === category.slug)}
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
