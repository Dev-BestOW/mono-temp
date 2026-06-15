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

/** A piece of editor-authored content shown on the user web. */
export interface Content {
  id: string;
  /** URL-safe identifier used for the SEO route, e.g. /blog/[slug]. */
  slug: string;
  title: string;
  /** Source of truth: the Tiptap JSON document. */
  body: ContentDocument;
  excerpt: string;
  coverImageUrl: string | null;
  /** SEO overrides; fall back to title/excerpt when empty. */
  seoTitle: string | null;
  seoDescription: string | null;
  status: ContentStatus;
  publishedAt: string | null;
  updatedAt: string;
}

/** Lightweight shape for list views (no full body). */
export type ContentSummary = Omit<Content, "body">;

/** Payload for creating/updating content from the admin. */
export interface ContentInput {
  slug: string;
  title: string;
  body: ContentDocument;
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
