import { Page } from "@playwright/test";

// Extract the storeCache type directly from the client
import { setup } from "../../client-vanilla/src/mud/setup";
type StoreCache = Awaited<ReturnType<typeof setup>>["network"]["storeCache"];

/**
 * Read an individual record from the client's data store.
 * This is necessary because `page.evaluate` can only transmit serialisable data,
 * so we can't just return the entire client store (which includes functions to read data)
 */
export async function readClientStore(page: Page, selector: Parameters<StoreCache["get"]>): Promise<StoreCache> {
  return page.evaluate((_selector) => {
    return window["storeCache"].get(..._selector);
  }, selector);
}
