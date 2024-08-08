import { Key, Store, TableLabel, withDefaultNamespace } from "../common";

export type DecodeKeyArgs = {
  store: Store;
  table: TableLabel;
  encodedKey: string;
};

export type DecodeKeyResult = Key;

export function decodeKey({ store, table, encodedKey }: DecodeKeyArgs): DecodeKeyResult {
  const { namespace, label } = withDefaultNamespace(table);
  const keyFields = store.get().config[namespace][label].key;
  const record = store.get().records[namespace][label][encodedKey];

  // Typecast needed because record values could be arrays, but we know they are not if they are key fields
  return Object.fromEntries(Object.entries(record).filter(([field]) => keyFields.includes(field))) as never;
}
