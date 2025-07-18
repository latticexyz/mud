import { Table } from "@latticexyz/config";
import { Stash, DerivedTable } from "../common";
import { registerTable } from "./registerTable";
import { getRecords } from "./getRecords";
import { applyUpdates } from "./applyUpdates";

export type RegisterDerivedTableArgs<input extends Table = Table, output extends Table = Table> = {
  stash: Stash;
  derivedTable: DerivedTable<input, output>;
};

export type RegisterDerivedTableResult<output extends Table> = output;

export function registerDerivedTable<input extends Table, output extends Table>({
  stash,
  derivedTable,
}: RegisterDerivedTableArgs<input, output>): RegisterDerivedTableResult<output> {
  const { input, output, getKey, getRecord } = derivedTable;

  // Register output table
  registerTable({ stash, table: derivedTable.output });

  // Register table derivation
  const namespaces = (stash._.derivedTables[input.namespaceLabel] ??= {});
  const tables = (namespaces[input.label] ??= {});
  const derivedTableLabel = `${output.namespaceLabel}__${output.label}`;
  if (tables[derivedTableLabel] != null) throw new Error(`Derived table \`${derivedTableLabel}\` already registered`);
  tables[derivedTableLabel] = derivedTable;

  // Compute initial derived table
  applyUpdates({
    stash,
    updates: Object.values(getRecords({ stash, table: input })).map((record) => ({
      table: output,
      key: getKey(record),
      value: getRecord?.(record) ?? record,
    })),
  });

  return derivedTable.output;
}
