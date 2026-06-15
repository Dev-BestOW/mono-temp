/** Standard API envelope returned by the backend. */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/** Cursor/offset paginated collection. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Minimal user shape shared across user web and admin. */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export type UserRole = "user" | "admin";

/**
 * Editor document: an array of BlockNote blocks.
 * Kept loose here so `@repo/types` has no hard editor dependency.
 * Cast to `PartialBlock[]` from `@repo/editor` when rendering/editing.
 */
export type ContentDocument = unknown[];

export type ContentStatus = "draft" | "published";

/** A top-level menu/category that organizes content (benchmarked from KB Think). */
export interface Category {
  slug: string;
  name: string;
  /** Display order in the nav. */
  order: number;
}

/**
 * Canonical menu set. Both the user-web nav and the admin category selector
 * read from here so they never drift. Rename/extend freely.
 */
export const CATEGORIES: Category[] = [
  { slug: "savings", name: "저축", order: 1 },
  { slug: "invest", name: "투자", order: 2 },
  { slug: "loan", name: "대출", order: 3 },
  { slug: "life", name: "라이프", order: 4 },
  { slug: "realestate", name: "부동산", order: 5 },
  { slug: "tax", name: "세금", order: 6 },
  { slug: "insurance", name: "보험", order: 7 },
  { slug: "pension", name: "연금", order: 8 },
  { slug: "business", name: "사업자", order: 9 },
];

/** Default category (first in the menu) — handy for new-content defaults. */
export const DEFAULT_CATEGORY: Category = CATEGORIES[0]!;

/** Look up a category by slug. */
export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

/** A piece of editor-authored content shown on the user web. */
export interface Content {
  id: string;
  /** URL-safe identifier used for the SEO route, e.g. /blog/[slug]. */
  slug: string;
  /** Menu/category this content belongs to (see CATEGORIES). */
  categorySlug: string;
  title: string;
  /** Source of truth: the BlockNote document (for re-editing). */
  body: ContentDocument;
  /**
   * Pre-rendered semantic HTML of `body`, generated at save time.
   * The user web renders this directly (no editor runtime on the web).
   */
  bodyHtml: string;
  excerpt: string;
  coverImageUrl: string | null;
  /** SEO overrides; fall back to title/excerpt when empty. */
  seoTitle: string | null;
  seoDescription: string | null;
  status: ContentStatus;
  publishedAt: string | null;
  updatedAt: string;
}

/** Lightweight shape for list views (no full body or rendered HTML). */
export type ContentSummary = Omit<Content, "body" | "bodyHtml">;

/** Payload for creating/updating content from the admin. */
export interface ContentInput {
  slug: string;
  categorySlug: string;
  title: string;
  body: ContentDocument;
  /** Pre-rendered HTML of `body` (generated client-side at save). */
  bodyHtml: string;
  excerpt?: string;
  coverImageUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status?: ContentStatus;
}

/** Response from the image upload endpoint. */
export interface UploadResult {
  url: string;
}
