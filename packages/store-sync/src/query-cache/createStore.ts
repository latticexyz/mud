import { StoreApi, UseBoundStore, create } from "zustand";
import { ResolvedTableConfig } from "@latticexyz/store/config/v2";
import { schemaAbiTypes } from "./common";
import { Hex } from "viem";

export type RawTableRecord<table extends ResolvedTableConfig = ResolvedTableConfig> = {
  readonly table: table;
  /** @internal Internal unique ID */
  readonly id: string;
  readonly keyTuple: readonly Hex[];
  readonly staticData: Hex;
  readonly encodedLengths: Hex;
  readonly dynamicData: Hex;
};

export type TableRecord<table extends ResolvedTableConfig = ResolvedTableConfig> = {
  readonly table: table;
  /** @internal Internal unique ID */
  readonly id: string;
  readonly key: schemaAbiTypes<table["keySchema"]>;
  readonly value: schemaAbiTypes<table["valueSchema"]>;
  readonly fields: schemaAbiTypes<table["schema"]>;
};

export type QueryCacheState<table extends ResolvedTableConfig = ResolvedTableConfig> = {
  readonly tables: { [tableId: Hex]: table };
  readonly rawRecords: readonly RawTableRecord<table>[];
  readonly records: readonly TableRecord<table>[];
};

export type QueryCacheStore<table extends ResolvedTableConfig = ResolvedTableConfig> = UseBoundStore<
  StoreApi<QueryCacheState<table>>
>;

export type CreateStoreOptions<table extends ResolvedTableConfig = ResolvedTableConfig> = {
  tables: readonly table[];
};

export function createStore<table extends ResolvedTableConfig = ResolvedTableConfig>(
  opts: CreateStoreOptions<table>,
): QueryCacheStore<table> {
  return create<QueryCacheState<table>>(() => ({
    tables: Object.fromEntries(opts.tables.map((table) => [table.tableId, table])),
    rawRecords: [],
    records: [],
  }));
}
