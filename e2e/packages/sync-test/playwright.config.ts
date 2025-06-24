import { defineConfig } from "@playwright/test";

export default defineConfig({
  // disable playwright test runner as we're using vitest test runner and this has port conflicts
  // TODO: consider migrating to playwright test runner
  webServer: undefined,
});
