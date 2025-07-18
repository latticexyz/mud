import { attest } from "@ark/attest";
import { defineStore } from "@latticexyz/store";
import { describe, expect, it, vi } from "vitest";
import { createStash } from "../createStash";
import { defineTable } from "@latticexyz/store/internal";
import { In } from "../queryFragments";
import { Hex } from "viem";
import { StoreRecords, getQueryConfig } from "../common";
import { runQuery } from "../actions/runQuery";
import { isDefined } from "@latticexyz/common/utils";

describe("stash with default actions", () => {
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
      const stash = createStash(config);
      const table = config.namespaces.namespace1.tables.table1;
      const key = { field2: 1, field3: 2n };
      stash.setRecord({ table, key, value: { field1: "hello" } });

      const encodedKey = stash.encodeKey({ table, key });
      attest<typeof key>(stash.decodeKey({ table, encodedKey })).equals({ field2: 1, field3: 2n });
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

      const stash = createStash(config);

      attest(() =>
        stash.deleteRecord({
          table,
          // @ts-expect-error Property 'field3' is missing in type '{ field2: number; }'
          key: { field2: 1 },
        }),
      ).type.errors(`Property 'field3' is missing in type '{ field2: number; }'`);

      attest(() =>
        stash.deleteRecord({
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

      const stash = createStash(config);
      const table = config.tables.test;

      attest(() =>
        stash.encodeKey({
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
        stash.encodeKey({
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
        namespaceLabel: "namespace",
        label: "test",
        schema: { field1: "address", field2: "string" },
        key: ["field1"],
      });

      const stash = createStash();
      stash.registerTable({ table });

      attest(stash.getTableConfig({ table: { label: "test", namespaceLabel: "namespace" } })).equals(table);
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
      const stash = createStash(config);

      stash.setRecord({ table, key: { player: 1, match: 2 }, value: { x: 3, y: 4 } });
      stash.setRecord({ table, key: { player: 5, match: 6 }, value: { x: 7, y: 8 } });

      attest<{ [encodedKey: string]: { player: number; match: number } }>(stash.getKeys({ table })).snap({
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

      const stash = createStash(config);

      stash.setRecord({
        table,
        key: { field2: 2, field3: 1 },
        value: { field1: "world" },
      });

      attest<{ field1: string; field2: number; field3: number } | undefined>(
        stash.getRecord({
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

      const stash = createStash(config);

      attest(() =>
        stash.getRecord({
          table,
          // @ts-expect-error Property 'field3' is missing in type '{ field2: number; }'
          key: { field2: 1 },
        }),
      ).type.errors(`Property 'field3' is missing in type '{ field2: number; }'`);

      attest(() =>
        stash.getRecord({
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
      const stash = createStash(config);

      stash.setRecord({ table, key: { player: 1, match: 2 }, value: { x: 3n, y: 4n } });
      stash.setRecord({ table, key: { player: 5, match: 6 }, value: { x: 7n, y: 8n } });

      attest<{ [encodedKey: string]: { player: number; match: number; x: bigint; y: bigint } }>(
        stash.getRecords({ table }),
      ).equals({
        "1|2": { player: 1, match: 2, x: 3n, y: 4n },
        "5|6": { player: 5, match: 6, x: 7n, y: 8n },
      });

      attest<{ [encodedKey: string]: { player: number; match: number; x: bigint; y: bigint } }>(
        stash.getRecords({ table, keys: [{ player: 1, match: 2 }] }),
      ).equals({
        "1|2": { player: 1, match: 2, x: 3n, y: 4n },
      });
    });
  });

  describe("getTables", () => {
    it("should return bound tables for each registered table in the stash", () => {
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
      const stash = createStash(config);
      const tables = stash.getTables();

      attest<"namespace1" | "namespace2", keyof typeof tables>();

      attest<"table2", keyof typeof tables.namespace2>();

      attest(tables).snap({
        namespace1: {
          table1: {
            decodeKey: "Function(decodeKey)",
            deleteRecord: "Function(deleteRecord)",
            encodeKey: "Function(encodeKey)",
            getTableConfig: "Function(getTableConfig)",
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
            getTableConfig: "Function(getTableConfig1)",
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
    const stash = createStash(config);
    const { Position } = config.namespaces.namespace1.tables;
    const { Health } = config.namespaces.namespace2.tables;

    it("should include `records` only if the `includeRecords` option is provided", () => {
      const query = [In(Position)] as const;
      const resultWithoutRecords = stash.runQuery({ query });
      attest<never | undefined, (typeof resultWithoutRecords)["records"]>();

      const resultWithRecords = stash.runQuery({ query, options: { includeRecords: true } });
      attest<StoreRecords<getQueryConfig<typeof query>>, (typeof resultWithRecords)["records"]>();
    });

    it("should type the `records` in the result based on tables in the query", () => {
      const result = runQuery({ stash, query: [In(Position), In(Health)], options: { includeRecords: true } });

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
      const stash = createStash(config);

      attest(() =>
        stash.setRecord({
          table,
          // @ts-expect-error Property 'field2' is missing in type '{ field3: number; }'
          key: { field3: 2 },
          value: { field1: "" },
        }),
      )
        .throws("Provided key is missing field field2.")
        .type.errors(`Property 'field2' is missing in type '{ field3: number; }`);

      attest(() =>
        stash.setRecord({
          table,
          // @ts-expect-error Type 'string' is not assignable to type 'number'.
          key: { field2: 1, field3: "invalid" },
          value: { field1: "" },
        }),
      ).type.errors(`Type 'string' is not assignable to type 'number'.`);

      attest(() =>
        stash.setRecord({
          table,
          key: { field2: 1, field3: 2 },
          // @ts-expect-error Type 'number' is not assignable to type 'string'.
          value: { field1: 1 },
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
      const stash = createStash(config);

      attest(() =>
        stash.setRecords({
          table,
          // @ts-expect-error Type '{ field1: string; }' is missing the following properties from type
          records: [{ field1: "" }],
        }),
      )
        .throws("Provided key is missing field field2.")
        .type.errors(`Type '{ field1: string; }' is missing the following properties from type`);

      attest(() =>
        stash.setRecords({
          table,
          // @ts-expect-error Type 'number' is not assignable to type 'string'.
          records: [{ field1: 1, field2: 1, field3: 2 }],
        }),
      ).type.errors(`Type 'number' is not assignable to type 'string'.`);
    });
  });

  describe("subscribeStash", () => {
    it("should notify subscriber of any stash change", () => {
      vi.useFakeTimers({ toFake: ["queueMicrotask"] });

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

      const stash = createStash(config);
      const subscriber = vi.fn();

      stash.subscribeStash({ subscriber });

      stash.setRecord({ table: config.tables.namespace1__table1, key: { a: "0x00" }, value: { b: 1n, c: 2 } });
      vi.advanceTimersToNextTimer();

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenNthCalledWith(1, {
        type: "records",
        updates: [
          {
            table: config.tables.namespace1__table1,
            key: { a: "0x00" },
            previous: undefined,
            current: { a: "0x00", b: 1n, c: 2 },
          },
        ],
      });
    });
  });

  describe("subscribeTable", () => {
    it("should notify subscriber of table change", () => {
      vi.useFakeTimers({ toFake: ["queueMicrotask"] });

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
      const stash = createStash(config);
      const subscriber = vi.fn();

      stash.subscribeTable({ table: table1, subscriber });

      stash.setRecord({ table: table1, key: { a: "0x00" }, value: { b: 1n, c: 2 } });
      vi.advanceTimersToNextTimer();

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenNthCalledWith(1, [
        {
          table: table1,
          key: { a: "0x00" },
          previous: undefined,
          current: { a: "0x00", b: 1n, c: 2 },
        },
      ]);

      // Expect unrelated updates to not notify subscribers
      stash.setRecord({ table: table2, key: { a: "0x01" }, value: { b: 1n, c: 2 } });
      vi.advanceTimersToNextTimer();

      expect(subscriber).toHaveBeenCalledTimes(1);

      stash.setRecord({ table: table1, key: { a: "0x00" }, value: { b: 1n, c: 3 } });
      vi.advanceTimersToNextTimer();

      expect(subscriber).toHaveBeenCalledTimes(2);
      expect(subscriber).toHaveBeenNthCalledWith(2, [
        {
          table: table1,
          key: { a: "0x00" },
          previous: { a: "0x00", b: 1n, c: 2 },
          current: { a: "0x00", b: 1n, c: 3 },
        },
      ]);
    });
  });

  describe("registerDerivedTable", () => {
    it("should register a derived table", () => {
      const stash = createStash();
      const inputTable = defineTable({
        label: "inputTable",
        namespaceLabel: "namespace1",
        schema: { field1: "uint32", field2: "address" },
        key: ["field1"],
      });
      const derivedTable = defineTable({
        label: "derivedTable",
        namespaceLabel: "namespace1",
        schema: { field1: "uint32", field2: "address" },
        key: ["field2"],
      });
      stash.registerTable({ table: inputTable });
      stash.setRecord({ table: inputTable, key: { field1: 1 }, value: { field2: "0x123" } });
      stash.registerDerivedTable({
        derivedTable: {
          input: inputTable,
          label: "derivedTable",
          deriveUpdates: (update) => {
            return [
              // Remove the previous derived record
              update.previous && {
                table: derivedTable,
                key: { field2: update.previous.field2 },
                value: undefined,
              },
              // Add the new derived record
              update.current && {
                table: derivedTable,
                key: { field2: update.current.field2 },
                value: update.current,
              },
            ].filter(isDefined);
          },
        },
      });

      // After registering the derived table, the derived table should have been hydrated with the derived state
      attest(stash.get().records).equals({
        namespace1: {
          inputTable: { "1": { field1: 1, field2: "0x123" } },
          derivedTable: { "0x123": { field1: 1, field2: "0x123" } },
        },
      });

      // Setting a new record on the source table should update the derived table
      stash.setRecord({ table: inputTable, key: { field1: 2 }, value: { field2: "0x456" } });
      attest(stash.get().records).equals({
        namespace1: {
          inputTable: {
            "1": { field1: 1, field2: "0x123" },
            "2": { field1: 2, field2: "0x456" },
          },
          derivedTable: {
            "0x123": { field1: 1, field2: "0x123" },
            "0x456": { field1: 2, field2: "0x456" },
          },
        },
      });
    });
  });

  describe("registerIndex", () => {
    it("should register an index", () => {
      const stash = createStash();
      const inputTable = defineTable({
        label: "inputTable",
        namespaceLabel: "namespace1",
        schema: { field1: "uint32", field2: "address" },
        key: ["field1"],
      });
      stash.registerTable({ table: inputTable });
      stash.setRecord({ table: inputTable, key: { field1: 1 }, value: { field2: "0x123" } });
      stash.registerIndex({
        table: inputTable,
        key: ["field2"],
      });

      // After registering the index, the index should have been hydrated with the indexed state
      attest(stash.get().records).equals({
        namespace1: {
          inputTable: { "1": { field1: 1, field2: "0x123" } },
        },
        __stash_index: {
          inputTable__field2: { "0x123": { field1: 1, field2: "0x123" } },
        },
      });

      // Setting a new record on the source table should update the index
      stash.setRecord({ table: inputTable, key: { field1: 2 }, value: { field2: "0x456" } });
      attest(stash.get().records).equals({
        namespace1: {
          inputTable: {
            "1": { field1: 1, field2: "0x123" },
            "2": { field1: 2, field2: "0x456" },
          },
        },
        __stash_index: {
          inputTable__field2: {
            "0x123": { field1: 1, field2: "0x123" },
            "0x456": { field1: 2, field2: "0x456" },
          },
        },
      });
    });
  });
});
