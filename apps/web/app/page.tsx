import Link from "next/link";
import { CATEGORIES, getCategory } from "@repo/types";
import { getLatest, getByCategory } from "@/lib/api";
import { ContentCard } from "@/components/content-card";
import { Section } from "@/components/section";
import { SITE } from "@/lib/site";

export const revalidate = 60;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  description: SITE.description,
};

// Categories highlighted with their own row on the home page.
const HOME_SECTIONS = CATEGORIES.slice(0, 4);

export default async function HomePage() {
  const latest = await getLatest(9);
  const [featured, ...rest] = latest;
  const sideList = rest.slice(0, 4);

  const sections = await Promise.all(
    HOME_SECTIONS.map(async (category) => ({
      category,
      items: await getByCategory(category.slug, 3),
    })),
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero: one featured article + a ranked shortlist */}
      {featured ? (
        <section className="grid gap-6 lg:grid-cols-5">
          <Link
            href={`/blog/${featured.slug}`}
            className="group lg:col-span-3 overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lg"
          >
            <div className="aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-brand-100 via-brand-200 to-brand-400">
              {featured.coverImageUrl ? (
                <img
                  src={featured.coverImageUrl}
                  alt={featured.title}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="p-6">
              <span className="text-sm font-semibold text-primary">
                {getCategory(featured.categorySlug)?.name}
              </span>
              <h1 className="mt-2 text-2xl font-bold leading-snug group-hover:underline sm:text-3xl">
                {featured.title}
              </h1>
              <p className="mt-2 line-clamp-2 text-muted-foreground">
                {featured.excerpt}
              </p>
            </div>
          </Link>

          <div className="lg:col-span-2">
            <h2 className="mb-3 text-lg font-bold">최근 가장 많이 본</h2>
            <ol className="overflow-hidden rounded-2xl border border-border bg-card">
              {sideList.map((item, index) => (
                <li key={item.id} className="border-b border-border last:border-0">
                  <Link
                    href={`/blog/${item.slug}`}
                    className="flex gap-3 p-4 hover:bg-muted"
                  >
                    <span className="text-lg font-bold text-primary">
                      {index + 1}
                    </span>
                    <div>
                      <span className="text-xs font-semibold text-primary">
                        {getCategory(item.categorySlug)?.name}
                      </span>
                      <p className="line-clamp-2 text-sm font-medium">
                        {item.title}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : (
        <p className="py-20 text-center text-muted-foreground">
          아직 콘텐츠가 없습니다.
        </p>
      )}

      {/* Latest across all categories */}
      {rest.length > 0 ? (
        <Section title="지금, 새롭게 올라온">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.slice(0, 6).map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </Section>
      ) : null}

      {/* Per-category rows */}
      {sections.map(({ category, items }) =>
        items.length > 0 ? (
          <Section
            key={category.slug}
            title={category.name}
            href={`/category/${category.slug}`}
          >
            <div className="grid gap-5 sm:grid-cols-3">
              {items.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          </Section>
        ) : null,
      )}
    </main>
  );
}
