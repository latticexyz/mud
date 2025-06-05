import { Table } from "@latticexyz/config";
import { Key, TableRecord, Stash } from "../common";
import { applyUpdates } from "./applyUpdates";
import { Log } from "viem";

export type SetRecordArgs<table extends Table = Table> = {
  stash: Stash;
  table: table;
  key: Key<table>;
  value: Partial<TableRecord<table>>;
  log?: Log;
};

export type SetRecordResult = void;

export function setRecord<table extends Table>({
  stash,
  table,
  key,
  value,
  log,
}: SetRecordArgs<table>): SetRecordResult {
  applyUpdates({ stash, updates: [{ table, key, value, log }] });
}
