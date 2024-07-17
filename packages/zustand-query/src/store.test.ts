import { describe, it, expect } from "vitest";
import { Table } from "@latticexyz/config";
import { createStore as createZustandStore } from "zustand/vanilla";
import { StoreApi } from "zustand";
import { mutative } from "zustand-mutative";
import { dynamicAbiTypeToDefaultValue, staticAbiTypeToDefaultValue } from "@latticexyz/schema-type/internal";

/**
 * A Record is one row of the table. It includes both the key and the value.
 */
type Record = { [field: string]: number | string | bigint | number[] | string[] | bigint[] };

/**
 * A Key is the unique identifier for a row in the table.
 */
type Key = { [field: string]: number | string };

type State = {
  config: {
    [namespace: string]: {
      [table: string]: Table;
    };
  };
  records: {
    [namespace: string]: {
      [table: string]: {
        [key: string]: Record;
      };
    };
  };
};

type Actions = {
  actions: {
    /**
     * Set a record in a table. If a partial record is provided, existing fields stay unchanged
     * and non-existing fields are initialized with the default value for this field.
     * Key fields of the record are always set to the provided key.
     */
    setRecord: (tableLabel: TableLabel, key: Key, record: Record) => void;
    /**
     * Get a record from a table.
     */
    getRecord: (tableLabel: TableLabel, key: Key) => Record;
  };
};

type Store = StoreApi<State & Actions>;

type BoundTable = {
  store: Store;
  getRecord: (key: Key) => Record;
  setRecord: (key: Key, record: Record) => void;
};

type Config = {
  namespaces: {
    [namespace: string]: {
      tables: {
        [label: string]: Table;
      };
    };
  };
};

type TableLabel = { label: string; namespace?: string };

/**
 * Initializes a Zustand store based on the provided table configs.
 */
function createStore(config: Config): Store {
  return createZustandStore<State & Actions>()(
    mutative((set, get) => {
      const state: State = { config: {}, records: {} };

      for (const [namespace, { tables }] of Object.entries(config.namespaces)) {
        for (const [label, table] of Object.entries(tables)) {
          state.config[namespace] = {};
          state.config[namespace][label] = table;

          state.records[namespace] = {};
          state.records[namespace][label] = {};
        }
      }

      /**
       * Encode a key object into a string that can be used as index in the store
       * TODO: Benchmark performance of this function
       */
      function encodeKey({ label, namespace }: TableLabel, key: Key): string {
        const keyOrder = get().config[namespace ?? ""][label].key;
        return keyOrder.map((keyName) => key[keyName]).join("|");
      }

      const getRecord = (tableLabel: TableLabel, key: Key) => {
        return get().records[tableLabel.namespace ?? ""][tableLabel.label][encodeKey(tableLabel, key)];
      };

      // TODO: Benchmark performance of this function.
      const setRecord = (tableLabel: TableLabel, key: Key, record: Record) => {
        set((prev) => {
          const namespace = tableLabel.namespace ?? "";
          const encodedKey = encodeKey(tableLabel, key);
          const prevRecord = prev.records[namespace][tableLabel.label][encodedKey] ?? {};
          const schema = prev.config[namespace][tableLabel.label].schema;
          const newRecord = Object.fromEntries(
            Object.keys(schema).map((fieldName) => [
              fieldName,
              key[fieldName] ?? // Key fields in record must match the key
                record[fieldName] ?? // Override provided record fields
                prevRecord[fieldName] ?? // Keep existing non-overridden fields
                staticAbiTypeToDefaultValue[schema[fieldName] as never] ?? // Default values for new fields
                dynamicAbiTypeToDefaultValue[schema[fieldName] as never],
            ]),
          );
          prev.records[tableLabel.namespace ?? ""][tableLabel.label][encodedKey] = newRecord;
        });
      };

      return { ...state, actions: { setRecord, getRecord } };
    }),
  );
}

/**
 * Registers a new table into an existing store.
 * @returns A bound Table object for easier interaction with the table.
 */
function registerTable(store: Store, table: Table): BoundTable {
  throw new Error("Not implemented");
  // TODO: add the table to store.config
  return getTable(
    store,
    // TODO: replace with table.label once available on the config
    { label: table.name, namespace: table.name },
  );
}

/**
 * @returns A bound Table object for easier interaction with the table.
 */
function getTable(store: Store, tableLabel: TableLabel): BoundTable {
  return {
    store,
    getRecord: (key: Key) => store.getState().actions.getRecord(tableLabel, key),
    setRecord: (key: Key, record: Record) => store.getState().actions.setRecord(tableLabel, key, record),
    // TODO: dynamically add setters and getters for individual fields of the table
  };
}

describe("Zustand Query", () => {
  it("should do the thing", () => {
    expect(true).toBe(true);
  });
});
