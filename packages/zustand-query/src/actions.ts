import { Store } from "./createStore/createStore";
import { DecodeKeyArgs, DecodeKeyResult } from "./createStore/decodeKey";
import { DeleteRecordArgs, DeleteRecordResult } from "./createStore/deleteRecord";
import { GetConfigArgs, GetConfigResult } from "./createStore/getConfig";
import { GetKeysArgs, GetKeysResult } from "./createStore/getKeys";
import { GetRecordArgs, GetRecordResult } from "./createStore/getRecord";
import { GetRecordsArgs, GetRecordsResult } from "./createStore/getRecords";
import { GetTableArgs, GetTableResult } from "./createStore/getTable";
import { GetTablesResult } from "./createStore/getTables";
import { RegisterTableArgs, RegisterTableResult } from "./createStore/registerTable";
import { SetRecordArgs, SetRecordResult } from "./createStore/setRecord";
import { SetRecordsArgs, SetRecordsResult } from "./createStore/setRecords";
import { SubscribeArgs, SubscribeResult } from "./createStore/subscribe";

export function getRecord(store: Store, args: GetRecordArgs): GetRecordResult {
  return store.getState().actions.getRecord(args);
}

export function getRecords(store: Store, args: GetRecordsArgs): GetRecordsResult {
  return store.getState().actions.getRecords(args);
}

export function getKeys(store: Store, args: GetKeysArgs): GetKeysResult {
  return store.getState().actions.getKeys(args);
}

export function getConfig(store: Store, args: GetConfigArgs): GetConfigResult {
  return store.getState().actions.getConfig(args);
}

export function setRecord(store: Store, args: SetRecordArgs): SetRecordResult {
  return store.getState().actions.setRecord(args);
}

export function setRecords(store: Store, args: SetRecordsArgs): SetRecordsResult {
  return store.getState().actions.setRecords(args);
}

export function deleteRecord(store: Store, args: DeleteRecordArgs): DeleteRecordResult {
  return store.getState().actions.deleteRecord(args);
}

export function decodeKey(store: Store, args: DecodeKeyArgs): DecodeKeyResult {
  return store.getState().actions.decodeKey(args);
}

export function subscribe(store: Store, args: SubscribeArgs): SubscribeResult {
  return store.getState().actions.subscribe(args);
}

export function registerTable(store: Store, args: RegisterTableArgs): RegisterTableResult {
  return store.getState().actions.registerTable(args);
}

export function getTable(store: Store, args: GetTableArgs): GetTableResult {
  return store.getState().actions.getTable(args);
}

export function getTables(store: Store): GetTablesResult {
  return store.getState().actions.getTables();
}
