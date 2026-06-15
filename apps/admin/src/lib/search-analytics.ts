/**
 * Search performance (GSC / GA4 / Naver Search Advisor) — FRONTEND MOCK.
 *
 * Shape mirrors `docs/search-analytics-integration.md`. This is dummy data so
 * the dashboard can be built before the real backend integration exists. When
 * the backend is wired, replace `loadSearchAnalytics()` with `@repo/api` calls
 * that read the cached aggregates; the component contract stays the same.
 */

export type SearchSource = "google" | "naver";

export interface QueryStat {
  query: string;
  source: SearchSource;
  clicks: number;
  impressions: number;
  ctr: number; // 0–1
  position: number; // avg rank
  topPage: string; // article title the query mostly led to
}

export interface PagePerf {
  slug: string;
  title: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  /** GA4 post-click behavior (organic). */
  sessions: number;
  engagementRate: number; // 0–1
  conversions: number;
}

export interface DailyPoint {
  date: string; // YYYY-MM-DD
  clicks: number;
  impressions: number;
}

export interface SourceSplit {
  source: SearchSource;
  clicks: number;
  impressions: number;
}

export interface SearchAnalytics {
  range: { start: string; end: string; label: string };
  totals: { clicks: number; impressions: number; ctr: number; position: number };
  /** % change vs previous period (position uses points; lower is better). */
  deltas: { clicks: number; impressions: number; ctr: number; position: number };
  daily: DailyPoint[];
  topQueries: QueryStat[];
  opportunities: QueryStat[];
  pages: PagePerf[];
  bySource: SourceSplit[];
}

// --- dummy series -----------------------------------------------------------
const DAY = 86_400_000;
const END_TS = new Date("2026-06-13T00:00:00Z").getTime();
const isoDay = (ts: number) => new Date(ts).toISOString().slice(0, 10);

const daily: DailyPoint[] = Array.from({ length: 28 }, (_, i) => {
  const trend = 26 + i * 1.6; // gentle upward trend
  const wobble = ((i * 7) % 5) * 2.5;
  const weekendDip = i % 7 === 5 || i % 7 === 6 ? 11 : 0;
  const clicks = Math.max(6, Math.round(trend + wobble - weekendDip));
  const impressions = Math.round(clicks * (15 + (i % 6)));
  return { date: isoDay(END_TS - (27 - i) * DAY), clicks, impressions };
});

const totalClicks = daily.reduce((s, d) => s + d.clicks, 0);
const totalImpr = daily.reduce((s, d) => s + d.impressions, 0);

function q(
  query: string,
  source: SearchSource,
  clicks: number,
  impressions: number,
  position: number,
  topPage: string,
): QueryStat {
  return { query, source, clicks, impressions, ctr: clicks / impressions, position, topPage };
}

const topQueries: QueryStat[] = [
  q("연금저축 세액공제 한도", "google", 412, 5210, 3.1, "연금저축 세액공제 한도 총정리"),
  q("파킹통장 추천", "naver", 388, 9120, 6.4, "파킹통장 200% 활용법"),
  q("etf 투자 방법", "google", 274, 6890, 8.2, "ETF 투자 기초"),
  q("신용점수 올리는 법", "google", 233, 4120, 4.7, "신용점수 올리는 현실적인 방법"),
  q("저축 잘하는 법", "naver", 198, 7430, 9.9, "저축 전략 완벽 가이드"),
  q("연말정산 환급 많이 받는법", "google", 161, 8800, 11.3, "연말정산 미리 준비하기"),
  q("isa 계좌 장점", "google", 142, 3960, 6.8, "ETF 투자 기초"),
  q("신혼부부 가계부 앱", "naver", 121, 5240, 12.6, "신혼부부 가계부 작성법"),
  q("주택청약 1순위 조건", "google", 98, 7110, 14.2, "저축 전략 완벽 가이드"),
  q("irp 퇴직연금 차이", "google", 76, 2980, 7.5, "연금저축 세액공제 한도 총정리"),
  q("적금 금리 비교", "naver", 64, 4380, 13.8, "파킹통장 200% 활용법"),
  q("연금저축펀드 추천", "google", 51, 3320, 9.1, "연금저축 세액공제 한도 총정리"),
];

const opportunities = topQueries
  .filter((s) => s.position >= 5 && s.position <= 15)
  .sort((a, b) => b.impressions - a.impressions)
  .slice(0, 6);

function page(
  slug: string,
  title: string,
  clicks: number,
  impressions: number,
  position: number,
  sessions: number,
  engagementRate: number,
  conversions: number,
): PagePerf {
  return { slug, title, clicks, impressions, ctr: clicks / impressions, position, sessions, engagementRate, conversions };
}

const pages: PagePerf[] = [
  page("pension-tax-credit", "연금저축 세액공제 한도 총정리", 539, 11510, 4.2, 612, 0.71, 23),
  page("savings-quick-tip", "파킹통장 200% 활용법", 452, 13660, 7.1, 503, 0.58, 9),
  page("invest-etf-basics", "ETF 투자 기초", 416, 10850, 7.9, 471, 0.64, 14),
  page("loan-credit-score", "신용점수 올리는 현실적인 방법", 233, 4120, 4.7, 268, 0.69, 6),
  page("savings-strategy-guide", "저축 전략 완벽 가이드", 296, 14540, 10.4, 331, 0.52, 4),
  page("life-budgeting", "신혼부부 가계부 작성법", 121, 5240, 12.6, 138, 0.47, 2),
];

const bySource: SourceSplit[] = [
  { source: "google", clicks: Math.round(totalClicks * 0.63), impressions: Math.round(totalImpr * 0.59) },
  { source: "naver", clicks: Math.round(totalClicks * 0.37), impressions: Math.round(totalImpr * 0.41) },
];

const data: SearchAnalytics = {
  range: { start: isoDay(END_TS - 27 * DAY), end: isoDay(END_TS), label: "최근 28일" },
  totals: { clicks: totalClicks, impressions: totalImpr, ctr: totalClicks / totalImpr, position: 8.9 },
  deltas: { clicks: 18.2, impressions: 9.7, ctr: 0.5, position: -1.6 },
  daily,
  topQueries,
  opportunities,
  pages,
  bySource,
};

/** Mock loader — swap for `@repo/api` analytics reads once the backend exists. */
export function loadSearchAnalytics(): Promise<SearchAnalytics> {
  return Promise.resolve(data);
}
