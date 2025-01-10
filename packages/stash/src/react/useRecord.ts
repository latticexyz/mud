import { Table } from "@latticexyz/config";
import { TableRecord, Stash, Key } from "../common";
import { useStash } from "./useStash";
import { getRecord } from "../actions/getRecord";

export type UseRecordOptions<
  table extends Table = Table,
  defaultValue extends Omit<TableRecord<table>, keyof Key<table>> | undefined = undefined,
> = {
  stash: Stash;
  table: table;
  key: Key<table>;
  defaultValue?: defaultValue;
};

export type UseRecordResult<
  table extends Table = Table,
  defaultValue extends Omit<TableRecord<table>, keyof Key<table>> | undefined = undefined,
> = defaultValue extends undefined ? TableRecord<table> | undefined : TableRecord<table>;

export function useRecord<
  const table extends Table,
  const defaultValue extends Omit<TableRecord<table>, keyof Key<table>> | undefined = undefined,
>({ stash, ...args }: UseRecordOptions<table, defaultValue>): UseRecordResult<table, defaultValue> {
  return useStash(stash, (state) => getRecord({ state, ...args }));
}
