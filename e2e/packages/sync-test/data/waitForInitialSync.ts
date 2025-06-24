import { Page, expect } from "@playwright/test";

export async function waitForInitialSync(page: Page) {
  const syncStep = page.locator("#sync-step");
  await expect(syncStep).toHaveText("live");
}
