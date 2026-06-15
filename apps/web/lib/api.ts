import { createApiClient } from "@repo/api";
import type { Content, ContentSummary } from "@repo/types";
import { sampleContent, sampleContentBySlug } from "./sample";

/**
 * Base URL of the separate backend server (server-side only).
 * Set `BACKEND_URL` in the environment. When unset, pages fall back to sample
 * content so the layout is still visible during local development.
 */
const backendUrl = process.env.BACKEND_URL ?? "";

export const hasBackend = backendUrl.length > 0;

export const api = createApiClient({
  baseUrl: backendUrl || "http://localhost:4000",
});

/** Latest published content across all categories. */
export async function getLatest(limit = 9): Promise<ContentSummary[]> {
  if (!hasBackend) return sampleContent.slice(0, limit);
  try {
    return (await api.listPublished()).slice(0, limit);
  } catch {
    return [];
  }
}

/** A single article by slug (with body), for the detail page. */
export async function getContentDetail(slug: string): Promise<Content | null> {
  if (!hasBackend) return sampleContentBySlug(slug);
  try {
    return await api.getBySlug(slug);
  } catch {
    return null;
  }
}

/** All published slugs, for static generation. */
export async function getAllSlugs(): Promise<string[]> {
  if (!hasBackend) return sampleContent.map((item) => item.slug);
  try {
    return (await api.listPublished()).map((item) => item.slug);
  } catch {
    return [];
  }
}

/** Published content for one category. */
export async function getByCategory(
  categorySlug: string,
  limit?: number,
): Promise<ContentSummary[]> {
  if (!hasBackend) {
    const items = sampleContent.filter((c) => c.categorySlug === categorySlug);
    return limit ? items.slice(0, limit) : items;
  }
  try {
    const items = await api.listPublished(categorySlug);
    return limit ? items.slice(0, limit) : items;
  } catch {
    return [];
  }
}
