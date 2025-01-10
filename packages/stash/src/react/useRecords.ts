import { Table } from "@latticexyz/config";
import { Key, Stash, TableRecord } from "../common";
import { useStash } from "./useStash";
import { getRecords } from "../actions/getRecords";
import { isArrayEqual } from "./isArrayEqual";

export type UseRecordsOptions<table extends Table = Table> = {
  stash: Stash;
  table: table;
  keys?: readonly Key<table>[];
};

export type UseRecordsResult<table extends Table = Table> = readonly TableRecord<table>[];

export function useRecords<const table extends Table>({
  stash,
  ...args
}: UseRecordsOptions<table>): UseRecordsResult<table> {
  return useStash(stash, (state) => Object.values(getRecords({ state, ...args })), {
    isEqual: isArrayEqual,
  });
}
