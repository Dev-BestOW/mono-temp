import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { formatKRW } from "@repo/utils";

const stats = [
  { label: "총 사용자", value: "1,284", description: "지난 30일 +12%" },
  { label: "매출", value: formatKRW(48200000), description: "지난 30일 +8%" },
  { label: "활성 세션", value: "327", description: "현재 접속 중" },
];

export function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">대시보드</h1>
      <p className="mt-1 text-muted-foreground">서비스 핵심 지표 요약입니다.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-sm text-muted-foreground">
                {stat.description}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
