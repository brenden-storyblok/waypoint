import eslintConfig from "eslint-config-next/core-web-vitals";

export default [
  {
    ignores: [
      ".claude/**",
      "storybook-static/**",
      "ds-bundle/**",
      ".ds-sync/**",
      ".design-sync/sb-reference/**",
      ".design-sync/.cache/**",
    ],
  },
  ...eslintConfig,
];
