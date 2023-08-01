import { Page } from "@playwright/test";
import { Entity } from "@latticexyz/recs";
import { deserialize, serialize } from "./utils";

/**
 * Read an individual record from the client's data store.
 * This is necessary because `page.evaluate` can only transmit serialisable data,
 * so we can't just return the entire client store (which includes functions to read data)
 */
export async function readComponentValue(
  page: Page,
  componentName: string,
  entity: Entity
): Promise<Record<string, unknown> | undefined> {
  const args = [componentName, entity, serialize.toString(), deserialize.toString()];
  const serializedValue = await page.evaluate(async (_args) => {
    const [_componentName, _entity, _serializeString, _deserializeString] = _args;
    const _serialize = deserializeFunction(_serializeString);
    const _deserialize = deserializeFunction(_deserializeString);
    const value = await window["getComponentValue"](_componentName, _entity);
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
