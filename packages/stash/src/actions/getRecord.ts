import { propwiseXor } from "@ark/util";
import { Table } from "@latticexyz/config";
import { Key, Stash, State, TableRecord } from "../common";
import { encodeKey } from "./encodeKey";

export type GetRecordArgs<
  table extends Table = Table,
  defaultValue extends Omit<TableRecord<table>, keyof Key<table>> | undefined = undefined,
> = propwiseXor<{ stash: Stash }, { state: State }> & {
  table: table;
  key: Key<table>;
  defaultValue?: defaultValue;
};

export type GetRecordResult<
  table extends Table = Table,
  defaultValue extends Omit<TableRecord<table>, keyof Key<table>> | undefined = undefined,
> = defaultValue extends undefined ? TableRecord<table> | undefined : TableRecord<table>;

export function getRecord<
  const table extends Table,
  const defaultValue extends Omit<TableRecord<table>, keyof Key<table>> | undefined = undefined,
>(args: GetRecordArgs<table, defaultValue>): GetRecordResult<table, defaultValue> {
  const state = args.state ?? args.stash.get();
  const { table, key, defaultValue } = args;
  const { namespaceLabel, label } = table;
  return (state.records[namespaceLabel]?.[label]?.[encodeKey({ table, key })] ?? defaultValue) as never;
}
