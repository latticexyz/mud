import { Table } from "@latticexyz/config";
import { Stash, DerivedTable } from "../common";
import { getRecords } from "./getRecords";
import { applyUpdates } from "./applyUpdates";
import { getKey } from "@latticexyz/protocol-parser/internal";

export type RegisterDerivedTableArgs<input extends Table> = {
  stash: Stash;
  derivedTable: DerivedTable<input>;
};

export type RegisterDerivedTableResult = void;

export function registerDerivedTable<input extends Table>({
  stash,
  derivedTable,
}: RegisterDerivedTableArgs<input>): RegisterDerivedTableResult {
  const { input, label, deriveUpdates } = derivedTable;

  // Register table derivation
  const namespaces = (stash._.derivedTables[input.namespaceLabel] ??= {});
  const tables = (namespaces[input.label] ??= {});
  if (tables[label] != null) throw new Error(`Derived table \`${label}\` already registered`);
  tables[label] = derivedTable as never;

  // Compute initial derived table
  applyUpdates({
    stash,
    updates: Object.values(getRecords({ stash, table: input }))
      .map((record) => {
        return deriveUpdates({ table: input, key: getKey(input, record), previous: undefined, current: record });
      })
      .flat(),
  });
}
