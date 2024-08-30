import { describe, expect, it, vi } from "vitest";
import { attest } from "@arktype/attest";
import { CreateStoreResult, createStash } from "./createStash";
import { defineStore, defineTable } from "@latticexyz/store/config/v2";
import { Hex } from "viem";

describe("createStash", () => {
  it("should initialize the stash", () => {
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
    const stash = createStash(tablesConfig);

    attest(stash.get().config).snap({
      namespace1: {
        table1: {
          label: "table1",
          type: "table",
          namespace: "namespace1",
          namespaceLabel: "namespace1",
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
    attest(stash.get().records).snap({ namespace1: { table1: {} } });
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
    const stash = createStash(config);
    stash.setRecord({
      table: config.namespaces.namespace1.tables.table1,
      key: { field2: 1 },
      record: { field1: "hello" },
    });

    attest<CreateStoreResult<typeof config>>(stash);
    attest<{
      config: {
        namespace1: {
          table1: {
            label: "table1";
            type: "table";
            namespace: string;
            namespaceLabel: "namespace1";
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
    }>(stash.get());
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
      const stash = createStash(config);

      const listener = vi.fn();

      stash.subscribeTable({
        table,
        subscriber: listener,
      });

      stash.setRecord({
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

      stash.setRecord({
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

      stash.deleteRecord({
        table,
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
      const stash = createStash(config);

      const subscriber = vi.fn();

      const unsubscribe = stash.subscribeTable({
        table,
        subscriber,
      });

      stash.setRecord({
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

      stash.setRecord({
        table,
        key: { field2: 1, field3: 2 },
        record: { field1: "world" },
      });

      expect(subscriber).toBeCalledTimes(1);
    });
  });

  describe("subscribeStore", () => {
    it("should notify listeners on stash updates", () => {
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
      const stash = createStash(config);

      const subscriber = vi.fn();

      stash.subscribeStore({ subscriber });

      stash.setRecord({
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

      stash.setRecord({
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

      stash.deleteRecord({
        table,
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

      stash.registerTable({
        table: defineTable({
          namespaceLabel: "namespace2",
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
                namespaceLabel: "namespace2",
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
      const stash = createStash(config);

      const subscriber = vi.fn();

      const unsubscribe = stash.subscribeStore({
        subscriber,
      });

      stash.setRecord({
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

      stash.setRecord({
        table,
        key: { field2: 1, field3: 2 },
        record: { field1: "world" },
      });

      expect(subscriber).toBeCalledTimes(1);
    });
  });

  describe("getTables", () => {
    it("should return an object of bound tables in the stash", () => {
      const stash = createStash();
      stash.registerTable({
        table: defineTable({
          label: "table1",
          namespaceLabel: "namespace1",
          schema: { field1: "uint32", field2: "address" },
          key: ["field1"],
        }),
      });
      stash.registerTable({
        table: defineTable({
          label: "table2",
          namespaceLabel: "namespace2",
          schema: { field1: "uint32", field2: "address" },
          key: ["field1"],
        }),
      });
      const tables = stash.getTables();

      expect(tables.namespace1.table1).toBeDefined();
      expect(tables.namespace2.table2).toBeDefined();
    });
  });
});
