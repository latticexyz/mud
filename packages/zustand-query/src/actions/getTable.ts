import { Store, TableLabel } from "../common";
import { DecodeKeyArgs, DecodeKeyResult, decodeKey } from "./decodeKey";
import { DeleteRecordArgs, DeleteRecordResult, deleteRecord } from "./deleteRecord";
import { EncodeKeyArgs, EncodeKeyResult, encodeKey } from "./encodeKey";
import { GetConfigResult, getConfig } from "./getConfig";
import { GetKeysResult, getKeys } from "./getKeys";
import { GetRecordArgs, GetRecordResult, getRecord } from "./getRecord";
import { GetRecordsArgs, GetRecordsResult, getRecords } from "./getRecords";
import { SetRecordArgs, SetRecordResult, setRecord } from "./setRecord";
import { SetRecordsArgs, SetRecordsResult, setRecords } from "./setRecords";
import { SubscribeArgs, SubscribeResult, subscribe } from "./subscribe";

export type TableBoundDecodeKeyArgs = Omit<DecodeKeyArgs, "store" | "table">;
export type TableBoundDeleteRecordArgs = Omit<DeleteRecordArgs, "store" | "table">;
export type TableBoundEncodeKeyArgs = Omit<EncodeKeyArgs, "store" | "table">;
export type TableBoundGetRecordArgs = Omit<GetRecordArgs, "store" | "table">;
export type TableBoundGetRecordsArgs = Omit<GetRecordsArgs, "store" | "table">;
export type TableBoundSetRecordArgs = Omit<SetRecordArgs, "store" | "table">;
export type TableBoundSetRecordsArgs = Omit<SetRecordsArgs, "store" | "table">;
export type TableBoundSubscribeArgs = Omit<SubscribeArgs, "store" | "table">;

export type BoundTable = {
  decodeKey: (args: TableBoundDecodeKeyArgs) => DecodeKeyResult;
  deleteRecord: (args: TableBoundDeleteRecordArgs) => DeleteRecordResult;
  encodeKey: (args: TableBoundEncodeKeyArgs) => EncodeKeyResult;
  getConfig: () => GetConfigResult;
  getKeys: () => GetKeysResult;
  getRecord: (args: TableBoundGetRecordArgs) => GetRecordResult;
  getRecords: (args?: TableBoundGetRecordsArgs) => GetRecordsResult;
  setRecord: (args: TableBoundSetRecordArgs) => SetRecordResult;
  setRecords: (args: TableBoundSetRecordsArgs) => SetRecordsResult;
  subscribe: (args: TableBoundSubscribeArgs) => SubscribeResult;
};

export type GetTableArgs = {
  store: Store;
  table: TableLabel;
};

export type GetTableResult = BoundTable;

export function getTable({ store, table }: GetTableArgs): GetTableResult {
  return {
    decodeKey: (args: TableBoundDecodeKeyArgs) => decodeKey({ store, table, ...args }),
    deleteRecord: (args: TableBoundDeleteRecordArgs) => deleteRecord({ store, table, ...args }),
    encodeKey: (args: TableBoundEncodeKeyArgs) => encodeKey({ store, table, ...args }),
    getConfig: () => getConfig({ store, table }),
    getKeys: () => getKeys({ store, table }),
    getRecord: (args: TableBoundGetRecordArgs) => getRecord({ store, table, ...args }),
    getRecords: (args?: TableBoundGetRecordsArgs) => getRecords({ store, table, ...args }),
    setRecord: (args: TableBoundSetRecordArgs) => setRecord({ store, table, ...args }),
    setRecords: (args: TableBoundSetRecordsArgs) => setRecords({ store, table, ...args }),
    subscribe: (args: TableBoundSubscribeArgs) => subscribe({ store, table, ...args }),

    // TODO: dynamically add setters and getters for individual fields of the table
  };
}
