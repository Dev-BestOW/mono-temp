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
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com").replace(/\/$/, ""),
  locale: "ko_KR",
  /** Organization social profiles for `sameAs` (fill in when available). */
  sameAs: [] as string[],
};
