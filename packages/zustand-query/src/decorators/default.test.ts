import { attest } from "@ark/attest";
import { defineStore } from "@latticexyz/store";
import { describe, it } from "vitest";
import { createStore } from "../createStore";

describe("store with default actions", () => {
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
