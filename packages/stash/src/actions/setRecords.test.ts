import { defineStore } from "@latticexyz/store";
import { describe, it } from "vitest";
import { createStore } from "../createStash";
import { setRecords } from "./setRecords";
import { attest } from "@ark/attest";

describe("setRecords", () => {
  it("should add the records to the table", () => {
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
    setRecords({
      store,
      table,
      records: [
        { field1: "hello", field2: 1, field3: 2 },
        { field1: "world", field2: 2, field3: 1 },
      ],
    });

    attest(store.get().records).snap({
      namespace1: {
        table1: {
          "1|2": { field1: "hello", field2: 1, field3: 2 },
          "2|1": { field1: "world", field2: 2, field3: 1 },
        },
      },
    });
  });

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
      setRecords({
        store,
        table,
        // @ts-expect-error Type '{ field1: string; }' is missing the following properties from type
        records: [{ field1: "" }],
      }),
    )
      .throws("Provided key is missing field field2.")
      .type.errors(`Type '{ field1: string; }' is missing the following properties from type`);

    attest(() =>
      setRecords({
        store,
        table,
        // @ts-expect-error Type 'number' is not assignable to type 'string'.
        records: [{ field1: 1, field2: 1, field3: 2 }],
      }),
    ).type.errors(`Type 'number' is not assignable to type 'string'.`);
  });
});
