import { Store } from "../common";
import { DecodeKeyArgs, DecodeKeyResult, decodeKey } from "../actions/decodeKey";
import { DeleteRecordArgs, DeleteRecordResult, deleteRecord } from "../actions/deleteRecord";
import { EncodeKeyArgs, EncodeKeyResult, encodeKey } from "../actions/encodeKey";
import { ExtendArgs, ExtendResult, extend } from "../actions/extend";
import { GetConfigArgs, GetConfigResult, getConfig } from "../actions/getConfig";
import { GetKeysArgs, GetKeysResult, getKeys } from "../actions/getKeys";
import { GetRecordArgs, GetRecordResult, getRecord } from "../actions/getRecord";
import { GetRecordsArgs, GetRecordsResult, getRecords } from "../actions/getRecords";
import { GetTableArgs, GetTableResult, getTable } from "../actions/getTable";
import { GetTablesResult, getTables } from "../actions/getTables";
import { RegisterTableArgs, RegisterTableResult, registerTable } from "../actions/registerTable";
import { RunQueryArgs, RunQueryResult, runQuery } from "../actions/runQuery";
import { SetRecordArgs, SetRecordResult, setRecord } from "../actions/setRecord";
import { SetRecordsArgs, SetRecordsResult, setRecords } from "../actions/setRecords";
import { SubscribeQueryArgs, SubscribeQueryResult, subscribeQuery } from "../actions/subscribeQuery";
import { SubscribeStoreArgs, SubscribeStoreResult, subscribeStore } from "../actions/subscribeStore";
import { SubscribeTableArgs, SubscribeTableResult, subscribeTable } from "../actions/subscribeTable";
import { Table } from "@latticexyz/config";

export type StoreBoundDecodeKeyArgs = Omit<DecodeKeyArgs, "store">;
export type StoreBoundDeleteRecordArgs = Omit<DeleteRecordArgs, "store">;
export type StoreBoundEncodeKeyArgs = Omit<EncodeKeyArgs, "store">;
export type StoreBoundExtendArgs<actions> = Omit<ExtendArgs<Store, actions>, "store">;
export type StoreBoundGetConfigArgs = Omit<GetConfigArgs, "store">;
export type StoreBoundGetKeysArgs = Omit<GetKeysArgs, "store">;
export type StoreBoundGetRecordArgs = Omit<GetRecordArgs, "store">;
export type StoreBoundGetRecordsArgs = Omit<GetRecordsArgs, "store">;
export type StoreBoundGetTableArgs = Omit<GetTableArgs, "store">;
export type StoreBoundRegisterTableArgs = Omit<RegisterTableArgs, "store">;
export type StoreBoundRunQueryArgs = Omit<RunQueryArgs, "store">;
export type StoreBoundSetRecordArgs<table extends Table = Table> = Omit<SetRecordArgs<table>, "store">;
export type StoreBoundSetRecordsArgs<table extends Table = Table> = Omit<SetRecordsArgs<table>, "store">;
export type StoreBoundSubscribeQueryArgs = Omit<SubscribeQueryArgs, "store">;
export type StoreBoundSubscribeStoreArgs = Omit<SubscribeStoreArgs, "store">;
export type StoreBoundSubscribeTableArgs = Omit<SubscribeTableArgs, "store">;

export type DefaultActions = {
  decodeKey: (args: StoreBoundDecodeKeyArgs) => DecodeKeyResult;
  deleteRecord: (args: StoreBoundDeleteRecordArgs) => DeleteRecordResult;
  encodeKey: (args: StoreBoundEncodeKeyArgs) => EncodeKeyResult;
  extend: <actions>(args: StoreBoundExtendArgs<actions>) => ExtendResult<Store, actions>;
  getConfig: (args: GetConfigArgs) => GetConfigResult;
  getKeys: (args: GetKeysArgs) => GetKeysResult;
  getRecord: (args: StoreBoundGetRecordArgs) => GetRecordResult;
  getRecords: (args: StoreBoundGetRecordsArgs) => GetRecordsResult;
  getTable: (args: StoreBoundGetTableArgs) => GetTableResult;
  getTables: () => GetTablesResult;
  registerTable: (args: StoreBoundRegisterTableArgs) => RegisterTableResult;
  runQuery: (args: StoreBoundRunQueryArgs) => RunQueryResult;
  setRecord: <table extends Table>(args: StoreBoundSetRecordArgs<table>) => SetRecordResult;
  setRecords: <table extends Table>(args: StoreBoundSetRecordsArgs<table>) => SetRecordsResult;
  subscribeQuery: (args: StoreBoundSubscribeQueryArgs) => SubscribeQueryResult;
  subscribeStore: (args: StoreBoundSubscribeStoreArgs) => SubscribeStoreResult;
  subscribeTable: (args: StoreBoundSubscribeTableArgs) => SubscribeTableResult;
};

export function defaultActions(store: Store): DefaultActions {
  return {
    decodeKey: (args: StoreBoundDecodeKeyArgs) => decodeKey({ store, ...args }),
    deleteRecord: (args: StoreBoundDeleteRecordArgs) => deleteRecord({ store, ...args }),
    encodeKey: (args: StoreBoundEncodeKeyArgs) => encodeKey({ store, ...args }),
    extend: <actions>(args: StoreBoundExtendArgs<actions>) => extend({ store, ...args }),
    getConfig: (args: StoreBoundGetConfigArgs) => getConfig({ store, ...args }),
    getKeys: (args: StoreBoundGetKeysArgs) => getKeys({ store, ...args }),
    getRecord: (args: StoreBoundGetRecordArgs) => getRecord({ store, ...args }),
    getRecords: (args: StoreBoundGetRecordsArgs) => getRecords({ store, ...args }),
    getTable: (args: StoreBoundGetTableArgs) => getTable({ store, ...args }),
    getTables: () => getTables({ store }),
    registerTable: (args: StoreBoundRegisterTableArgs) => registerTable({ store, ...args }),
    runQuery: (args: StoreBoundRunQueryArgs) => runQuery({ store, ...args }),
    setRecord: (args: StoreBoundSetRecordArgs) => setRecord({ store, ...args }),
    setRecords: (args: StoreBoundSetRecordsArgs) => setRecords({ store, ...args }),
    subscribeQuery: (args: StoreBoundSubscribeQueryArgs) => subscribeQuery({ store, ...args }),
    subscribeStore: (args: StoreBoundSubscribeStoreArgs) => subscribeStore({ store, ...args }),
    subscribeTable: (args: StoreBoundSubscribeTableArgs) => subscribeTable({ store, ...args }),
  };
}
