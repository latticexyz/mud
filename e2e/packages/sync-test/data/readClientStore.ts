import { Page } from "@playwright/test";

// Extract the storeCache type directly from the client
import { setup } from "../../client-vanilla/src/mud/setup";
type StoreCache = Awaited<ReturnType<typeof setup>>["network"]["storeCache"];

export async function readClientStore(page: Page, selector: Parameters<StoreCache["get"]>): Promise<StoreCache> {
  return page.evaluate((_selector) => {
    return window["storeCache"].get(..._selector);
  }, selector);
}
