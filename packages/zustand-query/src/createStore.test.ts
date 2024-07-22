import { describe, expect, it, vi } from "vitest";
import { attest } from "@arktype/attest";
import { createStore } from "./createStore";
import { defineStore } from "@latticexyz/store/config/v2";

describe("createStore", () => {
  it("should initialize the store", () => {
    const tablesConfig = defineStore({
      namespace: "namespace1",
      tables: {
        table1: {
          schema: {
            field1: "string",
            field2: "uint32",
          },
          key: ["field2"],
        },
      },
    });
    const store = createStore(tablesConfig);

    attest(store.getState().config).snap({
      namespace1: {
        table1: {
          label: "table1",
          type: "table",
          namespace: "namespace1",
          name: "table1",
          tableId: "0x74626e616d65737061636531000000007461626c653100000000000000000000",
          schema: {
            field1: { type: "string", internalType: "string" },
            field2: { type: "uint32", internalType: "uint32" },
          },
          key: ["field2"],
        },
      },
    });
    attest(store.getState().records).snap({ namespace1: { table1: {} } });
  });

  describe("setRecord", () => {
    it("should add the record to the table", () => {
      const tablesConfig = defineStore({
        namespace: "namespace1",
        tables: {
          table1: {
            schema: {
              field1: "string",
              field2: "uint32",
              field3: "int32",
            },
            key: ["field2", "field3"],
          },
        },
      });

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

  describe("subscribe", () => {
    it("should notify listeners on table updates", () => {
      const tablesConfig = defineStore({
        namespace: "namespace1",
        tables: {
          table1: {
            schema: {
              field1: "string",
              field2: "uint32",
              field3: "int32",
            },
            key: ["field2", "field3"],
          },
        },
      });

      const store = createStore(tablesConfig);

      const listener = vi.fn();

      store.getState().actions.subscribe({
        tableLabel: { label: "table1", namespace: "namespace1" },
        subscriber: listener,
      });

      store.getState().actions.setRecord({
        tableLabel: { label: "table1", namespace: "namespace1" },
        key: { field2: 1, field3: 2 },
        record: { field1: "hello" },
      });

      expect(listener).toHaveBeenNthCalledWith(1, {
        "1|2": {
          prev: undefined,
          current: { field1: "hello", field2: 1, field3: 2 },
        },
      });

      store.getState().actions.setRecord({
        tableLabel: { label: "table1", namespace: "namespace1" },
        key: { field2: 1, field3: 2 },
        record: { field1: "world" },
      });

      expect(listener).toHaveBeenNthCalledWith(2, {
        "1|2": {
          prev: { field1: "hello", field2: 1, field3: 2 },
          current: { field1: "world", field2: 1, field3: 2 },
        },
      });
    });

    it("should not notify listeners after they have been removed", () => {
      const tablesConfig = defineStore({
        namespace: "namespace1",
        tables: {
          table1: {
            schema: {
              field1: "string",
              field2: "uint32",
              field3: "int32",
            },
            key: ["field2", "field3"],
          },
        },
      });

      const store = createStore(tablesConfig);

      const listener = vi.fn();

      const unsubscribe = store.getState().actions.subscribe({
        tableLabel: { label: "table1", namespace: "namespace1" },
        subscriber: listener,
      });

      store.getState().actions.setRecord({
        tableLabel: { label: "table1", namespace: "namespace1" },
        key: { field2: 1, field3: 2 },
        record: { field1: "hello" },
      });

      expect(listener).toHaveBeenNthCalledWith(1, {
        "1|2": {
          prev: undefined,
          current: { field1: "hello", field2: 1, field3: 2 },
        },
      });

      unsubscribe();

      store.getState().actions.setRecord({
        tableLabel: { label: "table1", namespace: "namespace1" },
        key: { field2: 1, field3: 2 },
        record: { field1: "world" },
      });

      expect(listener).toBeCalledTimes(1);
    });
  });

  describe("getRecord", () => {
    it("should get a record by key from the table", () => {
      const tablesConfig = defineStore({
        namespace: "namespace1",
        tables: {
          table1: {
            schema: {
              field1: "string",
              field2: "uint32",
              field3: "int32",
            },
            key: ["field2", "field3"],
          },
        },
      });

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

  describe("registerTable", () => {
    it("should add a new table to the store and return a bound table", () => {
      const store = createStore();
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
            type: "table",
            namespace: "namespace1",
            name: "table1",
            tableId: "0x74626e616d65737061636531000000007461626c653100000000000000000000",
            schema: {
              field1: { type: "uint32", internalType: "uint32" },
              field2: { type: "address", internalType: "address" },
            },
            key: ["field1"],
          },
        },
      });
      attest(store.getState().records).snap({ namespace1: { table1: {} } });
      expect(table.setRecord).toBeDefined();
      expect(table.getRecord).toBeDefined();
    });
  });

  describe("getTable", () => {
    it("should return a bound table", () => {
      const store = createStore();
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
});
