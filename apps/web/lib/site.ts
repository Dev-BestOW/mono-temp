const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

// Fail the production build if the canonical domain is still the placeholder.
// Every canonical/OG/sitemap/JSON-LD URL derives from this, so shipping
// `example.com` would silently break indexing. Guarded to the build phase so a
// misconfigured deploy fails loudly instead of going live with wrong URLs.
if (
  process.env.NEXT_PHASE === "phase-production-build" &&
  (!rawSiteUrl || rawSiteUrl.includes("example.com"))
) {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL must be set to the real production domain before building " +
      "(it is the base for all canonical / OpenGraph / sitemap / JSON-LD URLs).",
  );
}

/** Site-wide branding & identity. Edit here to rebrand the user web. */
export const SITE = {
  /** Two-tone wordmark: `mark` is brand-colored, `rest` follows. */
  mark: "My",
  rest: "Think",
  get name() {
    return `${this.mark}${this.rest}`;
  },
  description: "쉽게 이해하는 금융 콘텐츠 — 저축부터 투자, 세금, 연금까지.",
  /** Canonical base URL (no trailing slash). */
  url: (rawSiteUrl ?? "https://example.com").replace(/\/$/, ""),
  locale: "ko_KR",
  /** Organization social profiles for `sameAs` (fill in when available). */
  sameAs: [] as string[],
};
