import { Key, Store, TableLabel, withDefaultNamespace } from "../common";

export type EncodeKeyArgs = {
  store: Store;
  table: TableLabel;
  key: Key;
};

export type EncodeKeyResult = string;

/**
 * Encode a key object into a string that can be used as index in the store
 * TODO: Benchmark performance of this function
 */
export function encodeKey({ store, table, key }: EncodeKeyArgs): EncodeKeyResult {
  const { namespace, label } = withDefaultNamespace(table);
  const keyOrder = store.get().config[namespace][label].key;
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
