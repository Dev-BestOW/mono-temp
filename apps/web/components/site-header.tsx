"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@repo/types";
import { cn } from "@repo/ui";
import { SITE } from "@/lib/site";

const navItems = [
  { name: "홈", href: "/" },
  ...CATEGORIES.map((c) => ({ name: c.name, href: `/category/${c.slug}` })),
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            <span className="text-primary">{SITE.mark}</span>
            {SITE.rest}
          </Link>
          <button
            type="button"
            aria-label="검색"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </div>

        <nav className="-mx-1 flex gap-1 overflow-x-auto pb-2">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative whitespace-nowrap px-3 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.name}
                {active ? (
                  <span className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-primary" />
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
