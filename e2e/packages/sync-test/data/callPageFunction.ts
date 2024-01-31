import { Page } from "@playwright/test";
import { deserialize, serialize } from "./utils";

/**
 * Read an individual record from the client's data store.
 * This is necessary because `page.evaluate` can only transmit serialisable data,
 * so we can't just return the entire client store (which includes functions to read data)
 */
export async function callPageFunction(
  page: Page,
  functionName: string,
  args: unknown[]
): Promise<Record<string, unknown> | undefined> {
  const context = [functionName, args, serialize.toString(), deserialize.toString()] as const;
  const serializedValue = await page.evaluate(async ([functionName, args, serializeString, deserializeString]) => {
    const _serialize = deserializeFunction(serializeString);
    const _deserialize = deserializeFunction(deserializeString);
    const value = await (window as any)[functionName](...args);
    const serializedValue = value ? _serialize(value) : undefined;
    return serializedValue;

    // Deserialize a serialized function by evaluating a function returning the serialized function.
    // This is required to pass in serialized `serialize` and `deserialize` function to avoid having to
    // duplicate their logic here.
    function deserializeFunction(serializedFunction: string) {
      return eval(`(() => ${serializedFunction})()`);
    }
  }, context);

  return serializedValue ? deserialize(serializedValue) : undefined;
}
