import { Keys, TableLabel } from "../common";
import { Context } from "./common";
import { decodeKey } from "./decodeKey";

export type GetKeysArgs = {
  table: TableLabel;
};

export type GetKeysResult = Keys;

export const getKeys =
  (context: Context): ((args: GetKeysArgs) => GetKeysResult) =>
  ({ table }) => {
    const { get } = context;
    const namespace = table.namespace ?? "";
    const label = table.label;

    return Object.fromEntries(
      Object.keys(get().records[namespace][label]).map((encodedKey) => [
        encodedKey,
        decodeKey(context)({ table, encodedKey }),
      ]),
    );
  };
