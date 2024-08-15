import { attest } from "@ark/attest";
import { defineStore } from "@latticexyz/store";
import { describe, it } from "vitest";
import { createStore } from "../createStash";
import { setRecord } from "./setRecord";
import { deleteRecord } from "./deleteRecord";

describe("deleteRecord", () => {
  it("should delete a record from the store", () => {
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

    setRecord({
      store,
      table,
      key: { field2: 1, field3: 2 },
      record: { field1: "hello" },
    });

    setRecord({
      store,
      table,
      key: { field2: 3, field3: 1 },
      record: { field1: "world" },
    });

    deleteRecord({
      store,
      table,
      key: { field2: 1, field3: 2 },
    });

    attest(store.get().records).snap({
      namespace1: {
        table1: {
          "3|1": {
            field1: "world",
            field2: 3,
            field3: 1,
          },
        },
      },
    });
  });

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
      deleteRecord({
        store,
        table,
        // @ts-expect-error Property 'field3' is missing in type '{ field2: number; }'
        key: { field2: 1 },
      }),
    ).type.errors(`Property 'field3' is missing in type '{ field2: number; }'`);

    attest(() =>
      deleteRecord({
        store,
        table,
        // @ts-expect-error Type 'string' is not assignable to type 'number'
        key: { field2: 1, field3: "invalid" },
      }),
    ).type.errors(`Type 'string' is not assignable to type 'number'`);
  });
});
