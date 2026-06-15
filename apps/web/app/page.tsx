import type { Metadata } from "next";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";

export const metadata: Metadata = {
  title: "홈",
  description: "디자인시스템이 적용된 SEO 친화적 랜딩 페이지입니다.",
};

const features = [
  {
    title: "SEO 최적화",
    description: "App Router 메타데이터, 사이트맵, robots, JSON-LD까지 기본 제공.",
  },
  {
    title: "공유 디자인시스템",
    description: "@repo/ui의 토큰과 컴포넌트를 유저웹·어드민에서 동일하게 사용.",
  },
  {
    title: "모노레포",
    description: "Turborepo + pnpm으로 빌드 캐싱과 패키지 공유를 한 번에.",
  },
];

// Structured data for rich search results.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "My Service",
  url: "https://example.com",
};

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          더 나은 경험을 위한 서비스
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Next.js 유저웹과 React 어드민이 하나의 디자인시스템을 공유합니다.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button size="lg">시작하기</Button>
          <Button size="lg" variant="outline">
            더 알아보기
          </Button>
        </div>
      </section>

      <section className="mt-20 grid gap-6 sm:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" size="sm">
                자세히 →
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
