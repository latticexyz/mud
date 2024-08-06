import { dynamicAbiTypeToDefaultValue, staticAbiTypeToDefaultValue } from "@latticexyz/schema-type/internal";
import { TableLabel, TableRecord, TableUpdates } from "../common";
import { Context } from "./common";
import { encodeKey } from "./encodeKey";

export type SetRecordsArgs = {
  table: TableLabel;
  records: TableRecord[];
};

export const setRecords =
  (context: Context): ((args: SetRecordsArgs) => void) =>
  ({ table: tableLabel, records }) => {
    const { get, set, subscribers } = context;
    const namespace = tableLabel.namespace ?? "";
    const label = tableLabel.label;

    if (get().config[namespace] == null) {
      throw new Error(`Table '${namespace}__${label}' is not registered yet.`);
    }

    const updates: TableUpdates = {};
    for (const record of records) {
      const encodedKey = encodeKey(context, tableLabel, record);
      const prevRecord = get().records[namespace][label][encodedKey];
      const schema = get().config[namespace][label].schema;
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
    set((prev) => {
      for (const [encodedKey, { current }] of Object.entries(updates)) {
        // TODO: seems like mutative removes `readonly` from type, causing type error here
        prev.records[tableLabel.namespace ?? ""][tableLabel.label][encodedKey] = current as never;
      }
    });

    // Notify table subscribers
    subscribers[namespace][label].forEach((subscriber) => subscriber(updates));
  };
