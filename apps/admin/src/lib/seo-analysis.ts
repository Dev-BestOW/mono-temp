import { CATEGORIES, getCategory, type Content } from "@repo/types";

/**
 * On-page SEO / AEO / GEO analysis — pure functions over the content we already
 * have (no external API). Mirrors the checklist in `docs/seo-geo-aeo.md` so the
 * admin dashboard can flag what to fix before/after publishing.
 */

// --- Thresholds (opinionated, tuned for Korean content) ---------------------
export const TITLE_MAX = 60;
export const DESC_MIN = 120;
export const DESC_MAX = 155;
export const MIN_FAQS = 3;
/** Body text shorter than this (chars, whitespace stripped) reads as thin. */
export const MIN_BODY_CHARS = 600;
/** Published content not touched in this many days is a freshness risk (GEO). */
export const STALE_DAYS = 180;

export interface SeoCheck {
  key: string;
  label: string;
  ok: boolean;
  weight: number;
}

export interface ArticleReport {
  id: string;
  title: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  status: Content["status"];
  updatedAt: string;
  /** 0–100 weighted on-page score. */
  score: number;
  checks: SeoCheck[];
  /** Labels of the failed checks (what to fix). */
  missing: string[];
  /** AEO: missing answer-first summary or too few FAQs. */
  aeoGap: boolean;
}

export interface CategoryStat {
  slug: string;
  name: string;
  published: number;
  draft: number;
}

export interface DuplicateIssue {
  kind: "slug" | "title" | "description";
  value: string;
  titles: string[];
}

export interface SeoReport {
  totalPublished: number;
  totalDraft: number;
  avgScore: number;
  /** All published reports, lowest score first. */
  articles: ArticleReport[];
  /** Published articles missing summary or enough FAQs. */
  aeoGaps: ArticleReport[];
  categories: CategoryStat[];
  emptyCategories: CategoryStat[];
  /** Published articles past the freshness window, oldest first. */
  stale: ArticleReport[];
  duplicates: DuplicateIssue[];
}

// --- bodyHtml helpers (regex; admin runs in the browser but keep it pure) ----
function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function bodyCharCount(html: string): number {
  return stripTags(html).replace(/\s/g, "").length;
}

export function imagesMissingAlt(html: string): number {
  const imgs = html.match(/<img\b[^>]*>/gi) ?? [];
  return imgs.filter((tag) => !/\balt\s*=\s*["'][^"']*["']/i.test(tag)).length;
}

function headingsOk(html: string): boolean {
  const levels = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
  const h1s = levels.filter((l) => l === 1).length;
  if (h1s > 1) return false; // multiple H1
  for (let i = 1; i < levels.length; i++) {
    if (levels[i]! - levels[i - 1]! > 1) return false; // skipped level
  }
  return true;
}

function metaDescription(c: Content): string {
  return (c.seoDescription ?? c.excerpt ?? "").trim();
}

function buildChecks(c: Content): SeoCheck[] {
  const desc = metaDescription(c);
  const chars = bodyCharCount(c.bodyHtml);
  return [
    {
      key: "summary",
      label: "요약(TL;DR)",
      ok: Boolean(c.summary && c.summary.trim()),
      weight: 20,
    },
    {
      key: "faqs",
      label: `FAQ ${MIN_FAQS}개 이상`,
      ok: c.faqs.length >= MIN_FAQS,
      weight: 20,
    },
    {
      key: "description",
      label: `메타설명 ${DESC_MIN}~${DESC_MAX}자`,
      ok: desc.length >= DESC_MIN && desc.length <= DESC_MAX,
      weight: 15,
    },
    {
      key: "body",
      label: `본문 분량(${MIN_BODY_CHARS}자+)`,
      ok: chars >= MIN_BODY_CHARS,
      weight: 15,
    },
    {
      key: "cover",
      label: "커버 이미지(OG)",
      ok: Boolean(c.coverImageUrl),
      weight: 10,
    },
    {
      key: "title",
      label: `제목 길이(≤${TITLE_MAX}자)`,
      ok: c.title.length <= TITLE_MAX,
      weight: 10,
    },
    {
      key: "alt",
      label: "이미지 alt",
      ok: imagesMissingAlt(c.bodyHtml) === 0,
      weight: 5,
    },
    {
      key: "headings",
      label: "헤딩 구조",
      ok: headingsOk(c.bodyHtml),
      weight: 5,
    },
  ];
}

export function analyzeArticle(c: Content): ArticleReport {
  const checks = buildChecks(c);
  const score = checks.reduce((sum, ch) => sum + (ch.ok ? ch.weight : 0), 0);
  const aeoGap = !c.summary?.trim() || c.faqs.length < MIN_FAQS;
  return {
    id: c.id,
    title: c.title,
    slug: c.slug,
    categorySlug: c.categorySlug,
    categoryName: getCategory(c.categorySlug)?.name ?? c.categorySlug,
    status: c.status,
    updatedAt: c.updatedAt,
    score,
    checks,
    missing: checks.filter((ch) => !ch.ok).map((ch) => ch.label),
    aeoGap,
  };
}

function findDuplicates(
  contents: Content[],
  kind: DuplicateIssue["kind"],
  keyOf: (c: Content) => string,
): DuplicateIssue[] {
  const groups = new Map<string, Content[]>();
  for (const c of contents) {
    const key = keyOf(c).trim().toLowerCase();
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), c]);
  }
  return [...groups.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([, items]) => ({
      kind,
      value: keyOf(items[0]!),
      titles: items.map((c) => c.title),
    }));
}

export function analyzeContents(contents: Content[], now = new Date()): SeoReport {
  const published = contents.filter((c) => c.status === "published");
  const reports = published
    .map(analyzeArticle)
    .sort((a, b) => a.score - b.score);

  const avgScore = reports.length
    ? Math.round(reports.reduce((s, r) => s + r.score, 0) / reports.length)
    : 0;

  const categories: CategoryStat[] = CATEGORIES.map((cat) => ({
    slug: cat.slug,
    name: cat.name,
    published: contents.filter(
      (c) => c.categorySlug === cat.slug && c.status === "published",
    ).length,
    draft: contents.filter(
      (c) => c.categorySlug === cat.slug && c.status === "draft",
    ).length,
  }));

  const staleBefore = now.getTime() - STALE_DAYS * 24 * 60 * 60 * 1000;
  const stale = reports
    .filter((r) => new Date(r.updatedAt).getTime() < staleBefore)
    .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());

  return {
    totalPublished: published.length,
    totalDraft: contents.length - published.length,
    avgScore,
    articles: reports,
    aeoGaps: reports.filter((r) => r.aeoGap),
    categories,
    emptyCategories: categories.filter((c) => c.published === 0),
    stale,
    duplicates: [
      ...findDuplicates(contents, "slug", (c) => c.slug),
      ...findDuplicates(contents, "title", (c) => c.title),
      ...findDuplicates(contents, "description", (c) => c.seoDescription ?? ""),
    ],
  };
}
