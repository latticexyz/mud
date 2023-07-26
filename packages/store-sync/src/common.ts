import { SchemaAbiType, SchemaAbiTypeToPrimitiveType, StaticAbiType } from "@latticexyz/schema-type";
import { Address, Hex } from "viem";
// TODO: move these type helpers into store?
import { Key, Value } from "@latticexyz/store-cache";
import { GetLogsResult, GroupLogsByBlockNumberResult, NonPendingLog } from "@latticexyz/block-logs-stream";
import { StoreEventsAbi, StoreConfig } from "@latticexyz/store";

export type ChainId = number;
export type WorldId = `${ChainId}:${Address}`;

export type TableNamespace = string;
export type TableName = string;

export type KeySchema = Record<string, StaticAbiType>;
export type ValueSchema = Record<string, SchemaAbiType>;

export type SchemaToPrimitives<TSchema extends ValueSchema> = {
  [key in keyof TSchema]: SchemaAbiTypeToPrimitiveType<TSchema[key]>;
};

export type TableRecord<TKeySchema extends KeySchema = KeySchema, TValueSchema extends ValueSchema = ValueSchema> = {
  key: SchemaToPrimitives<TKeySchema>;
  value: SchemaToPrimitives<TValueSchema>;
};

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
  namespace: string;
  name: string;
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
