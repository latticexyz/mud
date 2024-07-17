import { describe, it, expect } from "vitest";
import { Table } from "@latticexyz/config";
import { StoreApi } from "zustand";

/**
 * A Record is one row of the table. It includes both the key and the value.
 */
type Record = { [field: string]: number | string | number[] | string[] };

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
  state: {
    [namespace: string]: {
      [table: string]: {
        [key: string]: Record;
      };
    };
  };
};

type Actions = { actions: {} };

type Store = StoreApi<State & Actions>;

type BoundTable = {
  store: Store;
  getRecord: (key: Key) => Record;
  setRecord: (record: Record) => void;
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
  throw new Error("Not implemented");
  return {} as never;
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
    getRecord: (key: Key) => getRecord(store, tableLabel, key),
    setRecord: (record: Record) => setRecord(store, tableLabel, record),
    // TODO: dynamically add setters and getters for individual fields of the table
  };
}

/**
 * Get a record from a table.
 */
function getRecord(store: Store, tableLabel: TableLabel, key: Key): Record {
  throw new Error("Not implemented");
  return {};
}

/**
 * Set a record in a table.
 * If a partial record is provided,
 * existing fields stay unchanged and
 * non-existing fields are initialized with the default value for this field.
 */
function setRecord(store: Store, tableLabel: TableLabel, record: Record) {
  throw new Error("Not implemented");
}

describe("Zustand Query", () => {
  it("should do the thing", () => {
    expect(true).toBe(true);
  });
});
