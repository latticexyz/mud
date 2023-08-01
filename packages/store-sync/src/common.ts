import { Address, Hex } from "viem";
import { GetLogsResult, GroupLogsByBlockNumberResult, NonPendingLog } from "@latticexyz/block-logs-stream";
import {
  StoreEventsAbi,
  StoreConfig,
  KeySchema,
  ValueSchema,
  ConfigToKeyPrimitives as Key,
  ConfigToValuePrimitives as Value,
} from "@latticexyz/store";

export type ChainId = number;
export type WorldId = `${ChainId}:${Address}`;

export type TableNamespace = string;
export type TableName = string;

export type Table = {
  address: Address;
  tableId: Hex;
  namespace: TableNamespace;
  name: TableName;
  keySchema: KeySchema;
  valueSchema: ValueSchema;
};

export type StoreEventsLog = GetLogsResult<StoreEventsAbi>[number];
export type BlockLogs = GroupLogsByBlockNumberResult<StoreEventsLog>[number];

export type BaseStorageOperation = {
  log: NonPendingLog<StoreEventsLog>;
  namespace: TableNamespace;
  name: TableName;
};

export type SetRecordOperation<TConfig extends StoreConfig> = BaseStorageOperation & {
  type: "SetRecord";
} & {
    [TTable in keyof TConfig["tables"]]: {
      name: TTable & string;
      key: Key<TConfig, TTable>;
      value: Value<TConfig, TTable>;
    };
  }[keyof TConfig["tables"]];

export type SetFieldOperation<TConfig extends StoreConfig> = BaseStorageOperation & {
  type: "SetField";
} & {
    [TTable in keyof TConfig["tables"]]: {
      name: TTable & string;
      key: Key<TConfig, TTable>;
    } & {
      [TValue in keyof Value<TConfig, TTable>]: {
        fieldName: TValue & string;
        fieldValue: Value<TConfig, TTable>[TValue];
      };
    }[keyof Value<TConfig, TTable>];
  }[keyof TConfig["tables"]];

export type DeleteRecordOperation<TConfig extends StoreConfig> = BaseStorageOperation & {
  type: "DeleteRecord";
} & {
    [TTable in keyof TConfig["tables"]]: {
      name: TTable & string;
      key: Key<TConfig, TTable>;
    };
  }[keyof TConfig["tables"]];

export type StorageOperation<TConfig extends StoreConfig> =
  | SetFieldOperation<TConfig>
  | SetRecordOperation<TConfig>
  | DeleteRecordOperation<TConfig>;
