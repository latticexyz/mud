import { Table } from "@latticexyz/config";
import { Key, requireNotInternalNamespace, Stash } from "../common";
import { applyUpdates } from "./applyUpdates";

export type DeleteRecordArgs<table extends Table = Table> = {
  stash: Stash;
  table: table;
  key: Key<table>;
};

export type DeleteRecordResult = void;

export function deleteRecord<table extends Table>({ stash, table, key }: DeleteRecordArgs<table>): DeleteRecordResult {
  requireNotInternalNamespace(table.namespaceLabel);
  applyUpdates({ stash, updates: [{ table, key, value: undefined }] });
}
