import { Query, Stash, StoreConfig, StoreUpdatesSubscriber } from "../common";
import { DecodeKeyArgs, DecodeKeyResult, decodeKey } from "../actions/decodeKey";
import { DeleteRecordArgs, DeleteRecordResult, deleteRecord } from "../actions/deleteRecord";
import { EncodeKeyArgs, EncodeKeyResult, encodeKey } from "../actions/encodeKey";
import { GetTableConfigArgs, GetTableConfigResult, getTableConfig } from "../actions/getTableConfig";
import { GetKeysArgs, GetKeysResult, getKeys } from "../actions/getKeys";
import { GetRecordArgs, GetRecordResult, getRecord } from "../actions/getRecord";
import { GetRecordsArgs, GetRecordsResult, getRecords } from "../actions/getRecords";
import { GetTableArgs, GetTableResult, getTable } from "../actions/getTable";
import { GetTablesResult, getTables } from "../actions/getTables";
import { RegisterTableArgs, RegisterTableResult, registerTable } from "../actions/registerTable";
import { RunQueryArgs, RunQueryOptions, RunQueryResult, runQuery } from "../actions/runQuery";
import { SetRecordArgs, SetRecordResult, setRecord } from "../actions/setRecord";
import { SetRecordsArgs, SetRecordsResult, setRecords } from "../actions/setRecords";
import { SubscribeQueryArgs, SubscribeQueryResult, subscribeQuery } from "../actions/subscribeQuery";
import { SubscribeStashArgs, SubscribeStashResult, subscribeStash } from "../actions/subscribeStash";
import { SubscribeTableArgs, SubscribeTableResult, subscribeTable } from "../actions/subscribeTable";
import { Table } from "@latticexyz/config";
import {
  registerDerivedTable,
  RegisterDerivedTableArgs,
  RegisterDerivedTableResult,
} from "../actions/registerDerivedTable";
import { IndexKey, registerIndex, RegisterIndexArgs, RegisterIndexResult } from "../actions/registerIndex";

export type StashBoundDecodeKeyArgs<table extends Table = Table> = Omit<DecodeKeyArgs<table>, "stash">;
export type StashBoundDeleteRecordArgs<table extends Table> = Omit<DeleteRecordArgs<table>, "stash">;
export type StashBoundEncodeKeyArgs<table extends Table = Table> = EncodeKeyArgs<table>;
export type StashBoundGetTableConfigArgs = Omit<GetTableConfigArgs, "stash">;
export type StashBoundGetKeysArgs<table extends Table = Table> = Omit<GetKeysArgs<table>, "stash">;
export type StashBoundGetRecordArgs<table extends Table = Table> = Omit<GetRecordArgs<table>, "stash" | "state">;
export type StashBoundGetRecordsArgs<table extends Table = Table> = Omit<GetRecordsArgs<table>, "stash" | "state">;
export type StashBoundGetTableArgs<table extends Table = Table> = Omit<GetTableArgs<table>, "stash">;
export type StashBoundRegisterTableArgs<table extends Table = Table> = Omit<RegisterTableArgs<table>, "stash">;
export type StashBoundRunQueryArgs<
  query extends Query = Query,
  options extends RunQueryOptions = RunQueryOptions,
> = Omit<RunQueryArgs<query, options>, "stash">;
export type StashBoundSetRecordArgs<table extends Table = Table> = Omit<SetRecordArgs<table>, "stash">;
export type StashBoundSetRecordsArgs<table extends Table = Table> = Omit<SetRecordsArgs<table>, "stash">;
export type StashBoundSubscribeQueryArgs<query extends Query = Query> = Omit<SubscribeQueryArgs<query>, "stash">;
export type StashBoundSubscribeStashArgs<config extends StoreConfig = StoreConfig> = Omit<
  SubscribeStashArgs<config>,
  "stash"
>;
export type StashBoundSubscribeTableArgs<table extends Table = Table> = Omit<SubscribeTableArgs<table>, "stash">;
export type StashBoundRegisterDerivedTableArgs<input extends Table, output extends Table> = Omit<
  RegisterDerivedTableArgs<input, output>,
  "stash"
>;
export type StashBoundRegisterIndexArgs<table extends Table, key extends IndexKey<table>> = Omit<
  RegisterIndexArgs<table, key>,
  "stash"
>;

