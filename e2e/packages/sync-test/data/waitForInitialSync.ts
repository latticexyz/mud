import { SyncState } from "@latticexyz/network";
import { sleep } from "@latticexyz/utils";
import { Page, expect } from "@playwright/test";

export async function waitForInitialSync(page: Page) {
  const syncState = page.locator("#sync-state");
  await expect(syncState).toHaveText(String(SyncState.LIVE));
  await sleep(10000);
}
