import type { Content } from "@repo/types";
import { api } from "./api";
import { sampleContents } from "./sample-content";

export interface ContentsResult {
  contents: Content[];
  /** True when the backend was unreachable and sample data is shown instead. */
  usingSample: boolean;
}

/**
 * Load all content with full bodies/FAQs for SEO analysis. The admin list
 * endpoint returns summaries only (no `bodyHtml`/`faqs`), so we hydrate each
 * item via `getById`. Falls back to sample content when the backend is down.
 */
export async function loadAllContents(): Promise<ContentsResult> {
  try {
    const summaries = await api.listAll();
    const details = await Promise.all(summaries.map((s) => api.getById(s.id)));
    const contents = details.filter((c): c is Content => c !== null);
    return { contents, usingSample: false };
  } catch {
    return { contents: sampleContents, usingSample: true };
  }
}
