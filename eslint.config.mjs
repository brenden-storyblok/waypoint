import eslintConfig from "eslint-config-next/core-web-vitals";

export default [
  {
    ignores: [
      ".claude/**",
      "storybook-static/**",
    ],
  },
  ...eslintConfig,
];
