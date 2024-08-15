import { attest } from "@ark/attest";
import { defineStore } from "@latticexyz/store";
import { describe, expect, it, vi } from "vitest";
import { createStore } from "../createStore";
import { defineTable } from "@latticexyz/store/config/v2";
import { In } from "../queryFragments";
import { Hex } from "viem";
import { runQuery } from "../actions";
import { StoreRecords, getQueryConfig } from "../common";

describe("store with default actions", () => {
  describe("decodeKey", () => {
    it("should decode an encoded table key", () => {
      const config = defineStore({
        namespace: "namespace1",
        tables: {
          table1: {
            schema: { field1: "string", field2: "uint32", field3: "uint256" },
            key: ["field2", "field3"],
          },
        },
      });
      const store = createStore(config);
      const table = config.namespaces.namespace1.tables.table1;
      const key = { field2: 1, field3: 2n };
      store.setRecord({ table, key, record: { field1: "hello" } });

      const encodedKey = store.encodeKey({ table, key });
      attest<typeof key>(store.decodeKey({ table, encodedKey })).equals({ field2: 1, field3: 2n });
    });
  });

  describe("deleteRecord", () => {
    it("should throw a type error if an invalid key is provided", () => {
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
        store.deleteRecord({
          table,
          // @ts-expect-error Property 'field3' is missing in type '{ field2: number; }'
          key: { field2: 1 },
        }),
      ).type.errors(`Property 'field3' is missing in type '{ field2: number; }'`);

      attest(() =>
        store.deleteRecord({
          table,
          // @ts-expect-error Type 'string' is not assignable to type 'number'
          key: { field2: 1, field3: "invalid" },
        }),
      ).type.errors(`Type 'string' is not assignable to type 'number'`);
    });
  });

  describe("encodeKey", () => {
    it("should throw a type error if an invalid key is provided", () => {
      const config = defineStore({
        tables: {
          test: {
            schema: { field1: "uint32", field2: "uint256", field3: "string" },
            key: ["field1", "field2"],
          },
        },
      });

      const store = createStore(config);
      const table = config.tables.test;

      attest(() =>
        store.encodeKey({
          table,
          // @ts-expect-error Property 'field2' is missing in type '{ field1: number; }'
          key: {
            field1: 1,
          },
        }),
      )
        .throws(`Provided key is missing field field2.`)
        .type.errors(`Property 'field2' is missing in type '{ field1: number; }'`);

      attest(
        store.encodeKey({
          table,
          key: {
            field1: 1,
            // @ts-expect-error Type 'string' is not assignable to type 'bigint'.
            field2: "invalid",
          },
        }),
      ).type.errors(`Type 'string' is not assignable to type 'bigint'.`);
    });
  });

  describe("getConfig", () => {
    it("should return the config of the given table", () => {
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        codegen: _,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        deploy: __,
        ...table
      } = defineTable({
        namespace: "namespace",
        label: "test",
        schema: { field1: "address", field2: "string" },
        key: ["field1"],
      });

      const store = createStore();
      store.registerTable({ table });

      attest(store.getConfig({ table: { label: "test", namespaceLabel: "namespace" } })).equals(table);
    });
  });

  describe("getKeys", () => {
    it("should return the key map of a table", () => {
      const config = defineStore({
        tables: {
          test: {
            schema: {
              player: "int32",
              match: "int32",
              x: "int32",
              y: "int32",
            },
            key: ["player", "match"],
          },
        },
      });
      const table = config.tables.test;
      const store = createStore(config);

      store.setRecord({ table, key: { player: 1, match: 2 }, record: { x: 3, y: 4 } });
      store.setRecord({ table, key: { player: 5, match: 6 }, record: { x: 7, y: 8 } });

      attest<{ [encodedKey: string]: { player: number; match: number } }>(store.getKeys({ table })).snap({
        "1|2": { player: 1, match: 2 },
        "5|6": { player: 5, match: 6 },
      });
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
        key: { field2: 2, field3: 1 },
        record: { field1: "world" },
      });

      attest<{ field1: string; field2: number; field3: number }>(
        store.getRecord({
          table,
          key: { field2: 2, field3: 1 },
        }),
      ).snap({ field1: "world", field2: 2, field3: 1 });
    });

    it("should throw a type error if the key type doesn't match", () => {
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
        store.getRecord({
          table,
          // @ts-expect-error Property 'field3' is missing in type '{ field2: number; }'
          key: { field2: 1 },
        }),
      ).type.errors(`Property 'field3' is missing in type '{ field2: number; }'`);

      attest(() =>
        store.getRecord({
          table,
          // @ts-expect-error Type 'string' is not assignable to type 'number'
          key: { field2: 1, field3: "invalid" },
        }),
      ).type.errors(`Type 'string' is not assignable to type 'number'`);
    });
  });

  describe("getRecords", () => {
    it("should get all records from a table", () => {
      const config = defineStore({
        tables: {
          test: {
            schema: {
              player: "int32",
              match: "int32",
              x: "uint256",
              y: "uint256",
            },
            key: ["player", "match"],
          },
        },
      });
      const table = config.tables.test;
      const store = createStore(config);

      store.setRecord({ table, key: { player: 1, match: 2 }, record: { x: 3n, y: 4n } });
      store.setRecord({ table, key: { player: 5, match: 6 }, record: { x: 7n, y: 8n } });

      attest<{ [encodedKey: string]: { player: number; match: number; x: bigint; y: bigint } }>(
        store.getRecords({ table }),
      ).equals({
        "1|2": { player: 1, match: 2, x: 3n, y: 4n },
        "5|6": { player: 5, match: 6, x: 7n, y: 8n },
      });

      attest<{ [encodedKey: string]: { player: number; match: number; x: bigint; y: bigint } }>(
        store.getRecords({ table, keys: [{ player: 1, match: 2 }] }),
      ).equals({
        "1|2": { player: 1, match: 2, x: 3n, y: 4n },
      });
    });
  });

  describe("getTables", () => {
    it("should return bound tables for each registered table in the store", () => {
      const config = defineStore({
        namespaces: {
          namespace1: {
            tables: {
              table1: {
                schema: { a: "address", b: "uint256", c: "uint32" },
                key: ["a"],
              },
            },
          },
          namespace2: {
            tables: {
              table2: {
                schema: { a: "address", b: "uint256", c: "uint32" },
                key: ["a"],
              },
            },
          },
        },
      });
      const store = createStore(config);
      const tables = store.getTables();

      attest<"namespace1" | "namespace2", keyof typeof tables>();

      attest<"table2", keyof typeof tables.namespace2>();

      attest(tables).snap({
        namespace1: {
          table1: {
            decodeKey: "Function(decodeKey)",
            deleteRecord: "Function(deleteRecord)",
            encodeKey: "Function(encodeKey)",
            getConfig: "Function(getConfig)",
            getKeys: "Function(getKeys)",
            getRecord: "Function(getRecord)",
            getRecords: "Function(getRecords)",
            setRecord: "Function(setRecord)",
            setRecords: "Function(setRecords)",
            subscribe: "Function(subscribe)",
          },
        },
        namespace2: {
          table2: {
            decodeKey: "Function(decodeKey1)",
            deleteRecord: "Function(deleteRecord1)",
            encodeKey: "Function(encodeKey1)",
            getConfig: "Function(getConfig1)",
            getKeys: "Function(getKeys1)",
            getRecord: "Function(getRecord1)",
            getRecords: "Function(getRecords1)",
            setRecord: "Function(setRecord1)",
            setRecords: "Function(setRecords1)",
            subscribe: "Function(subscribe1)",
          },
        },
      });
    });
  });

  describe("runQuery", () => {
    const config = defineStore({
      namespaces: {
        namespace1: {
          tables: {
            Position: {
              schema: { player: "bytes32", x: "int32", y: "int32" },
              key: ["player"],
            },
          },
        },
        namespace2: {
          tables: {
            Health: {
              schema: { player: "bytes32", health: "uint32" },
              key: ["player"],
            },
          },
        },
      },
    });
    const store = createStore(config);
    const { Position } = config.namespaces.namespace1.tables;
    const { Health } = config.namespaces.namespace2.tables;

    it("should include `records` only if the `includeRecords` option is provided", () => {
      const query = [In(Position)] as const;
      const resultWithoutRecords = store.runQuery({ query });
      attest<never | undefined, (typeof resultWithoutRecords)["records"]>();

      const resultWithRecords = store.runQuery({ query, options: { includeRecords: true } });
      attest<StoreRecords<getQueryConfig<typeof query>>, (typeof resultWithRecords)["records"]>();
    });

    it("should type the `records` in the result based on tables in the query", () => {
      const result = runQuery({ store, query: [In(Position), In(Health)], options: { includeRecords: true } });

      attest<"namespace1" | "namespace2", keyof (typeof result)["records"]>();
      attest<"Position", keyof (typeof result)["records"]["namespace1"]>();
      attest<"Health", keyof (typeof result)["records"]["namespace2"]>();
      attest<{ player: Hex; x: number; y: number }, (typeof result)["records"]["namespace1"]["Position"][string]>();
      attest<{ player: Hex; health: number }, (typeof result)["records"]["namespace2"]["Health"][string]>();
    });
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

  describe("subscribeStore", () => {
    it("should notify subscriber of any store change", () => {
      const config = defineStore({
        namespaces: {
          namespace1: {
            tables: {
              table1: {
                schema: { a: "address", b: "uint256", c: "uint32" },
                key: ["a"],
              },
            },
          },
        },
      });

      const store = createStore(config);
      const subscriber = vi.fn();

      store.subscribeStore({ subscriber });

      store.setRecord({ table: config.tables.namespace1__table1, key: { a: "0x00" }, record: { b: 1n, c: 2 } });

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenNthCalledWith(1, {
        config: {},
        records: {
          namespace1: {
            table1: {
              "0x00": {
                prev: undefined,
                current: { a: "0x00", b: 1n, c: 2 },
              },
            },
          },
        },
      });
    });
  });

  describe("subscribeTable", () => {
    it("should notify subscriber of table change", () => {
      const config = defineStore({
        namespaces: {
          namespace1: {
            tables: {
              table1: {
                schema: { a: "address", b: "uint256", c: "uint32" },
                key: ["a"],
              },
            },
          },
          namespace2: {
            tables: {
              table2: {
                schema: { a: "address", b: "uint256", c: "uint32" },
                key: ["a"],
              },
            },
          },
        },
      });

      const table1 = config.namespaces.namespace1.tables.table1;
      const table2 = config.namespaces.namespace2.tables.table2;
      const store = createStore(config);
      const subscriber = vi.fn();

      store.subscribeTable({ table: table1, subscriber });

      store.setRecord({ table: table1, key: { a: "0x00" }, record: { b: 1n, c: 2 } });

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenNthCalledWith(1, {
        "0x00": {
          prev: undefined,
          current: { a: "0x00", b: 1n, c: 2 },
        },
      });

      // Expect unrelated updates to not notify subscribers
      store.setRecord({ table: table2, key: { a: "0x01" }, record: { b: 1n, c: 2 } });
      expect(subscriber).toHaveBeenCalledTimes(1);

      store.setRecord({ table: table1, key: { a: "0x00" }, record: { b: 1n, c: 3 } });

      expect(subscriber).toHaveBeenCalledTimes(2);
      expect(subscriber).toHaveBeenNthCalledWith(2, {
        "0x00": {
          prev: { a: "0x00", b: 1n, c: 2 },
          current: { a: "0x00", b: 1n, c: 3 },
        },
      });
    });
  });
});
