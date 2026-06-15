import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory } from "@repo/types";
import "@repo/editor/content.css";
import { getContentDetail, getAllSlugs } from "@/lib/api";

// Incremental Static Regeneration: rebuild a page at most once per interval.
// On publish, call on-demand revalidation from the backend for instant updates.
export const revalidate = 60;

type PageParams = { params: Promise<{ slug: string }> };

const getContent = getContentDetail;

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent(slug);
  if (!content) return {};

  const title = content.seoTitle ?? content.title;
  const description = content.seoDescription ?? content.excerpt;

  return {
    title,
    description,
    alternates: { canonical: `/blog/${content.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: content.publishedAt ?? undefined,
      modifiedTime: content.updatedAt,
      images: content.coverImageUrl ? [content.coverImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageParams) {
  const { slug } = await params;
  const content = await getContent(slug);
  if (!content || content.status !== "published") notFound();

  // `bodyHtml` was pre-rendered at save time (no editor runtime on the web).
  const html = content.bodyHtml;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: content.title,
    description: content.excerpt,
    image: content.coverImageUrl ?? undefined,
    datePublished: content.publishedAt ?? undefined,
    dateModified: content.updatedAt,
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        {getCategory(content.categorySlug) ? (
          <Link
            href={`/category/${content.categorySlug}`}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {getCategory(content.categorySlug)?.name}
          </Link>
        ) : null}
        <h1 className="mt-2 text-4xl font-bold tracking-tight">{content.title}</h1>
        {content.publishedAt ? (
          <time className="mt-2 block text-sm text-muted-foreground" dateTime={content.publishedAt}>
            {new Date(content.publishedAt).toLocaleDateString("ko-KR")}
          </time>
        ) : null}
        <div
          className="content-body mt-8"
          // Content is authored in the trusted admin; sanitize here if you ever
          // open authoring to untrusted users.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </main>
  );
}
