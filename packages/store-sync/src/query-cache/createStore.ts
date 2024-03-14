import { StoreApi, UseBoundStore, create } from "zustand";
import { Table } from "@latticexyz/store/config/v2";
import { Tables, schemaAbiTypes } from "./common";
import { Hex } from "viem";

export type RawTableRecord<table extends Table = Table> = {
  readonly table: table;
  /** @internal Internal unique ID */
  readonly id: string;
  readonly keyTuple: readonly Hex[];
  readonly staticData: Hex;
  readonly encodedLengths: Hex;
  readonly dynamicData: Hex;
};

export type TableRecord<table extends Table = Table> = {
  readonly table: table;
  /** @internal Internal unique ID */
  readonly id: string;
  readonly key: schemaAbiTypes<table["keySchema"]>;
  readonly value: schemaAbiTypes<table["valueSchema"]>;
  readonly fields: schemaAbiTypes<table["schema"]>;
};

export type QueryCacheState<tables extends Tables = Tables> = {
  readonly tables: tables;
  readonly rawRecords: readonly RawTableRecord<tables[keyof tables]>[];
  readonly records: readonly TableRecord<tables[keyof tables]>[];
};

export type QueryCacheStore<tables extends Tables = Tables> = UseBoundStore<StoreApi<QueryCacheState<tables>>>;

export type CreateStoreOptions<tables extends Tables = Tables> = {
  tables: tables;
};

export function createStore<tables extends Tables>({ tables }: CreateStoreOptions<tables>): QueryCacheStore<tables> {
  return create<QueryCacheState<tables>>(() => ({
    tables,
    rawRecords: [],
    records: [],
  }));
}
