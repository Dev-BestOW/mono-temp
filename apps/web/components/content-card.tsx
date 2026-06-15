import Link from "next/link";
import { getCategory, type ContentSummary } from "@repo/types";

function Thumbnail({ src, alt }: { src: string | null; alt: string }) {
  if (src) {
    return <img src={src} alt={alt} className="h-full w-full object-cover" />;
  }
  return (
    <div className="h-full w-full bg-gradient-to-br from-brand-100 via-brand-200 to-brand-400" />
  );
}

export function ContentCard({ item }: { item: ContentSummary }) {
  const category = getCategory(item.categorySlug);
  return (
    <Link
      href={`/blog/${item.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-md"
    >
      <div className="aspect-[16/9] w-full overflow-hidden">
        <Thumbnail src={item.coverImageUrl} alt={item.title} />
      </div>
      <div className="flex flex-1 flex-col p-4">
        {category ? (
          <span className="text-xs font-semibold text-primary">{category.name}</span>
        ) : null}
        <h3 className="mt-1 line-clamp-2 font-semibold leading-snug group-hover:underline">
          {item.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {item.excerpt}
        </p>
        {item.publishedAt ? (
          <time className="mt-auto pt-3 text-xs text-muted-foreground">
            {new Date(item.publishedAt).toLocaleDateString("ko-KR")}
          </time>
        ) : null}
      </div>
    </Link>
  );
}
