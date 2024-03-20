import { StoreApi, UseBoundStore, create } from "zustand";
import { Table } from "@latticexyz/config";
import { Tables } from "./common";
import { Hex } from "viem";
import { StaticPrimitiveType } from "@latticexyz/schema-type/internal";
import { SchemaToPrimitives } from "@latticexyz/store/internal";
import { getKeySchema, getValueSchema } from "@latticexyz/protocol-parser/internal";

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
  readonly keyTuple: readonly Hex[];
  readonly primaryKey: readonly StaticPrimitiveType[];
  readonly key: SchemaToPrimitives<getKeySchema<table>>;
  readonly value: SchemaToPrimitives<getValueSchema<table>>;
  readonly fields: SchemaToPrimitives<table["schema"]>;
};

export type QueryCacheState<tables extends Tables = Tables> = {
  readonly tables: tables;
  readonly rawRecords: readonly RawTableRecord<tables[keyof tables]>[];
  readonly records: readonly TableRecord<tables[keyof tables]>[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryCacheStore<tables extends Tables = any> = UseBoundStore<StoreApi<QueryCacheState<tables>>>;

export type extractTables<T> = T extends QueryCacheStore<infer tables> ? tables : never;

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
