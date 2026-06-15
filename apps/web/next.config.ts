import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Isolate dev and production build output dirs so running `next build` never
  // clobbers a live `next dev` cache (which caused missing chunks → CSS/JS not
  // loading). `next dev` → .next ; `next build`/`next start` → .next-build.
  distDir: process.env.NODE_ENV === "production" ? ".next-build" : ".next",
  // Transpile workspace packages that ship raw TypeScript/TSX source.
  transpilePackages: [
    "@repo/ui",
    "@repo/utils",
    "@repo/types",
    "@repo/editor",
    "@repo/api",
  ],
  // BlockNote runs as a server-side package for HTML rendering (not bundled).
  serverExternalPackages: [
    "@blocknote/core",
    "@blocknote/react",
    "@blocknote/server-util",
  ],
  // Emit a smaller, self-contained server bundle for containerized deploys.
  output: "standalone",
};

export default nextConfig;
