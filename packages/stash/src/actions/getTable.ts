import { Table } from "@latticexyz/config";
import { Stash } from "../common";
import { DecodeKeyArgs, DecodeKeyResult, decodeKey } from "./decodeKey";
import { DeleteRecordArgs, DeleteRecordResult, deleteRecord } from "./deleteRecord";
import { EncodeKeyArgs, EncodeKeyResult, encodeKey } from "./encodeKey";
import { GetTableConfigResult, getTableConfig } from "./getTableConfig";
import { GetKeysResult, getKeys } from "./getKeys";
import { GetRecordArgs, GetRecordResult, getRecord } from "./getRecord";
import { GetRecordsArgs, GetRecordsResult, getRecords } from "./getRecords";
import { SetRecordArgs, SetRecordResult, setRecord } from "./setRecord";
import { SetRecordsArgs, SetRecordsResult, setRecords } from "./setRecords";
import { SubscribeTableArgs, SubscribeTableResult, subscribeTable } from "./subscribeTable";
import { registerTable } from "./registerTable";

export type TableBoundDecodeKeyArgs<table extends Table = Table> = Omit<DecodeKeyArgs<table>, "stash" | "table">;
export type TableBoundDeleteRecordArgs<table extends Table = Table> = Omit<DeleteRecordArgs<table>, "stash" | "table">;
export type TableBoundEncodeKeyArgs<table extends Table = Table> = Omit<EncodeKeyArgs<table>, "stash" | "table">;
export type TableBoundGetRecordArgs<table extends Table = Table> = Omit<
  GetRecordArgs<table>,
  "stash" | "state" | "table"
>;
export type TableBoundGetRecordsArgs<table extends Table = Table> = Omit<
  GetRecordsArgs<table>,
  "stash" | "state" | "table"
>;
export type TableBoundSetRecordArgs<table extends Table = Table> = Omit<SetRecordArgs<table>, "stash" | "table">;
export type TableBoundSetRecordsArgs<table extends Table = Table> = Omit<SetRecordsArgs<table>, "stash" | "table">;
export type TableBoundSubscribeTableArgs<table extends Table = Table> = Omit<
  SubscribeTableArgs<table>,
  "stash" | "table"
>;

export type BoundTable<table extends Table = Table> = {
  decodeKey: (args: TableBoundDecodeKeyArgs<table>) => DecodeKeyResult<table>;
  deleteRecord: (args: TableBoundDeleteRecordArgs<table>) => DeleteRecordResult;
  encodeKey: (args: TableBoundEncodeKeyArgs<table>) => EncodeKeyResult;
  getTableConfig: () => GetTableConfigResult<table>;
  getKeys: () => GetKeysResult<table>;
  getRecord: (args: TableBoundGetRecordArgs<table>) => GetRecordResult<table>;
  getRecords: (args?: TableBoundGetRecordsArgs<table>) => GetRecordsResult<table>;
  setRecord: (args: TableBoundSetRecordArgs<table>) => SetRecordResult;
  setRecords: (args: TableBoundSetRecordsArgs<table>) => SetRecordsResult;
  subscribe: (args: TableBoundSubscribeTableArgs<table>) => SubscribeTableResult;
};

export type GetTableArgs<table extends Table = Table> = {
  stash: Stash;
  table: table;
};

export type GetTableResult<table extends Table = Table> = BoundTable<table>;

export function getTable<table extends Table>({ stash, table }: GetTableArgs<table>): GetTableResult<table> {
  const { namespaceLabel, label } = table;

  if (stash.get().config[namespaceLabel]?.[label] == null) {
    registerTable({ stash, table });
  }

  return {
    decodeKey: (args: TableBoundDecodeKeyArgs<table>) => decodeKey({ stash, table, ...args }),
    deleteRecord: (args: TableBoundDeleteRecordArgs<table>) => deleteRecord({ stash, table, ...args }),
    encodeKey: (args: TableBoundEncodeKeyArgs<table>) => encodeKey({ table, ...args }),
    getTableConfig: () => getTableConfig({ stash, table }) as table,
    getKeys: () => getKeys({ stash, table }),
    getRecord: (args: TableBoundGetRecordArgs<table>) => getRecord({ stash, table, ...args }),
    getRecords: (args?: TableBoundGetRecordsArgs<table>) => getRecords({ stash, table, ...args }),
    setRecord: (args: TableBoundSetRecordArgs<table>) => setRecord({ stash, table, ...args }),
    setRecords: (args: TableBoundSetRecordsArgs<table>) => setRecords({ stash, table, ...args }),
    subscribe: (args: TableBoundSubscribeTableArgs) => subscribeTable({ stash, table, ...args }),

    // TODO: dynamically add setters and getters for individual fields of the table
  };
}
