import { dynamicAbiTypeToDefaultValue, staticAbiTypeToDefaultValue } from "@latticexyz/schema-type/internal";
import { Key, Store, TableLabel, TableRecord, TableUpdates, withDefaultNamespace } from "../common";
import { encodeKey } from "./encodeKey";

export type SetRecordsArgs = {
  store: Store;
  table: TableLabel;
  records: TableRecord[];
};

export type SetRecordsResult = void;

export function setRecords({ store, table, records }: SetRecordsArgs): SetRecordsResult {
  const { namespace, label } = withDefaultNamespace(table);

  if (store.get().config[namespace] == null) {
    throw new Error(`Table '${namespace}__${label}' is not registered yet.`);
  }

  // Construct table updates
  const updates: TableUpdates = {};
  for (const record of records) {
    const encodedKey = encodeKey({ store, table, key: record as Key });
    const prevRecord = store.get().records[namespace][label][encodedKey];
    const schema = store.get().config[namespace][label].schema;
    const newRecord = Object.fromEntries(
      Object.keys(schema).map((fieldName) => [
        fieldName,
        record[fieldName] ?? // Override provided record fields
          prevRecord?.[fieldName] ?? // Keep existing non-overridden fields
          staticAbiTypeToDefaultValue[schema[fieldName] as never] ?? // Default values for new fields
          dynamicAbiTypeToDefaultValue[schema[fieldName] as never],
      ]),
    );
    updates[encodedKey] = { prev: prevRecord, current: newRecord };
  }

  // Update records
  for (const [encodedKey, { current }] of Object.entries(updates)) {
    store._.state.records[namespace][label][encodedKey] = current as never;
  }

  // Notify table subscribers
  store._.tableSubscribers[namespace][label].forEach((subscriber) => subscriber(updates));
}
