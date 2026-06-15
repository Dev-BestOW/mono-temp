import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3001,
  },
  // Workspace UI package ships raw TSX — let Vite transpile it instead of
  // pre-bundling it as an external dependency.
  optimizeDeps: {
    exclude: ["@repo/ui", "@repo/utils", "@repo/types"],
  },
});
