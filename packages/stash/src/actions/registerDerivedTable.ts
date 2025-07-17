import { Table } from "@latticexyz/config";
import { Stash, DerivedTable } from "../common";
import { registerTable } from "./registerTable";

export type RegisterDerivedTableArgs<input extends Table = Table, output extends Table = Table> = {
  stash: Stash;
  derivedTable: DerivedTable<input, output>;
};

export type RegisterDerivedTableResult<output extends Table> = output;

export function registerDerivedTable<input extends Table, output extends Table>({
  stash,
  derivedTable,
}: RegisterDerivedTableArgs<input, output>): RegisterDerivedTableResult<output> {
  registerTable({ stash, table: derivedTable.output });
  return derivedTable.output;
}
