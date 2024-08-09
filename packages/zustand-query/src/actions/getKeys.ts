import { Store, Keys, TableLabel, withDefaultNamespace } from "../common";
import { decodeKey } from "./decodeKey";

export type GetKeysArgs = {
  store: Store;
  table: TableLabel;
};

export type GetKeysResult = Keys;

export function getKeys({ store, table }: GetKeysArgs): GetKeysResult {
  const { namespace, label } = withDefaultNamespace(table);

  return Object.fromEntries(
    Object.keys(store.get().records[namespace][label]).map((encodedKey) => [
      encodedKey,
      decodeKey({ store, table, encodedKey }),
    ]),
  );
}
