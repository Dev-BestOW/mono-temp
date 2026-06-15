import Link from "next/link";
import type { ReactNode } from "react";

export function Section({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-12">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {href ? (
          <Link
            href={href}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            더보기 →
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
