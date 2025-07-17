import { Table } from "@latticexyz/config";
import { Key, TableRecord, Stash } from "../common";
import { applyUpdates } from "./applyUpdates";

export type SetRecordArgs<table extends Table = Table> = {
  stash: Stash;
  table: table;
  key: Key<table>;
  value: Partial<TableRecord<table>>;
};

export type SetRecordResult = void;

export function setRecord<table extends Table>({ stash, table, key, value }: SetRecordArgs<table>): SetRecordResult {
  requireNotInternalNamespace(table.namespaceLabel);
  applyUpdates({ stash, updates: [{ table, key, value }] });
}
