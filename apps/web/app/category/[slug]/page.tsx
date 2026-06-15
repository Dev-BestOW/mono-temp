import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, getCategory } from "@repo/types";
import { getByCategory } from "@/lib/api";
import { ContentCard } from "@/components/content-card";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import { SITE } from "@/lib/site";

export const revalidate = 60;

type PageParams = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: `${category.name} 관련 콘텐츠 모음`,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: PageParams) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const items = await getByCategory(slug);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "홈", url: SITE.url },
          { name: category.name, url: `${SITE.url}/category/${category.slug}` },
        ])}
      />
      <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
      <p className="mt-2 text-muted-foreground">
        {category.name} 카테고리의 콘텐츠입니다.
      </p>

      {items.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="mt-16 text-center text-muted-foreground">
          아직 콘텐츠가 없습니다.
        </p>
      )}
    </main>
  );
}
