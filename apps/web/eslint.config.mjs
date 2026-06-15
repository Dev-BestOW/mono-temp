import react from "@repo/config/eslint/react";

export default [
  ...react,
  {
    // Next.js files legitimately export `metadata`, route handlers, etc.
    // alongside components, so the Vite-oriented react-refresh rule is N/A.
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    ignores: [".next/**", ".next-build/**", "next-env.d.ts"],
  },
];
