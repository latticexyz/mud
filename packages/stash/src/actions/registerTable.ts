import { Table } from "@latticexyz/config";
import { getTable, BoundTable } from "./getTable";
import { Stash } from "../common";

export type RegisterTableArgs<table extends Table = Table> = {
  stash: Stash;
  table: table;
};

export type RegisterTableResult<table extends Table = Table> = BoundTable<table>;

export function registerTable<table extends Table>({
  stash,
  table,
}: RegisterTableArgs<table>): RegisterTableResult<table> {
  // Pick only relevant keys from the table config, ignore keys like `codegen`, `deploy`
  const { namespace, namespaceLabel, name, label, key, schema, type, tableId } = table;
  const tableConfig = { namespace, namespaceLabel, name, label, key, schema, type, tableId };

  // Set config for table
  (stash._.state.config[namespaceLabel] ??= {})[label] = tableConfig;

  // Init records map for table
  (stash._.state.records[namespaceLabel] ??= {})[label] ??= {};

  // Init subscribers set for table
  (stash._.tableSubscribers[namespaceLabel] ??= {})[label] ??= new Set();

  // Notify stash subscribers
  stash._.storeSubscribers.forEach((subscriber) =>
    subscriber({ type: "config", updates: [{ previous: undefined, current: tableConfig }] }),
  );

  return getTable({ stash, table });
}
