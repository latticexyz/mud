import { Page } from "@playwright/test";
import { setup } from "../../client-vanilla/src/mud/setup";
import { deserialize, serialize } from "./utils";

// Extract the storeCache type directly from the client
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
  const args = [namespace, table, serialize(key), serialize.toString(), deserialize.toString()];
  const serializedValue = await page.evaluate(async (_args) => {
    const [_namespace, _table, _key, _serializeString, _deserializeString] = _args;
    const _serialize = deserializeFunction(_serializeString);
    const _deserialize = deserializeFunction(_deserializeString);
    const value = await window["storeCache"].get(_namespace, _table, _deserialize(_key));
    const serializedValue = value ? _serialize(value) : undefined;
    return serializedValue;

    // Deserialize a serialized function by evaluating a function returning the serialized function.
    // This is required to pass in serialized `serialize` and `deserialize` function to avoid having to
    // duplicate their logic here.
    function deserializeFunction(serializedFunction: string) {
      return eval(`(() => ${serializedFunction})()`);
    }
  }, args);

  return serializedValue ? deserialize(serializedValue) : undefined;
}
