import { TableInput, resolveTable } from "@latticexyz/store/config/v2";
import { Context } from "./common";
import { getTable, BoundTable } from "./getTable";

export type RegisterTableArgs = TableInput;

export type RegisterTableResult = BoundTable;

export const registerTable =
  (context: Context): ((args: RegisterTableArgs) => RegisterTableResult) =>
  (tableInput) => {
    const { set, subscribers } = context;
    // TODO: add option to resolveTable to not include codegen/deploy options?
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { codegen, deploy, ...tableConfig } = resolveTable(tableInput);
    set((prev) => {
      const { namespace, label } = tableConfig;
      // Set config for table
      prev.config[namespace] ??= {};
      // TODO figure out type issue here - looks like mutative removes the `readonly` type
      prev.config[namespace][label] = tableConfig as never;

      // Init records map for table
      prev.records[namespace] ??= {};
      prev.records[namespace][label] ??= {};

      // Init subscribers set for table
      subscribers[namespace] ??= {};
      subscribers[namespace][label] ??= new Set();
    });
    return getTable(context)(tableConfig);
  };
