const baseConfig = require("../../.prettierrc.js");

/** @type {import('prettier').Config} */
module.exports = {
  ...baseConfig,
  plugins: ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
  importOrder: ["^[react]", "^@(?!/)", "^@/", "^[./]"],
  importOrderSortSpecifiers: true,
};
