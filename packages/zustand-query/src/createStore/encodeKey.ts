import { TableLabel, TableRecord } from "../common";
import { Context } from "./common";

/**
 * Encode a key object into a string that can be used as index in the store
 * TODO: Benchmark performance of this function
 */
export function encodeKey({ get }: Context, { label, namespace }: TableLabel, key: TableRecord): string {
  const keyOrder = get().config[namespace ?? ""][label].key;
  return keyOrder
    .map((keyName) => {
      const keyValue = key[keyName];
      if (keyValue == null) {
        throw new Error(`Provided key is missing field ${keyName}.`);
      }
      return key[keyName];
    })
    .join("|");
}
