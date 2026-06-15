import Link from "next/link";
import { CATEGORIES } from "@repo/types";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
          <div>
            <div className="text-xl font-extrabold tracking-tight">
              <span className="text-primary">{SITE.mark}</span>
              {SITE.rest}
            </div>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              {SITE.description}
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          © 2026 {SITE.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
