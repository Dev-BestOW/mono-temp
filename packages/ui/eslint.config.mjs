import react from "@repo/config/eslint/react";

export default [
  ...react,
  {
    // This is a component library, not an app with Fast Refresh boundaries,
    // so co-exporting variants/helpers next to components is fine.
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
];
