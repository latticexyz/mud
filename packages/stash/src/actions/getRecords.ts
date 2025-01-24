import { propwiseXor } from "@ark/util";
import { Table } from "@latticexyz/config";
import { isDefined } from "@latticexyz/common/utils";
import { Key, Stash, State, TableRecords } from "../common";
import { encodeKey } from "./encodeKey";

export type GetRecordsArgs<table extends Table = Table> = propwiseXor<{ stash: Stash }, { state: State }> & {
  table: table;
  keys?: readonly Key<table>[];
};

export type GetRecordsResult<table extends Table = Table> = TableRecords<table>;

export function getRecords<table extends Table>(args: GetRecordsArgs<table>): GetRecordsResult<table> {
  const state = args.state ?? args.stash.get();
  const { table, keys } = args;
  const { namespaceLabel, label } = table;

  const records = state.records[namespaceLabel]?.[label] ?? {};

  if (!keys || !keys.length) {
    return records;
  }

  return Object.fromEntries(
    keys
      .map((key) => {
        const encodedKey = encodeKey({ table, key });
        const record = records[encodedKey];
        return record != null ? [encodedKey, record] : undefined;
      })
      .filter(isDefined),
  );
}
