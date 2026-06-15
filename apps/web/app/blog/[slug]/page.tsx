import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory } from "@repo/types";
import "@repo/editor/content.css";
import { getContentDetail, getAllSlugs } from "@/lib/api";
import { SITE } from "@/lib/site";
import { JsonLd } from "@/components/json-ld";
import {
  blogPostingJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
} from "@/lib/structured-data";

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
  const description = content.seoDescription ?? content.summary ?? content.excerpt;

  return {
    title,
    description,
    authors: [{ name: SITE.name }],
    alternates: { canonical: `/blog/${content.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${SITE.url}/blog/${content.slug}`,
      publishedTime: content.publishedAt ?? undefined,
      modifiedTime: content.updatedAt,
      authors: [SITE.name],
      section: getCategory(content.categorySlug)?.name,
      images: content.coverImageUrl ? [content.coverImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageParams) {
  const { slug } = await params;
  const content = await getContent(slug);
  if (!content || content.status !== "published") notFound();

  const category = getCategory(content.categorySlug);
  // `bodyHtml` was pre-rendered at save time (no editor runtime on the web).
  const html = content.bodyHtml;

  const breadcrumb = [
    { name: "홈", url: SITE.url },
    ...(category
      ? [{ name: category.name, url: `${SITE.url}/category/${category.slug}` }]
      : []),
    { name: content.title, url: `${SITE.url}/blog/${content.slug}` },
  ];

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <JsonLd data={blogPostingJsonLd(content)} />
      <JsonLd data={breadcrumbJsonLd(breadcrumb)} />
      {content.faqs.length > 0 ? <JsonLd data={faqJsonLd(content.faqs)} /> : null}

      {/* Visible breadcrumb (matches BreadcrumbList schema) */}
      <nav aria-label="breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-foreground">
              홈
            </Link>
          </li>
          {category ? (
            <>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={`/category/${category.slug}`}
                  className="hover:text-foreground"
                >
                  {category.name}
                </Link>
              </li>
            </>
          ) : null}
        </ol>
      </nav>

      <article className="mt-4">
        <h1 className="text-4xl font-bold tracking-tight">{content.title}</h1>
        {content.publishedAt ? (
          <time
            className="mt-2 block text-sm text-muted-foreground"
            dateTime={content.publishedAt}
          >
            {new Date(content.publishedAt).toLocaleDateString("ko-KR")}
          </time>
        ) : null}

        {/* Answer-first summary (TL;DR) — strong for AEO / snippets */}
        {content.summary ? (
          <div className="mt-6 rounded-lg border border-border bg-muted/60 p-4">
            <p className="text-xs font-semibold text-primary">요약</p>
            <p className="mt-1 leading-relaxed">{content.summary}</p>
          </div>
        ) : null}

        <div
          className="content-body mt-8"
          // Content is authored in the trusted admin; sanitize here if you ever
          // open authoring to untrusted users.
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* FAQ section (visible + FAQPage structured data) */}
        {content.faqs.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-2xl font-bold tracking-tight">자주 묻는 질문</h2>
            <dl className="mt-4 divide-y divide-border rounded-lg border border-border">
              {content.faqs.map((faq, index) => (
                <div key={index} className="p-4">
                  <dt className="font-semibold">{faq.question}</dt>
                  <dd className="mt-1 text-muted-foreground">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </article>
    </main>
  );
}
