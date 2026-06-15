import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Transpile workspace packages that ship raw TypeScript/TSX source.
  transpilePackages: ["@repo/ui", "@repo/utils", "@repo/types"],
  // Emit a smaller, self-contained server bundle for containerized deploys.
  output: "standalone",
};

export default nextConfig;
