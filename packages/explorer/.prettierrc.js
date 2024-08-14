const baseConfig = require("../../.prettierrc.js");

/** @type {import('prettier').Config} */
module.exports = {
  ...baseConfig,
  plugins: ["prettier-plugin-tailwindcss", "@trivago/prettier-plugin-sort-imports"],
  importOrder: ["^[react]", "^@(?!/)", "^@/", "^[./]"],
  importOrderSortSpecifiers: true,
};
