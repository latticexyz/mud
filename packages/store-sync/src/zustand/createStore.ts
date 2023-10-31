import { SchemaToPrimitives, Table, Tables } from "@latticexyz/store";
import { StoreApi, UseBoundStore, create } from "zustand";
import { RawRecord, TableRecord } from "./common";
import { Hex, concatHex } from "viem";
import { storeTables, worldTables } from "../common";
import { encodeKey } from "@latticexyz/protocol-parser";
import { flattenSchema } from "../flattenSchema";

type TableRecords<table extends Table> = {
  readonly [id: string]: TableRecord<table>;
};

// TODO: split this into distinct stores and combine (https://docs.pmnd.rs/zustand/guides/typescript#slices-pattern)?

export type ZustandState<
  tables extends Tables,
  allTables extends Tables = tables & typeof storeTables & typeof worldTables
> = {
  /** Tables derived from table registration store events */
  readonly tables: {
    readonly [tableId: Hex]: Table;
  };
  /** Raw records (bytes) derived from store events */
  readonly rawRecords: {
    readonly [id: string]: RawRecord;
  };
  /** Decoded table records derived from raw records */
  readonly records: {
    readonly [id: string]: TableRecord<allTables[keyof allTables]>;
  };
  readonly getRecords: <table extends Table>(table: table) => TableRecords<table>;
  readonly getRecord: <table extends Table>(
    table: table,
    key: SchemaToPrimitives<table["keySchema"]>
  ) => TableRecord<table> | undefined;
  readonly getValue: <table extends Table>(
    table: table,
    key: SchemaToPrimitives<table["keySchema"]>
  ) => TableRecord<table>["value"] | undefined;
};

export type ZustandStore<tables extends Tables> = UseBoundStore<StoreApi<ZustandState<tables>>>;

export type CreateStoreOptions<tables extends Tables> = {
  tables: tables;
};

export function createStore<tables extends Tables>(opts: CreateStoreOptions<tables>): ZustandStore<tables> {
  return create<ZustandState<tables>>((set, get) => ({
    tables: {},
    rawRecords: {},
    records: {},
    getRecords: <table extends Table>(table: table): TableRecords<table> => {
      const records = get().records;
      return Object.fromEntries(
        Object.entries(records).filter(([id, record]) => record.table.tableId === table.tableId)
      ) as any as TableRecords<table>;
    },
    getRecord: <table extends Table>(
      table: table,
      key: SchemaToPrimitives<table["keySchema"]>
    ): TableRecord<table> | undefined => {
      const records = Object.values(get().records);
      const expectedKeyTuple = encodeKey(flattenSchema(table.keySchema), key);
      const record = records.find(
        (record) =>
          record.table.tableId === table.tableId && concatHex([...record.keyTuple]) === concatHex(expectedKeyTuple)
      );
      return record as TableRecord<table> | undefined;
    },
    getValue: <table extends Table>(
      table: table,
      key: SchemaToPrimitives<table["keySchema"]>
    ): TableRecord<table>["value"] | undefined => {
      return get().getRecord(table, key)?.value;
    },
  }));
}
