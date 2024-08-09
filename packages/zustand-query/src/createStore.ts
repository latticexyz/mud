import { Store as StoreConfig } from "@latticexyz/store/config/v2";
import { MutableState, Store, Subscribers } from "./common";
import { DefaultActions, defaultActions } from "./decorators/default";
import { extend } from "./actions/extend";

export type Config = StoreConfig;

export type CreateStoreResult = Store & DefaultActions;

/**
 * Initializes a Zustand store based on the provided table configs.
 */
export function createStore(storeConfig?: Config): CreateStoreResult {
  // TODO:
  // - differentiate between table subscriber and global subscriber
  //   (global one can be used for useStore selector, table one can be used for useTable selector)
  // - update API to not require the Zustand Store return type bc we don't have prevState
  //
  const subscribers: Subscribers = {};

  const state: MutableState = {
    config: {},
    records: {},
  };

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

  const store = {
    get: () => state,
    _: {
      state,
      subscribers,
    },
  };

  return extend({ store, actions: defaultActions(store) });
}
