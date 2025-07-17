import { Table } from "@latticexyz/config";
import { getKey, getValue } from "@latticexyz/protocol-parser/internal";
import { requireNotInternalNamespace, Stash, TableRecord } from "../common";
import { applyUpdates } from "./applyUpdates";

export type SetRecordsArgs<table extends Table = Table> = {
  stash: Stash;
  table: table;
  records: TableRecord<table>[];
};

export type SetRecordsResult = void;

export function setRecords<table extends Table>({ stash, table, records }: SetRecordsArgs<table>): SetRecordsResult {
  requireNotInternalNamespace(table.namespaceLabel);
  applyUpdates({
    stash,
    updates: Object.values(records).map((record) => ({
      table,
      key: getKey(table, record),
      value: getValue(table, record),
    })),
  });
}
