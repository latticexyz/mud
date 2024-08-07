import { Context } from "./common";
import { GetRecordArgs, GetRecordResult, getRecord } from "./getRecord";
import { GetRecordsArgs, GetRecordsResult, getRecords } from "./getRecords";
import { GetKeysArgs, GetKeysResult, getKeys } from "./getKeys";
import { GetConfigArgs, GetConfigResult, getConfig } from "./getConfig";
import { SetRecordArgs, SetRecordResult, setRecord } from "./setRecord";
import { SetRecordsArgs, SetRecordsResult, setRecords } from "./setRecords";
import { DeleteRecordArgs, DeleteRecordResult, deleteRecord } from "./deleteRecord";
import { DecodeKeyArgs, DecodeKeyResult, decodeKey } from "./decodeKey";
import { SubscribeArgs, SubscribeResult, subscribe } from "./subscribe";
import { TableLabel } from "../common";

export type BoundGetRecordArgs = Omit<GetRecordArgs, "table">;
export type BoundGetRecordsArgs = Omit<GetRecordsArgs, "table">;
export type BoundGetKeysArgs = Omit<GetKeysArgs, "table">;
export type BoundGetConfigArgs = Omit<GetConfigArgs, "table">;
export type BoundSetRecordArgs = Omit<SetRecordArgs, "table">;
export type BoundSetRecordsArgs = Omit<SetRecordsArgs, "table">;
export type BoundDeleteRecordArgs = Omit<DeleteRecordArgs, "table">;
export type BoundDecodeKeyArgs = Omit<DecodeKeyArgs, "table">;
export type BoundSubscribeArgs = Omit<SubscribeArgs, "table">;

export type BoundTable = {
  getRecord: (args: BoundGetRecordArgs) => GetRecordResult;
  getRecords: (args?: BoundGetRecordsArgs) => GetRecordsResult;
  getKeys: () => GetKeysResult;
  getConfig: () => GetConfigResult;
  setRecord: (args: BoundSetRecordArgs) => SetRecordResult;
  setRecords: (args: BoundSetRecordsArgs) => SetRecordsResult;
  deleteRecord: (args: BoundDeleteRecordArgs) => DeleteRecordResult;
  decodeKey: (args: BoundDecodeKeyArgs) => DecodeKeyResult;
  subscribe: (args: BoundSubscribeArgs) => SubscribeResult;
};

export type GetTableArgs = TableLabel;

export type GetTableResult = BoundTable;

export const getTable =
  (context: Context): ((args: GetTableArgs) => GetTableResult) =>
  (tableLabel) => {
    const namespace = tableLabel.namespace ?? "";
    const label = tableLabel.label;
    const table = { namespace, label };

    return {
      getRecord: (args: BoundGetRecordArgs) => getRecord(context)({ table, ...args }),
      getRecords: (args?: BoundGetRecordsArgs) => getRecords(context)({ table, ...args }),
      getKeys: () => getKeys(context)({ table }),
      getConfig: () => getConfig(context)({ table }),
      setRecord: (args: BoundSetRecordArgs) => setRecord(context)({ table, ...args }),
      setRecords: (args: BoundSetRecordsArgs) => setRecords(context)({ table, ...args }),
      deleteRecord: (args: BoundDeleteRecordArgs) => deleteRecord(context)({ table, ...args }),
      decodeKey: (args: BoundDecodeKeyArgs) => decodeKey(context)({ table, ...args }),
      subscribe: (args: BoundSubscribeArgs) => subscribe(context)({ table, ...args }),

      // TODO: dynamically add setters and getters for individual fields of the table
    };
  };
