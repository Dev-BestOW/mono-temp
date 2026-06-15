import react from "@repo/config/eslint/react";

export default [
  ...react,
  {
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
];
