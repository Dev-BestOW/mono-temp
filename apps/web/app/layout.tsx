import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "My Service — 더 나은 경험을 위한 서비스",
    template: "%s | My Service",
  },
  description:
    "SEO에 최적화된 Next.js 기반 유저 웹입니다. 빠르고, 접근성이 높고, 검색에 잘 노출됩니다.",
  keywords: ["서비스", "Next.js", "디자인시스템", "모노레포"],
  authors: [{ name: "My Service" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "My Service",
    title: "My Service — 더 나은 경험을 위한 서비스",
    description: "SEO에 최적화된 Next.js 기반 유저 웹입니다.",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Service",
    description: "SEO에 최적화된 Next.js 기반 유저 웹입니다.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
