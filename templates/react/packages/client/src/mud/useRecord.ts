import { getRecord, Key, Stash, TableRecord } from "@latticexyz/stash/internal";
import { Table } from "@latticexyz/config";
import { useStash } from "@latticexyz/stash/react";

export type UseRecordArgs<
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
>({ stash, ...args }: UseRecordArgs<table, defaultValue>): UseRecordResult<table, defaultValue> {
  return useStash(stash, (state) => getRecord({ state, ...args }));
}