export type DefaultActions<config extends StoreConfig = StoreConfig> = {
  decodeKey: <table extends Table>(args: StashBoundDecodeKeyArgs<table>) => DecodeKeyResult<table>;
  deleteRecord: <table extends Table>(args: StashBoundDeleteRecordArgs<table>) => DeleteRecordResult;
  encodeKey: <table extends Table>(args: StashBoundEncodeKeyArgs<table>) => EncodeKeyResult;
  getTableConfig: (args: StashBoundGetTableConfigArgs) => GetTableConfigResult;
  getKeys: <table extends Table>(args: StashBoundGetKeysArgs<table>) => GetKeysResult<table>;
  getRecord: <table extends Table>(args: StashBoundGetRecordArgs<table>) => GetRecordResult<table>;
  getRecords: <table extends Table>(args: StashBoundGetRecordsArgs<table>) => GetRecordsResult<table>;
  getTable: <table extends Table>(args: StashBoundGetTableArgs<table>) => GetTableResult<table>;
  getTables: () => GetTablesResult<config>;
  registerTable: <table extends Table>(args: StashBoundRegisterTableArgs<table>) => RegisterTableResult<table>;
  runQuery: <query extends Query, options extends RunQueryOptions>(
    args: StashBoundRunQueryArgs<query, options>,
  ) => RunQueryResult<query, options>;
  setRecord: <table extends Table>(args: StashBoundSetRecordArgs<table>) => SetRecordResult;
  setRecords: <table extends Table>(args: StashBoundSetRecordsArgs<table>) => SetRecordsResult;
  subscribeQuery: <query extends Query>(args: StashBoundSubscribeQueryArgs<query>) => SubscribeQueryResult<query>;
  subscribeStash: (args: StashBoundSubscribeStashArgs<config>) => SubscribeStashResult;
  subscribeTable: <table extends Table>(args: StashBoundSubscribeTableArgs<table>) => SubscribeTableResult;
  registerDerivedTable: <input extends Table, output extends Table>(
    args: StashBoundRegisterDerivedTableArgs<input, output>,
  ) => RegisterDerivedTableResult<output>;
  registerIndex: <table extends Table, key extends IndexKey<table>>(
    args: StashBoundRegisterIndexArgs<table, key>,
  ) => RegisterIndexResult<table, key>;
};

export function defaultActions<config extends StoreConfig>(stash: Stash<config>): DefaultActions<config> {
  return {
    decodeKey: <table extends Table>(args: StashBoundDecodeKeyArgs<table>) => decodeKey({ stash, ...args }),
    deleteRecord: <table extends Table>(args: StashBoundDeleteRecordArgs<table>) => deleteRecord({ stash, ...args }),
    encodeKey: <table extends Table>(args: StashBoundEncodeKeyArgs<table>) => encodeKey(args),
    getTableConfig: (args: StashBoundGetTableConfigArgs) => getTableConfig({ stash, ...args }),
    getKeys: <table extends Table>(args: StashBoundGetKeysArgs<table>) => getKeys({ stash, ...args }),
    getRecord: <table extends Table>(args: StashBoundGetRecordArgs<table>) => getRecord({ stash, ...args }),
    getRecords: <table extends Table>(args: StashBoundGetRecordsArgs<table>) => getRecords({ stash, ...args }),
    getTable: <table extends Table>(args: StashBoundGetTableArgs<table>) => getTable({ stash, ...args }),
    getTables: () => getTables({ stash }),
    registerTable: <table extends Table>(args: StashBoundRegisterTableArgs<table>) => registerTable({ stash, ...args }),
    runQuery: <query extends Query, options extends RunQueryOptions>(args: StashBoundRunQueryArgs<query, options>) =>
      runQuery({ stash, ...args }),
    setRecord: <table extends Table>(args: StashBoundSetRecordArgs<table>) => setRecord({ stash, ...args }),
    setRecords: <table extends Table>(args: StashBoundSetRecordsArgs<table>) => setRecords({ stash, ...args }),
    subscribeQuery: <query extends Query>(args: StashBoundSubscribeQueryArgs<query>) =>
      subscribeQuery({ stash, ...args }),
    subscribeStash: <config extends StoreConfig>(args: StashBoundSubscribeStashArgs<config>) =>
      subscribeStash({ stash, subscriber: args.subscriber as StoreUpdatesSubscriber }),
    subscribeTable: <table extends Table>(args: StashBoundSubscribeTableArgs<table>) =>
      subscribeTable({ stash, ...args }),
    registerDerivedTable: <input extends Table, output extends Table>(
      args: StashBoundRegisterDerivedTableArgs<input, output>,
    ) => registerDerivedTable({ stash, ...args }),
    registerIndex: <table extends Table, key extends IndexKey<table>>(args: StashBoundRegisterIndexArgs<table, key>) =>
      registerIndex({ stash, ...args }),
  };
}
