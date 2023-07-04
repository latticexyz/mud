import { SyncState } from "@latticexyz/network";
import { Page, expect } from "@playwright/test";

export async function waitForInitialSync(page: Page) {
  const syncState = page.locator("#sync-state");
  await expect(syncState).toHaveText(String(SyncState.LIVE));
}
