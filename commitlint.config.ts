import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  ignores: [(commit) => commit.startsWith("Revert ")],
};

export default config;
