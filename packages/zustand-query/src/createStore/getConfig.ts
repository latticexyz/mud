import { Table } from "@latticexyz/config";
import { TableLabel } from "../common";
import { Context } from "./common";

export type GetConfigArgs = {
  table: TableLabel;
};

export type GetConfigResult = Table;

export const getConfig =
  (context: Context): ((args: GetConfigArgs) => GetConfigResult) =>
  ({ table }) => {
    const { get } = context;
    const namespace = table.namespace ?? "";
    const label = table.label;

    return get().config[namespace][label];
  };
