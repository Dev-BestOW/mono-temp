import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
} from "@repo/ui";
import {
  loadSearchAnalytics,
  type SearchAnalytics,
  type SearchSource,
} from "../lib/search-analytics";

const num = (n: number) => n.toLocaleString("ko-KR");
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const pos = (n: number) => n.toFixed(1);

function Delta({
  value,
  unit = "%",
  lowerIsBetter = false,
}: {
  value: number;
  unit?: string;
  lowerIsBetter?: boolean;
}) {
  const good = lowerIsBetter ? value < 0 : value > 0;
  const arrow = value > 0 ? "▲" : value < 0 ? "▼" : "–";
  return (
    <span
      className={cn(
        "text-xs font-medium tabular-nums",
        value === 0
          ? "text-muted-foreground"
          : good
            ? "text-primary"
            : "text-destructive",
      )}
    >
      {arrow} {Math.abs(value)}
      {unit}
    </span>
  );
}

function Bars({ points }: { points: SearchAnalytics["daily"] }) {
  const max = Math.max(...points.map((p) => p.clicks));
  return (
    <div className="flex h-24 items-end gap-0.5">
      {points.map((p) => (
        <div
          key={p.date}
          title={`${p.date} · ${num(p.clicks)} 클릭 · ${num(p.impressions)} 노출`}
          className="flex-1 rounded-sm bg-primary/70 transition-colors hover:bg-primary"
          style={{ height: `${Math.max(4, (p.clicks / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function SourceBadge({ source }: { source: SearchSource }) {
  return (
    <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
      {source === "google" ? "Google" : "네이버"}
    </span>
  );
}

const SOURCE_TABS: { key: "all" | SearchSource; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "google", label: "Google" },
  { key: "naver", label: "네이버" },
];

export function SearchPerformance() {
  const [data, setData] = useState<SearchAnalytics | null>(null);
  const [source, setSource] = useState<"all" | SearchSource>("all");

  useEffect(() => {
    let active = true;
    loadSearchAnalytics().then((d) => active && setData(d));
    return () => {
      active = false;
    };
  }, []);

  if (!data) {
    return <p className="text-muted-foreground">검색 성과 불러오는 중…</p>;
  }

  const queries = data.topQueries.filter((q) => source === "all" || q.source === source);
  const opportunities = data.opportunities.filter(
    (q) => source === "all" || q.source === source,
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">검색 성과</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            검색어로 어떤 페이지에 유입됐는지 · {data.range.label} ({data.range.start} ~ {data.range.end})
          </p>
        </div>
        <span className="rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground">
          더미 데이터 (GSC · GA4 · 서치어드바이저 연동 가정)
        </span>
      </div>

      {/* Headline metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>총 클릭</CardDescription>
            <CardTitle className="text-3xl">{num(data.totals.clicks)}</CardTitle>
          </CardHeader>
          <CardContent>
            <Delta value={data.deltas.clicks} />
            <span className="ml-1 text-xs text-muted-foreground">전기간 대비</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>총 노출</CardDescription>
            <CardTitle className="text-3xl">{num(data.totals.impressions)}</CardTitle>
          </CardHeader>
          <CardContent>
            <Delta value={data.deltas.impressions} />
            <span className="ml-1 text-xs text-muted-foreground">전기간 대비</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>평균 CTR</CardDescription>
            <CardTitle className="text-3xl">{pct(data.totals.ctr)}</CardTitle>
          </CardHeader>
          <CardContent>
            <Delta value={data.deltas.ctr} unit="%p" />
            <span className="ml-1 text-xs text-muted-foreground">전기간 대비</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>평균 게재순위</CardDescription>
            <CardTitle className="text-3xl">{pos(data.totals.position)}</CardTitle>
          </CardHeader>
          <CardContent>
            <Delta value={data.deltas.position} unit="" lowerIsBetter />
            <span className="ml-1 text-xs text-muted-foreground">낮을수록 좋음</span>
          </CardContent>
        </Card>
      </div>

      {/* Daily trend + source split */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">일별 클릭 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <Bars points={data.daily} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">검색 소스 비중</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.bySource.map((s) => {
              const share = s.clicks / data.totals.clicks;
              return (
                <div key={s.source}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {s.source === "google" ? "Google" : "네이버"}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {num(s.clicks)} 클릭 · {pct(share)}
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${share * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Source filter */}
      <div className="inline-flex rounded-md border border-border p-0.5">
        {SOURCE_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSource(tab.key)}
            className={cn(
              "rounded px-3 py-1 text-sm font-medium transition-colors",
              source === tab.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top queries */}
        <section>
          <h3 className="text-base font-bold">상위 검색어</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            가장 많이 유입시킨 검색어와 도착 페이지.
          </p>
          <Card className="mt-3">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-3 font-medium">검색어</th>
                    <th className="p-3 font-medium tabular-nums">클릭</th>
                    <th className="p-3 font-medium tabular-nums">CTR</th>
                    <th className="p-3 font-medium tabular-nums">순위</th>
                  </tr>
                </thead>
                <tbody>
                  {queries.map((s) => (
                    <tr key={s.query} className="border-b border-border last:border-0">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{s.query}</span>
                          <SourceBadge source={s.source} />
                        </div>
                        <div className="text-xs text-muted-foreground">{s.topPage}</div>
                      </td>
                      <td className="p-3 tabular-nums">{num(s.clicks)}</td>
                      <td className="p-3 tabular-nums">{pct(s.ctr)}</td>
                      <td className="p-3 tabular-nums">{pos(s.position)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>

        {/* Opportunity queries */}
        <section>
          <h3 className="text-base font-bold">기회 검색어</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            노출은 되는데 순위 5~15위 — 조금만 손보면 오를 글.
          </p>
          <Card className="mt-3">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-3 font-medium">검색어</th>
                    <th className="p-3 font-medium tabular-nums">노출</th>
                    <th className="p-3 font-medium tabular-nums">순위</th>
                  </tr>
                </thead>
                <tbody>
                  {opportunities.length ? (
                    opportunities.map((s) => (
                      <tr key={s.query} className="border-b border-border last:border-0">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{s.query}</span>
                            <SourceBadge source={s.source} />
                          </div>
                          <div className="text-xs text-muted-foreground">{s.topPage}</div>
                        </td>
                        <td className="p-3 tabular-nums">{num(s.impressions)}</td>
                        <td className="p-3">
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary tabular-nums">
                            {pos(s.position)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-4 text-muted-foreground">
                        해당 소스의 기회 검색어가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Page performance + GA4 behavior */}
      <section>
        <h3 className="text-base font-bold">페이지별 성과</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          검색 유입(클릭·노출·순위)과 유입 후 행동(GA4)을 함께.
        </p>
        <Card className="mt-3">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-3 font-medium">페이지</th>
                  <th className="p-3 font-medium tabular-nums">클릭</th>
                  <th className="p-3 font-medium tabular-nums">노출</th>
                  <th className="p-3 font-medium tabular-nums">CTR</th>
                  <th className="p-3 font-medium tabular-nums">순위</th>
                  <th className="p-3 font-medium tabular-nums">참여율</th>
                  <th className="p-3 font-medium tabular-nums">전환</th>
                </tr>
              </thead>
              <tbody>
                {data.pages.map((p) => (
                  <tr key={p.slug} className="border-b border-border last:border-0">
                    <td className="p-3">
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-muted-foreground">/blog/{p.slug}</div>
                    </td>
                    <td className="p-3 tabular-nums">{num(p.clicks)}</td>
                    <td className="p-3 tabular-nums">{num(p.impressions)}</td>
                    <td className="p-3 tabular-nums">{pct(p.ctr)}</td>
                    <td className="p-3 tabular-nums">{pos(p.position)}</td>
                    <td className="p-3 tabular-nums">{pct(p.engagementRate)}</td>
                    <td className="p-3 tabular-nums">{num(p.conversions)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
