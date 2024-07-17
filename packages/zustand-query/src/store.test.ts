import { beforeEach, describe, expect, it } from "vitest";
import { AbiType } from "@latticexyz/config";
import { createStore as createZustandStore } from "zustand/vanilla";
import { StoreApi } from "zustand";
import { mutative } from "zustand-mutative";
import { dynamicAbiTypeToDefaultValue, staticAbiTypeToDefaultValue } from "@latticexyz/schema-type/internal";
import { attest } from "@arktype/attest";

/**
 * TODOs
 * - Add stronger types based on config
 * - Add tests for all base API functions
 * - Add query layer
 */

/**
 * A Record is one row of the table. It includes both the key and the value.
 */
type Record = { [field: string]: number | string | bigint | number[] | string[] | bigint[] };

/**
 * A Key is the unique identifier for a row in the table.
 */
type Key = { [field: string]: number | string };

type Schema = { [key: string]: AbiType };

// TODO: reuse the store config table input for this
type TableConfigInput = {
  key: string[];
  schema: Schema;
};

type TableConfigFull = {
  key: string[];
  schema: Schema;
  label: string;
  namespace: string;
};

type State = {
  config: {
    [namespace: string]: {
      [table: string]: TableConfigFull;
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

type SetRecordArgs = {
  tableLabel: TableLabel;
  key: Key;
  record: Record;
};

type GetRecordArgs = {
  tableLabel: TableLabel;
  key: Key;
};

type Actions = {
  actions: {
    /**
     * Set a record in a table. If a partial record is provided, existing fields stay unchanged
     * and non-existing fields are initialized with the default value for this field.
     * Key fields of the record are always set to the provided key.
     */
    setRecord: (args: SetRecordArgs) => void;
    /**
     * Get a record from a table.
     */
    getRecord: (args: GetRecordArgs) => Record;
    /**
     * Dynamically register a new table in the store
     * @returns A bound Table object for easier interaction with the table.
     */
    registerTable: (config: TableConfigFull) => BoundTable;
    /**
     * @returns A bound Table object for easier interaction with the table.
     */
    getTable: (tableLabel: TableLabel) => BoundTable;
  };
};

type Store = StoreApi<State & Actions>;

type BoundSetRecordArgs = {
  key: Key;
  record: Record;
};

type BoundGetRecordArgs = {
  key: Key;
};

type BoundTable = {
  getRecord: (args: BoundGetRecordArgs) => Record;
  setRecord: (args: BoundSetRecordArgs) => void;
};

type TablesConfig = {
  [namespace: string]: {
    [tableLabel: string]: TableConfigInput;
  };
};

type TableLabel = { label: string; namespace?: string };

/**
 * Initializes a Zustand store based on the provided table configs.
 */
function createStore(tablesConfig: TablesConfig): Store {
  return createZustandStore<State & Actions>()(
    mutative((set, get) => {
      const state: State = { config: {}, records: {} };

      for (const [namespace, tables] of Object.entries(tablesConfig)) {
        for (const [label, tableConfig] of Object.entries(tables)) {
          state.config[namespace] = {};
          state.config[namespace][label] = { ...tableConfig, namespace, label };

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
        return keyOrder
          .map((keyName) => {
            const keyValue = key[keyName];
            if (keyValue == null) {
              throw new Error(`Provided key is missing field ${keyName}.`);
            }
            return key[keyName];
          })
          .join("|");
      }

      const getRecord = ({ tableLabel, key }: GetRecordArgs) => {
        return get().records[tableLabel.namespace ?? ""][tableLabel.label][encodeKey(tableLabel, key)];
      };

      // TODO: Benchmark performance of this function.
      const setRecord = ({ tableLabel, key, record }: SetRecordArgs) => {
        set((prev) => {
          const namespace = tableLabel.namespace ?? "";
          if (prev.config[namespace] == null) {
            throw new Error(`Table '${namespace}__${tableLabel.label}' is not registered yet.`);
          }
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

      const getTable = (tableLabel: TableLabel): BoundTable => {
        return {
          getRecord: ({ key }: BoundGetRecordArgs) => getRecord({ tableLabel, key }),
          setRecord: ({ key, record }: BoundSetRecordArgs) => setRecord({ tableLabel, key, record }),
          // TODO: dynamically add setters and getters for individual fields of the table
        };
      };

      const registerTable = (tableConfig: TableConfigFull): BoundTable => {
        set((prev) => {
          const { namespace, label } = tableConfig;
          prev.config[namespace] ??= {};
          prev.config[namespace][label] = tableConfig;
          prev.records[namespace] ??= {};
          prev.records[namespace][label] ??= {};
        });
        return getTable(tableConfig);
      };

      return { ...state, actions: { setRecord, getRecord, getTable, registerTable } };
    }),
  );
}

describe("Zustand Query", () => {
  describe("createStore", () => {
    it("should initialize the store", () => {
      const tablesConfig = {
        namespace1: {
          table1: {
            schema: {
              field1: "string",
              field2: "uint32",
            },
            key: ["field2"],
          },
        },
      } satisfies TablesConfig;
      const store = createStore(tablesConfig);

      attest(store.getState().config).snap({
        namespace1: {
          table1: {
            schema: { field1: "string", field2: "uint32" },
            key: ["field2"],
            namespace: "namespace1",
            label: "table1",
          },
        },
      });
      attest(store.getState().records).snap({ namespace1: { table1: {} } });
    });
  });

  describe("store.setRecord", () => {
    it("should add the record to the table", () => {
      const tablesConfig = {
        namespace1: {
          table1: {
            schema: {
              field1: "string",
              field2: "uint32",
              field3: "int32",
            },
            key: ["field2", "field3"],
          },
        },
      } satisfies TablesConfig;

      const store = createStore(tablesConfig);
      store.getState().actions.setRecord({
        tableLabel: { label: "table1", namespace: "namespace1" },
        key: { field2: 1, field3: 2 },
        record: { field1: "hello" },
      });

      store.getState().actions.setRecord({
        tableLabel: { label: "table1", namespace: "namespace1" },
        key: { field2: 2, field3: 1 },
        record: { field1: "world" },
      });

      attest(store.getState().records).snap({
        namespace1: {
          table1: {
            "1|2": { field1: "hello", field2: 1, field3: 2 },
            "2|1": { field1: "world", field2: 2, field3: 1 },
          },
        },
      });
    });
  });

  describe("store.getRecord", () => {
    it("should get a record by key from the table", () => {
      const tablesConfig = {
        namespace1: {
          table1: {
            schema: {
              field1: "string",
              field2: "uint32",
              field3: "int32",
            },
            key: ["field2", "field3"],
          },
        },
      } satisfies TablesConfig;

      const store = createStore(tablesConfig);
      store.getState().actions.setRecord({
        tableLabel: { label: "table1", namespace: "namespace1" },
        key: { field2: 1, field3: 2 },
        record: { field1: "hello" },
      });

      store.getState().actions.setRecord({
        tableLabel: { label: "table1", namespace: "namespace1" },
        key: { field2: 2, field3: 1 },
        record: { field1: "world" },
      });

      attest(
        store.getState().actions.getRecord({
          tableLabel: { label: "table1", namespace: "namespace1" },
          key: { field2: 1, field3: 2 },
        }),
      ).snap({ field1: "hello", field2: 1, field3: 2 });

      attest(
        store.getState().actions.getRecord({
          tableLabel: { label: "table1", namespace: "namespace1" },
          key: { field2: 2, field3: 1 },
        }),
      ).snap({ field1: "world", field2: 2, field3: 1 });
    });
  });

  describe("store.registerTable", () => {
    it("should add a new table to the store and return a wrapped table", () => {
      const store = createStore({});
      const table = store.getState().actions.registerTable({
        label: "table1",
        namespace: "namespace1",
        schema: { field1: "uint32", field2: "address" },
        key: ["field1"],
      });

      attest(store.getState().config).snap({
        namespace1: {
          table1: {
            label: "table1",
            namespace: "namespace1",
            schema: { field1: "uint32", field2: "address" },
            key: ["field1"],
          },
        },
      });
      attest(store.getState().records).snap({ namespace1: { table1: {} } });
      expect(table.setRecord).toBeDefined();
      expect(table.getRecord).toBeDefined();
    });
  });

  describe("store.getTable", () => {
    it("should return a wrapped table", () => {
      const store = createStore({});
      store.getState().actions.registerTable({
        label: "table1",
        namespace: "namespace1",
        schema: { field1: "uint32", field2: "address" },
        key: ["field1"],
      });
      const table = store.getState().actions.getTable({ label: "table1", namespace: "namespace1" });

      expect(table.setRecord).toBeDefined();
      expect(table.getRecord).toBeDefined();
    });
  });

  describe("BoundTable", () => {
    let table: BoundTable;
    let store: Store;

    beforeEach(() => {
      store = createStore({});
      table = store.getState().actions.registerTable({
        label: "table1",
        namespace: "namespace1",
        schema: { field1: "uint32", field2: "address" },
        key: ["field1"],
      });
    });

    describe("setRecord", () => {
      it("should set a record in the table", () => {
        table.setRecord({ key: { field1: 1 }, record: { field2: "0x00" } });
        attest(store.getState().records).snap({ namespace1: { table1: { "1": { field1: 1, field2: "0x00" } } } });
      });
    });

    describe("getRecord", () => {
      it("should get a record from the table", () => {
        table.setRecord({ key: { field1: 2 }, record: { field2: "0x01" } });
        attest(table.getRecord({ key: { field1: 2 } })).snap({ field1: 2, field2: "0x01" });
      });
    });
  });
});
