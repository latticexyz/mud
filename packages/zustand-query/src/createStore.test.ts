import { describe, expect, it, vi } from "vitest";
import { attest } from "@arktype/attest";
import { CreateStoreResult, createStore } from "./createStore";
import { defineStore, defineTable } from "@latticexyz/store/config/v2";
import { Hex } from "viem";

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

    attest(store.get().config).snap({
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
    attest(store.get().records).snap({ namespace1: { table1: {} } });
  });

  it("should be typed with the config tables", () => {
    const config = defineStore({
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
    const store = createStore(config);
    store.setRecord({
      table: config.namespaces.namespace1.tables.table1,
      key: { field2: 1 },
      record: { field1: "hello" },
    });

    attest<CreateStoreResult<typeof config>>(store);
    attest<{
      config: {
        namespace1: {
          table1: {
            label: "table1";
            type: "table";
            namespace: string;
            name: string;
            tableId: Hex;
            schema: {
              field1: { type: "string"; internalType: "string" };
              field2: { type: "uint32"; internalType: "uint32" };
            };
            key: readonly ["field2"];
          };
        };
      };
      records: {
        namespace1: {
          table1: {
            [key: string]: {
              field1: string;
              field2: number;
            };
          };
        };
      };
    }>(store.get());
  });

  describe("setRecord", () => {
    it("should show a type warning if an invalid table, key or record is used", () => {
      const config = defineStore({
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

      const table = config.namespaces.namespace1.tables.table1;
      const store = createStore(config);

      attest(() =>
        store.setRecord({
          table,
          // @ts-expect-error Property 'field2' is missing in type '{ field3: number; }'
          key: { field3: 2 },
          record: { field1: "" },
        }),
      )
        .throws("Provided key is missing field field2.")
        .type.errors(`Property 'field2' is missing in type '{ field3: number; }`);

      attest(() =>
        store.setRecord({
          table,
          // @ts-expect-error Type 'string' is not assignable to type 'number'.
          key: { field2: 1, field3: "invalid" },
          record: { field1: "" },
        }),
      ).type.errors(`Type 'string' is not assignable to type 'number'.`);

      attest(() =>
        store.setRecord({
          table,
          key: { field2: 1, field3: 2 },
          // @ts-expect-error Type 'number' is not assignable to type 'string'.
          record: { field1: 1 },
        }),
      ).type.errors(`Type 'number' is not assignable to type 'string'.`);
    });
  });

  describe("setRecords", () => {
    it("should show a type warning if an invalid table, key or record is used", () => {
      const config = defineStore({
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

      const table = config.namespaces.namespace1.tables.table1;
      const store = createStore(config);

      attest(() =>
        store.setRecords({
          table,
          // @ts-expect-error Type '{ field1: string; }' is missing the following properties from type
          records: [{ field1: "" }],
        }),
      )
        .throws("Provided key is missing field field2.")
        .type.errors(`Type '{ field1: string; }' is missing the following properties from type`);

      attest(() =>
        store.setRecords({
          table,
          // @ts-expect-error Type 'number' is not assignable to type 'string'.
          records: [{ field1: 1, field2: 1, field3: 2 }],
        }),
      ).type.errors(`Type 'number' is not assignable to type 'string'.`);
    });
  });

  describe("subscribeTable", () => {
    it("should notify listeners on table updates", () => {
      const config = defineStore({
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

      const table = config.namespaces.namespace1.tables.table1;
      const store = createStore(config);

      const listener = vi.fn();

      store.subscribeTable({
        table: { label: "table1", namespace: "namespace1" },
        subscriber: listener,
      });

      store.setRecord({
        table,
        key: { field2: 1, field3: 2 },
        record: { field1: "hello" },
      });

      expect(listener).toHaveBeenNthCalledWith(1, {
        "1|2": {
          prev: undefined,
          current: { field1: "hello", field2: 1, field3: 2 },
        },
      });

      store.setRecord({
        table,
        key: { field2: 1, field3: 2 },
        record: { field1: "world" },
      });

      expect(listener).toHaveBeenNthCalledWith(2, {
        "1|2": {
          prev: { field1: "hello", field2: 1, field3: 2 },
          current: { field1: "world", field2: 1, field3: 2 },
        },
      });

      store.deleteRecord({
        table: { label: "table1", namespace: "namespace1" },
        key: { field2: 1, field3: 2 },
      });

      expect(listener).toHaveBeenNthCalledWith(3, {
        "1|2": {
          prev: { field1: "world", field2: 1, field3: 2 },
          current: undefined,
        },
      });
    });

    it("should not notify listeners after they have been removed", () => {
      const config = defineStore({
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

      const table = config.namespaces.namespace1.tables.table1;
      const store = createStore(config);

      const subscriber = vi.fn();

      const unsubscribe = store.subscribeTable({
        table: { label: "table1", namespace: "namespace1" },
        subscriber,
      });

      store.setRecord({
        table,
        key: { field2: 1, field3: 2 },
        record: { field1: "hello" },
      });

      expect(subscriber).toHaveBeenNthCalledWith(1, {
        "1|2": {
          prev: undefined,
          current: { field1: "hello", field2: 1, field3: 2 },
        },
      });

      unsubscribe();

      store.setRecord({
        table,
        key: { field2: 1, field3: 2 },
        record: { field1: "world" },
      });

      expect(subscriber).toBeCalledTimes(1);
    });
  });

  describe("subscribeStore", () => {
    it("should notify listeners on store updates", () => {
      const config = defineStore({
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

      const table = config.namespaces.namespace1.tables.table1;
      const store = createStore(config);

      const subscriber = vi.fn();

      store.subscribeStore({ subscriber });

      store.setRecord({
        table,
        key: { field2: 1, field3: 2 },
        record: { field1: "hello" },
      });

      expect(subscriber).toHaveBeenNthCalledWith(1, {
        config: {},
        records: {
          namespace1: {
            table1: {
              "1|2": {
                prev: undefined,
                current: { field1: "hello", field2: 1, field3: 2 },
              },
            },
          },
        },
      });

      store.setRecord({
        table,
        key: { field2: 1, field3: 2 },
        record: { field1: "world" },
      });

      expect(subscriber).toHaveBeenNthCalledWith(2, {
        config: {},
        records: {
          namespace1: {
            table1: {
              "1|2": {
                prev: { field1: "hello", field2: 1, field3: 2 },
                current: { field1: "world", field2: 1, field3: 2 },
              },
            },
          },
        },
      });

      store.deleteRecord({
        table: { label: "table1", namespace: "namespace1" },
        key: { field2: 1, field3: 2 },
      });

      expect(subscriber).toHaveBeenNthCalledWith(3, {
        config: {},
        records: {
          namespace1: {
            table1: {
              "1|2": {
                prev: { field1: "world", field2: 1, field3: 2 },
                current: undefined,
              },
            },
          },
        },
      });

      store.registerTable({
        table: defineTable({
          namespace: "namespace2",
          label: "table2",
          schema: { field1: "uint256", value: "uint256" },
          key: ["field1"],
        }),
      });

      expect(subscriber).toHaveBeenNthCalledWith(4, {
        config: {
          namespace2: {
            table2: {
              current: {
                key: ["field1"],
                label: "table2",
                name: "table2",
                namespace: "namespace2",
                schema: {
                  field1: {
                    internalType: "uint256",
                    type: "uint256",
                  },
                  value: {
                    internalType: "uint256",
                    type: "uint256",
                  },
                },
                tableId: "0x74626e616d65737061636532000000007461626c653200000000000000000000",
                type: "table",
              },
              prev: undefined,
            },
          },
        },
        records: {},
      });
    });

    it("should not notify listeners after they have been removed", () => {
      const config = defineStore({
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

      const table = config.namespaces.namespace1.tables.table1;
      const store = createStore(config);

      const subscriber = vi.fn();

      const unsubscribe = store.subscribeStore({
        subscriber,
      });

      store.setRecord({
        table,
        key: { field2: 1, field3: 2 },
        record: { field1: "hello" },
      });

      expect(subscriber).toHaveBeenNthCalledWith(1, {
        config: {},
        records: {
          namespace1: {
            table1: {
              "1|2": {
                prev: undefined,
                current: { field1: "hello", field2: 1, field3: 2 },
              },
            },
          },
        },
      });

      unsubscribe();

      store.setRecord({
        table,
        key: { field2: 1, field3: 2 },
        record: { field1: "world" },
      });

      expect(subscriber).toBeCalledTimes(1);
    });
  });

  describe("getRecord", () => {
    it("should get a record by key from the table", () => {
      const config = defineStore({
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

      const table = config.namespaces.namespace1.tables.table1;

      const store = createStore(config);
      store.setRecord({
        table,
        key: { field2: 1, field3: 2 },
        record: { field1: "hello" },
      });

      store.setRecord({
        table,
        key: { field2: 2, field3: 1 },
        record: { field1: "world" },
      });

      attest(
        store.getRecord({
          table: { label: "table1", namespace: "namespace1" },
          key: { field2: 1, field3: 2 },
        }),
      ).snap({ field1: "hello", field2: 1, field3: 2 });

      attest(
        store.getRecord({
          table: { label: "table1", namespace: "namespace1" },
          key: { field2: 2, field3: 1 },
        }),
      ).snap({ field1: "world", field2: 2, field3: 1 });
    });
  });

  describe("getTables", () => {
    it("should return an object of bound tables in the store", () => {
      const store = createStore();
      store.registerTable({
        table: defineTable({
          label: "table1",
          namespace: "namespace1",
          schema: { field1: "uint32", field2: "address" },
          key: ["field1"],
        }),
      });
      store.registerTable({
        table: defineTable({
          label: "table2",
          namespace: "namespace2",
          schema: { field1: "uint32", field2: "address" },
          key: ["field1"],
        }),
      });
      const tables = store.getTables();

      expect(tables.namespace1.table1).toBeDefined();
      expect(tables.namespace2.table2).toBeDefined();
    });
  });
});
