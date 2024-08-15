import { Table } from "@latticexyz/config";
import { Store } from "../common";
import { DecodeKeyArgs, DecodeKeyResult, decodeKey } from "./decodeKey";
import { DeleteRecordArgs, DeleteRecordResult, deleteRecord } from "./deleteRecord";
import { EncodeKeyArgs, EncodeKeyResult, encodeKey } from "./encodeKey";
import { GetConfigResult, getConfig } from "./getConfig";
import { GetKeysResult, getKeys } from "./getKeys";
import { GetRecordArgs, GetRecordResult, getRecord } from "./getRecord";
import { GetRecordsArgs, GetRecordsResult, getRecords } from "./getRecords";
import { SetRecordArgs, SetRecordResult, setRecord } from "./setRecord";
import { SetRecordsArgs, SetRecordsResult, setRecords } from "./setRecords";
import { SubscribeTableArgs, SubscribeTableResult, subscribeTable } from "./subscribeTable";
import { registerTable } from "./registerTable";

export type TableBoundDecodeKeyArgs<table extends Table = Table> = Omit<DecodeKeyArgs<table>, "store" | "table">;
export type TableBoundDeleteRecordArgs<table extends Table = Table> = Omit<DeleteRecordArgs<table>, "store" | "table">;
export type TableBoundEncodeKeyArgs<table extends Table = Table> = Omit<EncodeKeyArgs<table>, "store" | "table">;
export type TableBoundGetRecordArgs<table extends Table = Table> = Omit<GetRecordArgs<table>, "store" | "table">;
export type TableBoundGetRecordsArgs<table extends Table = Table> = Omit<GetRecordsArgs<table>, "store" | "table">;
export type TableBoundSetRecordArgs<table extends Table = Table> = Omit<SetRecordArgs<table>, "store" | "table">;
export type TableBoundSetRecordsArgs<table extends Table = Table> = Omit<SetRecordsArgs<table>, "store" | "table">;
export type TableBoundSubscribeTableArgs<table extends Table = Table> = Omit<
  SubscribeTableArgs<table>,
  "store" | "table"
>;

export type BoundTable<table extends Table = Table> = {
  decodeKey: (args: TableBoundDecodeKeyArgs<table>) => DecodeKeyResult<table>;
  deleteRecord: (args: TableBoundDeleteRecordArgs<table>) => DeleteRecordResult;
  encodeKey: (args: TableBoundEncodeKeyArgs<table>) => EncodeKeyResult;
  getConfig: () => GetConfigResult<table>;
  getKeys: () => GetKeysResult<table>;
  getRecord: (args: TableBoundGetRecordArgs<table>) => GetRecordResult<table>;
  getRecords: (args?: TableBoundGetRecordsArgs<table>) => GetRecordsResult<table>;
  setRecord: (args: TableBoundSetRecordArgs<table>) => SetRecordResult;
  setRecords: (args: TableBoundSetRecordsArgs<table>) => SetRecordsResult;
  subscribe: (args: TableBoundSubscribeTableArgs<table>) => SubscribeTableResult;
};

export type GetTableArgs<table extends Table = Table> = {
  store: Store;
  table: table;
};

export type GetTableResult<table extends Table = Table> = BoundTable<table>;

export function getTable<table extends Table>({ store, table }: GetTableArgs<table>): GetTableResult<table> {
  const { namespaceLabel, label } = table;

  if (store.get().config[namespaceLabel]?.[label] == null) {
    registerTable({ store, table });
  }

  return {
    decodeKey: (args: TableBoundDecodeKeyArgs<table>) => decodeKey({ store, table, ...args }),
    deleteRecord: (args: TableBoundDeleteRecordArgs<table>) => deleteRecord({ store, table, ...args }),
    encodeKey: (args: TableBoundEncodeKeyArgs<table>) => encodeKey({ table, ...args }),
    getConfig: () => getConfig({ store, table }) as table,
    getKeys: () => getKeys({ store, table }),
    getRecord: (args: TableBoundGetRecordArgs<table>) => getRecord({ store, table, ...args }),
    getRecords: (args?: TableBoundGetRecordsArgs<table>) => getRecords({ store, table, ...args }),
    setRecord: (args: TableBoundSetRecordArgs<table>) => setRecord({ store, table, ...args }),
    setRecords: (args: TableBoundSetRecordsArgs<table>) => setRecords({ store, table, ...args }),
    subscribe: (args: TableBoundSubscribeTableArgs) => subscribeTable({ store, table, ...args }),

    // TODO: dynamically add setters and getters for individual fields of the table
  };
}
