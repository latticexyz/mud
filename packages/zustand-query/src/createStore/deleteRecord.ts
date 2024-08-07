import { Key, TableLabel } from "../common";
import { Context } from "./common";
import { encodeKey } from "./encodeKey";

export type DeleteRecordArgs = {
  table: TableLabel;
  key: Key;
};

export type DeleteRecordResult = void;

export const deleteRecord =
  (context: Context): ((args: DeleteRecordArgs) => DeleteRecordResult) =>
  ({ table: tableLabel, key }) => {
    const { set, get, subscribers } = context;
    const namespace = tableLabel.namespace ?? "";
    const label = tableLabel.label;

    if (get().config[namespace] == null) {
      throw new Error(`Table '${namespace}__${label}' is not registered yet.`);
    }

    const encodedKey = encodeKey(context, tableLabel, key);
    const prevRecord = get().records[namespace][label][encodedKey];

    // Delete record
    set((prev) => {
      delete prev.records[tableLabel.namespace ?? ""][tableLabel.label][encodedKey];
    });

    // Notify table subscribers
    subscribers[namespace][label].forEach((subscriber) =>
      subscriber({ [encodedKey]: { prev: prevRecord && { ...prevRecord }, current: undefined } }),
    );
  };
