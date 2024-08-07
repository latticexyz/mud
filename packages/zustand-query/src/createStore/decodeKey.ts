import { Key, TableLabel } from "../common";
import { Context } from "./common";

export type DecodeKeyArgs = {
  table: TableLabel;
  encodedKey: string;
};

export type DecodeKeyResult = Key;

export const decodeKey =
  (context: Context): ((args: DecodeKeyArgs) => DecodeKeyResult) =>
  ({ table: tableLabel, encodedKey }) => {
    const { get } = context;
    const namespace = tableLabel.namespace ?? "";
    const label = tableLabel.label;
    const keyFields = get().config[namespace][label].key;
    const record = get().records[namespace][label][encodedKey];

    // Typecast needed because record values could be arrays, but we know they are not if they are key fields
    return Object.fromEntries(Object.entries(record).filter(([field]) => keyFields.includes(field))) as never;
  };
