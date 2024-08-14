import { attest } from "@ark/attest";
import { defineStore } from "@latticexyz/store";
import { describe, it } from "vitest";
import { createStore } from "../createStore";
import { defineTable } from "@latticexyz/store/config/v2";

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

      attest(store.getConfig({ table: { label: "test", namespace: "namespace" } })).equals(table);
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

      attest<{ [encodedKey: string]: { player: number; match: number } }>(store.getKeys({ store, table })).snap({
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
});
