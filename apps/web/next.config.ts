import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
