/** Site-wide branding. Edit here to rebrand the user web. */
export const SITE = {
  /** Two-tone wordmark: `mark` is brand-colored, `rest` follows. */
  mark: "My",
  rest: "Think",
  get name() {
    return `${this.mark}${this.rest}`;
  },
  description: "쉽게 이해하는 금융 콘텐츠 — 저축부터 투자, 세금, 연금까지.",
};
