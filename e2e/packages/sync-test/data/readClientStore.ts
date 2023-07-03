import { Page } from "@playwright/test";

// Extract the storeCache type directly from the client
import { setup } from "../../client-vanilla/src/mud/setup";
import { deserialize, serialize } from "./utils";
type StoreCache = Awaited<ReturnType<typeof setup>>["network"]["storeCache"];

/**
 * Read an individual record from the client's data store.
 * This is necessary because `page.evaluate` can only transmit serialisable data,
 * so we can't just return the entire client store (which includes functions to read data)
 */
export async function readClientStore(
  page: Page,
  [namespace, table, key]: Parameters<StoreCache["get"]>
): Promise<Record<string, unknown> | undefined> {
  const selector = [namespace, table, serialize(key)];
  const serializedValue = await page.evaluate(async (_selector) => {
    const [_namespace, _table, _key] = _selector;
    const result = await window["storeCache"].get(_namespace, _table, deserialize(_key));
    return result ? serialize(result) : undefined;

    /**
     * Helper to serialize values that are not natively serializable and therefore not transferrable to the page
     * For now only `bigint` needs serialization.
     */
    function serialize(obj: unknown): string {
      return JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? `bigint(${v.toString()})` : v));
    }

    /**
     * Helper to deserialize values that were serialized by `serialize` (because they are not natively serializable).
     * For now only `bigint` is serialized and need to be deserialized here.
     */
    function deserialize(blob: string): Record<string, unknown> {
      const obj = JSON.parse(blob);

      // Check whether the value matches the mattern `bigint(${number}n)`
      // (serialization of bigint in `serialize`)
      // and turn it back into a bigint
      const regex = /^bigint\((\d+)n\)$/; // Regular expression pattern.
      for (const [key, value] of Object.entries(obj)) {
        const match = typeof value === "string" && value.match(regex); // Attempt to match the pattern.
        if (match) {
          obj[key] = BigInt(match[1]);
        }
      }

      return obj;
    }
  }, selector);

  return serializedValue ? deserialize(serializedValue) : undefined;
}
