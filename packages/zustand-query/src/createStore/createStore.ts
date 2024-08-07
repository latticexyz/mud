import { createStore as createZustandStore } from "zustand/vanilla";
import { StoreApi } from "zustand";
import { mutative } from "zustand-mutative";
import { Store as StoreConfig } from "@latticexyz/store/config/v2";
import { TableLabel } from "../common";
import { State, Subscribers } from "./common";
import { SetRecordArgs, SetRecordResult, setRecord } from "./setRecord";
import { SetRecordsArgs, SetRecordsResult, setRecords } from "./setRecords";
import { DeleteRecordArgs, DeleteRecordResult, deleteRecord } from "./deleteRecord";
import { GetRecordArgs, GetRecordResult, getRecord } from "./getRecord";
import { GetRecordsArgs, GetRecordsResult, getRecords } from "./getRecords";
import { RegisterTableArgs, RegisterTableResult, registerTable } from "./registerTable";
import { GetTableResult, getTable } from "./getTable";
import { GetTablesResult, getTables } from "./getTables";
import { SubscribeArgs, SubscribeResult, subscribe } from "./subscribe";
import { DecodeKeyArgs, DecodeKeyResult, decodeKey } from "./decodeKey";
import { GetKeysArgs, GetKeysResult, getKeys } from "./getKeys";
import { GetConfigArgs, GetConfigResult, getConfig } from "./getConfig";

export type Config = StoreConfig;

type Actions = {
  actions: {
    /**
     * Get a record from a table.
     */
    getRecord: (args: GetRecordArgs) => GetRecordResult;
    /**
     * Get records from a table.
     */
    getRecords: (args: GetRecordsArgs) => GetRecordsResult;
    /**
     * Get keys from the table
     */
    getKeys: (args: GetKeysArgs) => GetKeysResult;
    /**
     * Get a table's config
     */
    getConfig: (args: GetConfigArgs) => GetConfigResult;
    /**
     * Set a record in a table. If a partial record is provided, existing fields stay unchanged
     * and non-existing fields are initialized with the default value for this field.
     * Key fields of the record are always set to the provided key.
     */
    setRecord: (args: SetRecordArgs) => SetRecordResult;
    /**
     * Set multiple records in a table.
     */
    setRecords: (args: SetRecordsArgs) => SetRecordsResult;
    /**
     * Delete a record in a table.
     */
    deleteRecord: (args: DeleteRecordArgs) => DeleteRecordResult;
    /**
     * Turn the encoded key into the decoded key for the provided table
     * @returns Key
     */
    decodeKey: (args: DecodeKeyArgs) => DecodeKeyResult;
    /**
     * Add a subscriber for record updates on a table.
     * @returns A function to unsubscribe the subscriber.
     */
    subscribe: (args: SubscribeArgs) => SubscribeResult;
    /**
     * Dynamically register a new table in the store
     * @returns A bound Table object for easier interaction with the table.
     */
    registerTable: (args: RegisterTableArgs) => RegisterTableResult;
    /**
     * @returns A bound Table object for easier interaction with the table.
     */
    getTable: (tableLabel: TableLabel) => GetTableResult;
    /**
     * @return Bound version of all tables in the store.
     */
    getTables: () => GetTablesResult;
  };
};

export type Store = StoreApi<State & Actions>;

/**
 * Initializes a Zustand store based on the provided table configs.
 */
export function createStore(storeConfig?: StoreConfig): Store {
  const subscribers: Subscribers = {};

  return createZustandStore<State & Actions>()(
    mutative((set, get) => {
      const state: State = { config: {}, records: {} };
      const context = { subscribers, get, set };

      // Initialize the store
      if (storeConfig) {
        for (const [namespace, { tables }] of Object.entries(storeConfig.namespaces)) {
          for (const [label, tableConfig] of Object.entries(tables)) {
            // TODO: add option to resolveTables to not add codegen/deploy?
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { codegen, deploy, ...relevantConfig } = tableConfig;

            // Set config for tables
            state.config[namespace] ??= {};
            state.config[namespace][label] = relevantConfig;

            // Init records map for tables
            state.records[namespace] ??= {};
            state.records[namespace][label] = {};

            // Init subscribers set for tables
            subscribers[namespace] ??= {};
            subscribers[namespace][label] ??= new Set();
          }
        }
      }

      return {
        ...state,
        actions: {
          getRecord: getRecord(context),
          getRecords: getRecords(context),
          getKeys: getKeys(context),
          getConfig: getConfig(context),
          setRecord: setRecord(context),
          setRecords: setRecords(context),
          deleteRecord: deleteRecord(context),
          decodeKey: decodeKey(context),
          subscribe: subscribe(context),
          registerTable: registerTable(context),
          getTable: getTable(context),
          getTables: getTables(context),
        },
      };
    }),
  );
}
