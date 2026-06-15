import { useState } from "react";
import { Button, Card, CardContent, Input } from "@repo/ui";
import type { User } from "@repo/types";

const seedUsers: User[] = [
  {
    id: "1",
    email: "hong@example.com",
    name: "홍길동",
    role: "user",
    createdAt: "2026-01-12",
  },
  {
    id: "2",
    email: "admin@example.com",
    name: "관리자",
    role: "admin",
    createdAt: "2026-02-03",
  },
];

export function UsersPage() {
  const [query, setQuery] = useState("");

  const filtered = seedUsers.filter(
    (user) =>
      user.name.includes(query) || user.email.includes(query.toLowerCase()),
  );

  return (
    <div>
      <h1 className="text-2xl font-bold">사용자</h1>
      <p className="mt-1 text-muted-foreground">사용자 목록을 관리합니다.</p>

      <div className="mt-6 flex max-w-md gap-2">
        <Input
          placeholder="이름 또는 이메일 검색"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Button variant="outline">검색</Button>
      </div>

      <Card className="mt-4">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="p-4 font-medium">이름</th>
                <th className="p-4 font-medium">이메일</th>
                <th className="p-4 font-medium">역할</th>
                <th className="p-4 font-medium">가입일</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.role}</td>
                  <td className="p-4">{user.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
