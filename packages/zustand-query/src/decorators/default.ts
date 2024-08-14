import { Store as StoreConfig } from "@latticexyz/store/config/v2";
import { Store } from "../common";
import { DecodeKeyArgs, DecodeKeyResult, decodeKey } from "../actions/decodeKey";
import { DeleteRecordArgs, DeleteRecordResult, deleteRecord } from "../actions/deleteRecord";
import { EncodeKeyArgs, EncodeKeyResult, encodeKey } from "../actions/encodeKey";
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

export type StoreBoundDecodeKeyArgs<table extends Table = Table> = Omit<DecodeKeyArgs<table>, "store">;
export type StoreBoundDeleteRecordArgs<table extends Table> = Omit<DeleteRecordArgs<table>, "store">;
export type StoreBoundEncodeKeyArgs<table extends Table = Table> = EncodeKeyArgs<table>;
export type StoreBoundGetConfigArgs = Omit<GetConfigArgs, "store">;
export type StoreBoundGetKeysArgs<table extends Table = Table> = Omit<GetKeysArgs<table>, "store">;
export type StoreBoundGetRecordArgs<table extends Table = Table> = Omit<GetRecordArgs<table>, "store">;
export type StoreBoundGetRecordsArgs<table extends Table = Table> = Omit<GetRecordsArgs<table>, "store">;
export type StoreBoundGetTableArgs<table extends Table = Table> = Omit<GetTableArgs<table>, "store">;
export type StoreBoundRegisterTableArgs<table extends Table = Table> = Omit<RegisterTableArgs<table>, "store">;
export type StoreBoundRunQueryArgs = Omit<RunQueryArgs, "store">;
export type StoreBoundSetRecordArgs<table extends Table = Table> = Omit<SetRecordArgs<table>, "store">;
export type StoreBoundSetRecordsArgs<table extends Table = Table> = Omit<SetRecordsArgs<table>, "store">;
export type StoreBoundSubscribeQueryArgs = Omit<SubscribeQueryArgs, "store">;
export type StoreBoundSubscribeStoreArgs = Omit<SubscribeStoreArgs, "store">;
export type StoreBoundSubscribeTableArgs<table extends Table = Table> = Omit<SubscribeTableArgs<table>, "store">;

export type DefaultActions<config extends StoreConfig = StoreConfig> = {
  decodeKey: <table extends Table>(args: StoreBoundDecodeKeyArgs<table>) => DecodeKeyResult<table>;
  deleteRecord: <table extends Table>(args: StoreBoundDeleteRecordArgs<table>) => DeleteRecordResult;
  encodeKey: <table extends Table>(args: StoreBoundEncodeKeyArgs<table>) => EncodeKeyResult;
  getConfig: (args: StoreBoundGetConfigArgs) => GetConfigResult;
  getKeys: <table extends Table>(args: GetKeysArgs<table>) => GetKeysResult<table>;
  getRecord: <table extends Table>(args: StoreBoundGetRecordArgs<table>) => GetRecordResult<table>;
  getRecords: <table extends Table>(args: StoreBoundGetRecordsArgs<table>) => GetRecordsResult<table>;
  getTable: <table extends Table>(args: StoreBoundGetTableArgs<table>) => GetTableResult<table>;
  getTables: () => GetTablesResult<config>;
  registerTable: <table extends Table>(args: StoreBoundRegisterTableArgs<table>) => RegisterTableResult<table>;
  runQuery: (args: StoreBoundRunQueryArgs) => RunQueryResult;
  setRecord: <table extends Table>(args: StoreBoundSetRecordArgs<table>) => SetRecordResult;
  setRecords: <table extends Table>(args: StoreBoundSetRecordsArgs<table>) => SetRecordsResult;
  subscribeQuery: (args: StoreBoundSubscribeQueryArgs) => SubscribeQueryResult;
  subscribeStore: (args: StoreBoundSubscribeStoreArgs) => SubscribeStoreResult;
  subscribeTable: <table extends Table>(args: StoreBoundSubscribeTableArgs<table>) => SubscribeTableResult;
};

export function defaultActions<config extends StoreConfig>(store: Store<config>): DefaultActions<config> {
  return {
    decodeKey: <table extends Table>(args: StoreBoundDecodeKeyArgs<table>) => decodeKey({ store, ...args }),
    deleteRecord: <table extends Table>(args: StoreBoundDeleteRecordArgs<table>) => deleteRecord({ store, ...args }),
    encodeKey: <table extends Table>(args: StoreBoundEncodeKeyArgs<table>) => encodeKey(args),
    getConfig: (args: StoreBoundGetConfigArgs) => getConfig({ store, ...args }),
    getKeys: <table extends Table>(args: StoreBoundGetKeysArgs<table>) => getKeys({ store, ...args }),
    getRecord: <table extends Table>(args: StoreBoundGetRecordArgs<table>) => getRecord({ store, ...args }),
    getRecords: <table extends Table>(args: StoreBoundGetRecordsArgs<table>) => getRecords({ store, ...args }),
    getTable: <table extends Table>(args: StoreBoundGetTableArgs<table>) => getTable({ store, ...args }),
    getTables: () => getTables({ store }),
    registerTable: (args: StoreBoundRegisterTableArgs) => registerTable({ store, ...args }),
    runQuery: (args: StoreBoundRunQueryArgs) => runQuery({ store, ...args }),
    setRecord: <table extends Table>(args: StoreBoundSetRecordArgs<table>) => setRecord({ store, ...args }),
    setRecords: <table extends Table>(args: StoreBoundSetRecordsArgs<table>) => setRecords({ store, ...args }),
    subscribeQuery: (args: StoreBoundSubscribeQueryArgs) => subscribeQuery({ store, ...args }),
    subscribeStore: (args: StoreBoundSubscribeStoreArgs) => subscribeStore({ store, ...args }),
    subscribeTable: <table extends Table>(args: StoreBoundSubscribeTableArgs<table>) =>
      subscribeTable({ store, ...args }),
  };
}
